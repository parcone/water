import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store'
import cache from './cache'

// 默认配置
const DEFAULT_CONFIG = {
  retries: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  cacheExpiration: 5 * 60 * 1000, // 5分钟
  backgroundRefresh: true
}

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api',
  timeout: 15000
})

/**
 * 延迟执行
 * @param {number} ms 延迟时间（毫秒）
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 生成缓存键
 * @param {Object} config 请求配置
 * @returns {string} 缓存键
 */
const generateCacheKey = (config) => {
  const { url, params, data, method } = config
  return `request_${method}_${url}_${JSON.stringify(params || {})}_${JSON.stringify(data || {})}`
}

/**
 * 检查是否应该重试请求
 * @param {Error} error 错误对象
 * @param {Object} config 请求配置
 * @returns {boolean}
 */
const shouldRetry = (error, config) => {
  const { retries = DEFAULT_CONFIG.retries, retryStatusCodes = DEFAULT_CONFIG.retryStatusCodes } = config
  const currentRetry = config.__retryCount || 0
  
  if (currentRetry >= retries) {
    return false
  }

  if (error.response) {
    return retryStatusCodes.includes(error.response.status)
  }

  return error.code === 'ECONNABORTED' || !error.response
}

// 请求拦截器
service.interceptors.request.use(
  async config => {
    // 从缓存中获取token
    const token = store.getters['auth/token']
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // 处理请求缓存
    if (config.cache) {
      const cacheKey = generateCacheKey(config)
      const cachedData = cache.get(cacheKey)

      if (cachedData) {
        // 如果启用后台刷新，异步更新缓存
        if (config.backgroundRefresh !== false && DEFAULT_CONFIG.backgroundRefresh) {
          setTimeout(() => {
            service({
              ...config,
              cache: false,
              __isBackgroundRefresh: true
            }).then(response => {
              cache.set(cacheKey, response.data, config.cacheExpiration || DEFAULT_CONFIG.cacheExpiration)
            })
          }, 0)
        }

        // 返回缓存数据
        config.cancelToken = new axios.CancelToken(cancel => {
          cancel('Request canceled due to cache hit')
        })
        return {
          ...config,
          __fromCache: true,
          __cacheData: cachedData
        }
      }

      config.__cacheKey = cacheKey
    }

    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 处理从缓存返回的数据
    if (response.config.__fromCache) {
      return response.config.__cacheData
    }

    const { data } = response

    // 处理业务错误
    if (data.code && data.code !== 200) {
      // 如果是后台刷新，不显示错误消息
      if (!response.config.__isBackgroundRefresh) {
        ElMessage.error(data.message || '请求失败')
      }
      return Promise.reject(new Error(data.message || '请求失败'))
    }

    // 缓存响应数据
    if (response.config.cache && response.config.__cacheKey) {
      cache.set(
        response.config.__cacheKey,
        data,
        response.config.cacheExpiration || DEFAULT_CONFIG.cacheExpiration
      )
    }

    return data
  },
  async error => {
    // 处理缓存导致的请求取消
    if (axios.isCancel(error)) {
      return Promise.resolve(error.message)
    }

    const config = error.config

    // 处理重试逻辑
    if (shouldRetry(error, config)) {
      config.__retryCount = (config.__retryCount || 0) + 1
      const retryDelay = config.retryDelay || DEFAULT_CONFIG.retryDelay
      await delay(retryDelay * config.__retryCount)
      return service(config)
    }

    // 处理网络错误
    let message = '网络错误'
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请登录'
          store.dispatch('auth/logout')
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 429:
          message = '请求过于频繁，请稍后再试'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = error.response.data.message || `请求失败 ${error.response.status}`
      }
    } else if (error.request) {
      message = '服务器无响应'
    } else {
      message = error.message
    }

    // 如果是后台刷新，不显示错误消息
    if (!config.__isBackgroundRefresh) {
      ElMessage.error(message)
    }
    
    return Promise.reject(error)
  }
)

/**
 * 请求方法封装
 * @param {Object} config - axios配置
 * @param {boolean} [config.cache=false] - 是否启用缓存
 * @param {number} [config.cacheExpiration] - 缓存过期时间（毫秒）
 * @param {boolean} [config.backgroundRefresh] - 是否启用后台刷新
 * @param {number} [config.retries] - 重试次数
 * @param {number} [config.retryDelay] - 重试延迟（毫秒）
 * @param {number[]} [config.retryStatusCodes] - 需要重试的状态码
 * @returns {Promise}
 */
const request = async (config) => {
  try {
    const response = await service(config)
    return response
  } catch (error) {
    return Promise.reject(error)
  }
}

// 请求方法别名
request.get = (url, config = {}) => request({ ...config, method: 'get', url })
request.post = (url, data, config = {}) => request({ ...config, method: 'post', url, data })
request.put = (url, data, config = {}) => request({ ...config, method: 'put', url, data })
request.delete = (url, config = {}) => request({ ...config, method: 'delete', url })

// 批量请求
request.all = axios.all
request.spread = axios.spread

export default request 