class ImagePreloader {
  constructor() {
    this.cache = new Map()
    this.loading = new Map()
    this.maxCacheSize = 100
    this.supportsWebP = this.checkWebPSupport()
    this.onPreviewLoad = null // Initialize the callback
  }

  /**
   * 检查浏览器是否支持WebP
   * @returns {Promise<boolean>}
   */
  async checkWebPSupport() {
    try {
      const webP = new Image()
      return new Promise((resolve) => {
        webP.onload = () => resolve(true)
        webP.onerror = () => resolve(false)
        webP.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
      })
    } catch {
      return false
    }
  }

  /**
   * 获取最适合的图片URL
   * @param {string} src - 原始图片地址
   * @returns {string} 优化后的图片地址
   */
  async getOptimizedImageUrl(src) {
    // 当前项目未生成 WebP 版本资源，直接返回原图，避免无效的 404 请求
    return src
  }

  /**
   * 预加载单张图片
   * @param {string} src - 图片地址
   * @param {Object} [options] - 配置选项
   * @param {boolean} [options.lowQualityPreview=true] - 是否加载低质量预览
   * @returns {Promise<HTMLImageElement>}
   */
  async load(src, { lowQualityPreview = true } = {}) {
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src))
    }

    if (this.loading.has(src)) {
      return this.loading.get(src)
    }

    const optimizedSrc = await this.getOptimizedImageUrl(src)
    
    const promise = new Promise((resolve, reject) => {
      const img = new Image()
      
      if (lowQualityPreview) {
        // 先加载低质量预览图
        const previewSrc = this.getLowQualityPreview(optimizedSrc)
        const previewImg = new Image()
        previewImg.src = previewSrc
        previewImg.onload = () => {
          // 触发预览图加载完成回调
          if (this.onPreviewLoad) {
            this.onPreviewLoad(previewImg)
          }
        }
      }

      img.onload = () => {
        this.cache.set(src, img)
        this.loading.delete(src)
        this.cleanup()
        resolve(img)
      }

      img.onerror = () => {
        this.loading.delete(src)
        reject(new Error(`Failed to load image: ${src}`))
      }

      // 设置图片加载优先级
      img.loading = 'lazy'
      img.decoding = 'async'
      
      // 使用优化后的URL
      img.src = optimizedSrc
    })

    this.loading.set(src, promise)
    return promise
  }

  /**
   * 批量预加载图片
   * @param {string[]} sources - 图片地址数组
   * @param {Object} [options] - 配置选项
   * @param {number} [options.concurrency=5] - 并发数
   * @param {function} [options.onProgress] - 进度回调
   * @returns {Promise<HTMLImageElement[]>}
   */
  loadMultiple(sources, { concurrency = 5, onProgress } = {}) {
    const total = sources.length
    let loaded = 0
    let failed = 0

    // 创建加载队列
    const queue = sources.slice()
    const results = new Array(total)
    const loading = new Set()

    return new Promise((resolve, reject) => {
      const loadNext = () => {
        // 如果队列为空且没有正在加载的项，完成加载
        if (queue.length === 0 && loading.size === 0) {
          if (failed === total) {
            reject(new Error('All images failed to load'))
          } else {
            resolve(results.filter(Boolean))
          }
          return
        }

        // 如果队列不为空且未达到并发限制，继续加载
        while (queue.length > 0 && loading.size < concurrency) {
          const index = sources.length - queue.length
          const src = queue.shift()
          loading.add(src)

          this.load(src)
            .then(img => {
              results[index] = img
              loaded++
              loading.delete(src)

              if (onProgress) {
                onProgress({
                  loaded,
                  failed,
                  total,
                  percent: ((loaded + failed) / total) * 100
                })
              }

              loadNext()
            })
            .catch(error => {
              console.error(error)
              failed++
              loading.delete(src)

              if (onProgress) {
                onProgress({
                  loaded,
                  failed,
                  total,
                  percent: ((loaded + failed) / total) * 100
                })
              }

              loadNext()
            })
        }
      }

      loadNext()
    })
  }

  /**
   * 预加载图片序列
   * @param {string[]} sources - 图片地址数组
   * @param {Object} [options] - 配置选项
   * @param {number} [options.preloadCount=3] - 预加载数量
   * @param {function} [options.onProgress] - 进度回调
   * @returns {Promise<void>}
   */
  loadSequence(sources, { preloadCount = 3, onProgress } = {}) {
    let currentIndex = 0

    const loadNext = async () => {
      const endIndex = Math.min(currentIndex + preloadCount, sources.length)
      const batch = sources.slice(currentIndex, endIndex)

      if (batch.length === 0) return

      await this.loadMultiple(batch, {
        onProgress: progress => {
          if (onProgress) {
            onProgress({
              ...progress,
              currentIndex,
              totalImages: sources.length
            })
          }
        }
      })

      currentIndex = endIndex
      if (currentIndex < sources.length) {
        await loadNext()
      }
    }

    return loadNext()
  }

  /**
   * 获取低质量预览图URL
   * @param {string} src - 原始图片地址
   * @returns {string} 低质量预览图URL
   */
  getLowQualityPreview(src) {
    // 这里可以根据实际需求生成缩略图URL
    // 例如：添加查询参数来请求较小的图片
    return `${src}?quality=10&width=50`
  }

  /**
   * 设置预览图加载完成回调
   * @param {function} callback - 回调函数
   */
  setPreviewLoadCallback(callback) {
    this.onPreviewLoad = callback
  }

  /**
   * 检查图片是否已缓存
   * @param {string} src - 图片地址
   * @returns {boolean}
   */
  has(src) {
    return this.cache.has(src)
  }

  /**
   * 获取缓存的图片
   * @param {string} src - 图片地址
   * @returns {HTMLImageElement|undefined}
   */
  get(src) {
    return this.cache.get(src)
  }

  /**
   * 清除指定图片的缓存
   * @param {string} src - 图片地址
   */
  remove(src) {
    this.cache.delete(src)
  }

  /**
   * 清除所有缓存
   */
  clear() {
    this.cache.clear()
    this.loading.clear()
  }

  /**
   * 获取缓存统计信息
   * @returns {Object}
   */
  stats() {
    return {
      cached: this.cache.size,
      loading: this.loading.size,
      maxSize: this.maxCacheSize
    }
  }

  /**
   * 清理过期缓存（FIFO）
   */
  cleanup() {
    if (this.cache.size > this.maxCacheSize) {
      const deleteCount = this.cache.size - this.maxCacheSize
      const keys = Array.from(this.cache.keys())
      keys.slice(0, deleteCount).forEach(key => this.cache.delete(key))
    }
  }
}

// 创建默认实例
const imagePreloader = new ImagePreloader()

export default imagePreloader 