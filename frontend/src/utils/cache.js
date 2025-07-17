class Cache {
  constructor(prefix = 'app_cache_') {
    this.prefix = prefix
    this.storage = window.localStorage
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   * @param {number} [expiration] - 过期时间（毫秒）
   */
  set(key, value, expiration = null) {
    const data = {
      value,
      timestamp: Date.now()
    }

    if (expiration) {
      data.expiration = expiration
    }

    this.storage.setItem(this.prefix + key, JSON.stringify(data))
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @param {*} [defaultValue] - 默认值
   * @returns {*} 缓存值
   */
  get(key, defaultValue = null) {
    const data = this.storage.getItem(this.prefix + key)

    if (!data) {
      return defaultValue
    }

    try {
      const parsed = JSON.parse(data)
      
      // 检查是否过期
      if (parsed.expiration && Date.now() - parsed.timestamp > parsed.expiration) {
        this.remove(key)
        return defaultValue
      }

      return parsed.value
    } catch (error) {
      console.error('Cache parse error:', error)
      return defaultValue
    }
  }

  /**
   * 移除缓存
   * @param {string} key - 缓存键
   */
  remove(key) {
    this.storage.removeItem(this.prefix + key)
  }

  /**
   * 清除所有缓存
   */
  clear() {
    const keys = Object.keys(this.storage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key)
      }
    })
  }

  /**
   * 获取所有缓存键
   * @returns {string[]} 缓存键数组
   */
  keys() {
    const keys = Object.keys(this.storage)
    return keys.filter(key => key.startsWith(this.prefix))
      .map(key => key.slice(this.prefix.length))
  }

  /**
   * 检查缓存是否存在
   * @param {string} key - 缓存键
   * @returns {boolean}
   */
  has(key) {
    return this.storage.getItem(this.prefix + key) !== null
  }

  /**
   * 获取缓存大小（字节）
   * @returns {number}
   */
  size() {
    let size = 0
    const keys = this.keys()
    keys.forEach(key => {
      const item = this.storage.getItem(this.prefix + key)
      size += item.length * 2 // UTF-16 编码每个字符占2字节
    })
    return size
  }

  /**
   * 批量设置缓存
   * @param {Object} data - 键值对
   * @param {number} [expiration] - 过期时间（毫秒）
   */
  setMultiple(data, expiration = null) {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value, expiration)
    })
  }

  /**
   * 批量获取缓存
   * @param {string[]} keys - 缓存键数组
   * @param {*} [defaultValue] - 默认值
   * @returns {Object} 键值对
   */
  getMultiple(keys, defaultValue = null) {
    const result = {}
    keys.forEach(key => {
      result[key] = this.get(key, defaultValue)
    })
    return result
  }

  /**
   * 批量移除缓存
   * @param {string[]} keys - 缓存键数组
   */
  removeMultiple(keys) {
    keys.forEach(key => this.remove(key))
  }

  /**
   * 获取缓存统计信息
   * @returns {Object}
   */
  stats() {
    const keys = this.keys()
    return {
      count: keys.length,
      size: this.size(),
      keys
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    const keys = this.keys()
    keys.forEach(key => {
      const data = this.storage.getItem(this.prefix + key)
      try {
        const parsed = JSON.parse(data)
        if (parsed.expiration && Date.now() - parsed.timestamp > parsed.expiration) {
          this.remove(key)
        }
      } catch (error) {
        console.error('Cache cleanup error:', error)
      }
    })
  }
}

// 创建默认实例
const cache = new Cache()

export default cache 