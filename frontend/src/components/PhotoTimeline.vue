<template>
  <div class="photo-timeline">
    <div class="timeline-header">
      <h2>图片时间轴</h2>
      <div class="controls">
        <button @click="playPause" class="control-btn">
          {{ isPlaying ? '⏸️ 暂停' : '▶️ 播放' }}
        </button>
        <button @click="reset" class="control-btn">🔄 重置</button>
        <div class="speed-control">
          <label>速度:</label>
          <select v-model="playSpeed" @change="updatePlaySpeed">
            <option value="500">0.5秒</option>
            <option value="1000">1秒</option>
            <option value="2000">2秒</option>
            <option value="3000">3秒</option>
          </select>
        </div>
      </div>
    </div>

    <div class="image-container">
      <div v-if="currentPhoto" class="image-wrapper">
        <img
            :src="getImageUrl(currentPhoto.filename)"
            :alt="currentPhoto.displayName"
            class="timeline-image"
            @load="onImageLoad"
            @error="onImageError"
        />
        <div class="image-info">
          <div class="date-info">{{ currentPhoto.displayName }}</div>
          <div class="progress-info">{{ currentIndex + 1 }} / {{ photos.length }}</div>
        </div>
      </div>
      <div v-else class="no-image">
        <p>{{ isLoading ? '加载中...' : '暂无图片数据' }}</p>
      </div>
    </div>

    <div class="timeline-slider">
      <div class="slider-container">
        <input
            type="range"
            :min="0"
            :max="Math.max(0, photos.length - 1)"
            :value="currentIndex"
            @input="onSliderChange"
            class="timeline-range"
            :disabled="photos.length === 0"
        />
        <div class="slider-labels">
          <span v-if="photos.length > 0">{{ photos[0]?.displayName }}</span>
          <span v-if="photos.length > 1">{{ photos[photos.length - 1]?.displayName }}</span>
        </div>
      </div>
    </div>

    <div class="timeline-info">
      <div class="info-item">
        <span class="label">当前时间:</span>
        <span class="value">{{ currentPhoto?.displayName || '无' }}</span>
      </div>
      <div class="info-item">
        <span class="label">总图片数:</span>
        <span class="value">{{ photos.length }}</span>
      </div>
      <div class="info-item">
        <span class="label">播放状态:</span>
        <span class="value">{{ isPlaying ? '播放中' : '已暂停' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import preloader from '@/utils/preload'

// 使用require.context一次性加载所有图片
function loadAllImages() {
  const allImages = {}

  try {
    // 精确匹配您的路径，只匹配 PNG 文件
    const requireImages = require.context('../assets/water/photos', false, /\.png$/i)

    console.log('发现的图片文件:', requireImages.keys())

    requireImages.keys().forEach(key => {
      // key格式: "./2025_01_SSM_20250101.png"
      const filename = key.replace('./', '')
      allImages[filename] = requireImages(key)
    })

    console.log('成功加载的图片:', Object.keys(allImages))
    return allImages
  } catch (error) {
    console.error('加载图片失败:', error)
    return {}
  }
}

// 解析文件名中的日期信息
function parseImageFilename(filename) {
  // 匹配格式: 2025_01_SSM_20250101.png
  const match = filename.match(/(\d{4})_(\d{2})_\w+_(\d{8})/)

  if (match) {
    const [, year, month, dateStr] = match
    const fullYear = dateStr.substring(0, 4)
    const fullMonth = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)

    return {
      filename,
      year: parseInt(fullYear),
      month: parseInt(fullMonth),
      day: parseInt(day),
      displayName: `${fullYear}年${fullMonth}月${day}日`,
      sortKey: parseInt(dateStr)
    }
  }

  // 备用解析方案
  const basicMatch = filename.match(/(\d{4})_(\d{2})/)
  if (basicMatch) {
    const [, year, month] = basicMatch
    return {
      filename,
      year: parseInt(year),
      month: parseInt(month),
      day: 1,
      displayName: `${year}年${month}月`,
      sortKey: parseInt(year) * 10000 + parseInt(month) * 100
    }
  }

  // 如果无法解析，使用文件名
  return {
    filename,
    year: 2025,
    month: 1,
    day: 1,
    displayName: filename.replace(/\.(png|jpg|jpeg|gif)$/i, ''),
    sortKey: 0
  }
}

export default {
  name: 'PhotoTimeline',
  components: {
    Loading
  },
  data() {
    return {
      photos: [],
      currentIndex: 0,
      isPlaying: false,
      playSpeed: 2000,
      playInterval: null,
      isLoading: false,
      allImages: {},
      preloadProgress: 0
    }
  },
  computed: {
    currentPhoto() {
      return this.photos[this.currentIndex] || null
    },
    nextPhotos() {
      const start = this.currentIndex + 1
      const end = Math.min(start + 3, this.photos.length)
      return this.photos.slice(start, end)
    }
  },
  watch: {
    currentIndex(newIndex) {
      // 预加载下一批图片
      this.preloadNextBatch()
    }
  },
  async mounted() {
    await this.initializeComponent()
  },
  beforeUnmount() {
    this.stopPlay()
  },
  methods: {
    async initializeComponent() {
      this.isLoading = true

      try {
        // 加载所有图片
        this.allImages = loadAllImages()

        // 生成照片数据
        await this.generatePhotoData()

        // 预加载第一批图片
        await this.preloadInitialBatch()

        console.log(`初始化完成，共加载 ${this.photos.length} 张图片`)
      } catch (error) {
        console.error('初始化失败:', error)
      } finally {
        this.isLoading = false
      }
    },

    async generatePhotoData() {
      const imageFilenames = Object.keys(this.allImages)

      if (imageFilenames.length === 0) {
        console.warn('没有找到图片文件')
        return
      }

      // 解析并排序图片
      this.photos = imageFilenames
          .map(filename => parseImageFilename(filename))
          .sort((a, b) => a.sortKey - b.sortKey)

      console.log('图片排序完成:', this.photos.map(p => p.displayName))
    },

    async preloadInitialBatch() {
      const initialBatch = this.photos.slice(0, 5) // 预加载前5张图片
      await this.preloadImages(initialBatch)
    },

    async preloadNextBatch() {
      if (this.nextPhotos.length > 0) {
        await this.preloadImages(this.nextPhotos)
      }
    },

    async preloadImages(photos) {
      const urls = photos.map(photo => this.getImageUrl(photo.filename))
      try {
        await preloader.loadMultiple(urls, {
          onProgress: ({ percent }) => {
            this.preloadProgress = percent
          }
        })
      } catch (error) {
        console.error('预加载图片失败:', error)
      }
    },

    getImageUrl(filename) {
      if (!filename || !this.allImages[filename]) {
        console.warn('图片不存在:', filename)
        return ''
      }

      return this.allImages[filename]
    },

    onSliderChange(event) {
      const newIndex = parseInt(event.target.value)
      if (newIndex >= 0 && newIndex < this.photos.length) {
        this.currentIndex = newIndex
        this.stopPlay()
      }
    },

    playPause() {
      if (this.isPlaying) {
        this.stopPlay()
      } else {
        this.startPlay()
      }
    },

    startPlay() {
      if (this.photos.length === 0) return

      this.isPlaying = true
      this.playInterval = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.photos.length
      }, this.playSpeed)
    },

    stopPlay() {
      this.isPlaying = false
      if (this.playInterval) {
        clearInterval(this.playInterval)
        this.playInterval = null
      }
    },

    updatePlaySpeed() {
      if (this.isPlaying) {
        this.stopPlay()
        this.startPlay()
      }
    },

    reset() {
      this.stopPlay()
      this.currentIndex = 0
    },

    onImageLoad() {
      // 图片加载成功
    },

    onImageError(event) {
      console.error('图片加载失败:', this.currentPhoto?.filename)
      console.error('错误详情:', event)
    }
  }
}
</script>

<style lang="scss" scoped>
.photo-timeline {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;

  .timeline-header {
    padding: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    h2 {
      display: none; // 隐藏重复的标题
    }
    
    .controls {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .control-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
      
      .speed-control {
        display: flex;
        align-items: center;
        gap: 8px;
        
        label {
          color: rgba(255, 255, 255, 0.7);
        }
        
        select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          
          option {
            background: #1a1a1a;
            color: #fff;
          }
        }
      }
    }
  }

  .image-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    
    .image-wrapper {
      height: 100%;
      position: relative;
      
      /* 使用 flex 居中并保持图片比例 */
      display: flex;
      justify-content: center;
      align-items: center;

      .timeline-image {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
      }
      
      .image-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 12px;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10px);
        color: #fff;
        
        .date-info {
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .progress-info {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
    
    .no-image {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .timeline-slider {
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    
    .slider-container {
      .timeline-range {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        outline: none;
        -webkit-appearance: none;
        
        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: #40a9ff;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            transform: scale(1.2);
          }
        }
      }
      
      .slider-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }

  .timeline-info {
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    
    .info-item {
      .label {
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        margin-bottom: 4px;
        display: block;
      }
      
      .value {
        color: #fff;
        font-size: 14px;
      }
    }
  }
}
</style> 