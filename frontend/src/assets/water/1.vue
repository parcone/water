<template>
  <div class="photo-timeline">
    <div class="timeline-header">
      <h2>图片时间轴</h2>
      <div class="controls">
        <el-button @click="playPause" :type="isPlaying ? 'warning' : 'primary'" size="small">
          <el-icon><VideoPlay v-if="!isPlaying" /><VideoPause v-else /></el-icon>
          {{ isPlaying ? '暂停' : '播放' }}
        </el-button>
        <el-button @click="reset" type="info" size="small">
          <el-icon><RefreshRight /></el-icon>
          重置
        </el-button>
        <el-select v-model="playSpeed" size="small" @change="updatePlaySpeed" style="width: 100px">
          <el-option label="0.5秒" :value="500" />
          <el-option label="1秒" :value="1000" />
          <el-option label="2秒" :value="2000" />
          <el-option label="3秒" :value="3000" />
        </el-select>
      </div>
    </div>

    <div class="image-container">
      <div v-if="currentPhoto" class="image-wrapper">
        <el-image
          :src="getImageUrl(currentPhoto.filename)"
          :alt="currentPhoto.displayName"
          class="timeline-image"
          fit="contain"
          :loading="isLoading ? 'eager' : 'lazy'"
          :preview-src-list="[getImageUrl(currentPhoto.filename)]"
        >
          <template #placeholder>
            <div class="image-placeholder">
              <el-icon><Picture /></el-icon>
              <span>加载中...</span>
            </div>
          </template>
          <template #error>
            <div class="image-error">
              <el-icon><PictureRounded /></el-icon>
              <span>加载失败</span>
            </div>
          </template>
        </el-image>
        <div class="image-info">
          <div class="date-info">{{ currentPhoto.displayName }}</div>
          <div class="progress-info">{{ currentIndex + 1 }} / {{ photos.length }}</div>
        </div>
      </div>
      <div v-else class="no-image">
        <el-empty :image-size="200" description="暂无图片数据" />
      </div>
    </div>

    <div class="timeline-slider">
      <el-slider
        v-model="currentIndex"
        :min="0"
        :max="Math.max(0, photos.length - 1)"
        :disabled="photos.length === 0"
        show-stops
        :step="1"
      />
      <div class="slider-labels">
        <span v-if="photos.length > 0">{{ photos[0]?.displayName }}</span>
        <span v-if="photos.length > 1">{{ photos[photos.length - 1]?.displayName }}</span>
      </div>
    </div>

    <div class="timeline-info">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="当前时间">
          {{ currentPhoto?.displayName || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="总图片数">
          {{ photos.length }}
        </el-descriptions-item>
        <el-descriptions-item label="播放状态">
          <el-tag :type="isPlaying ? 'success' : 'info'">
            {{ isPlaying ? '播放中' : '已暂停' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  VideoPlay,
  VideoPause,
  RefreshRight,
  Picture,
  PictureRounded
} from '@element-plus/icons-vue'

// 使用require.context一次性加载所有图片
function loadAllImages() {
  const allImages = {}

  try {
    // 修正图片路径
    const requireImages = require.context('./photos', false, /\.(png|jpg|jpeg|gif)$/i)
    requireImages.keys().forEach(key => {
      const filename = key.replace('./', '')
      allImages[filename] = requireImages(key)
    })
    return allImages
  } catch (error) {
    console.error('加载图片失败:', error)
    return {}
  }
}

// 解析文件名中的日期信息
function parseImageFilename(filename) {
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
  return {
    filename,
    displayName: filename.replace(/\.(png|jpg|jpeg|gif)$/i, ''),
    sortKey: 0
  }
}

export default {
  name: 'PhotoTimeline',
  components: {
    VideoPlay,
    VideoPause,
    RefreshRight,
    Picture,
    PictureRounded
  },
  setup() {
    const photos = ref([])
    const currentIndex = ref(0)
    const isPlaying = ref(false)
    const playSpeed = ref(2000)
    const playInterval = ref(null)
    const isLoading = ref(false)
    const allImages = ref({})
    const preloadedImages = ref(new Set())

    const currentPhoto = computed(() => photos.value[currentIndex.value] || null)
    
    const nextPhotos = computed(() => {
      const start = currentIndex.value + 1
      const end = Math.min(start + 3, photos.value.length)
      return photos.value.slice(start, end)
    })

    async function initializeComponent() {
      isLoading.value = true
      try {
        allImages.value = loadAllImages()
        await generatePhotoData()
        await preloadNextBatch()
      } catch (error) {
        console.error('初始化失败:', error)
      } finally {
        isLoading.value = false
      }
    }

    async function generatePhotoData() {
      const imageFilenames = Object.keys(allImages.value)
      if (imageFilenames.length === 0) return

      photos.value = imageFilenames
        .map(filename => parseImageFilename(filename))
        .sort((a, b) => a.sortKey - b.sortKey)
    }

    function getImageUrl(filename) {
      return allImages.value[filename] || ''
    }

    async function preloadNextBatch() {
      if (nextPhotos.value.length === 0) return

      for (const photo of nextPhotos.value) {
        if (!preloadedImages.value.has(photo.filename)) {
          const img = new Image()
          img.src = getImageUrl(photo.filename)
          img.onload = () => {
            preloadedImages.value.add(photo.filename)
          }
        }
      }
    }

    function playPause() {
      if (isPlaying.value) {
        stopPlay()
      } else {
        startPlay()
      }
    }

    function startPlay() {
      if (photos.value.length === 0) return

      isPlaying.value = true
      playInterval.value = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % photos.value.length
      }, playSpeed.value)
    }

    function stopPlay() {
      isPlaying.value = false
      if (playInterval.value) {
        clearInterval(playInterval.value)
        playInterval.value = null
      }
    }

    function updatePlaySpeed() {
      if (isPlaying.value) {
        stopPlay()
        startPlay()
      }
    }

    function reset() {
      stopPlay()
      currentIndex.value = 0
    }

    onMounted(() => {
      initializeComponent()
    })

    onBeforeUnmount(() => {
      stopPlay()
    })

    return {
      photos,
      currentIndex,
      isPlaying,
      playSpeed,
      isLoading,
      currentPhoto,
      getImageUrl,
      playPause,
      reset,
      updatePlaySpeed
    }
  }
}
</script>

<style lang="scss" scoped>
.photo-timeline {
  height: 100%;
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  display: flex;
  flex-direction: column;
  gap: 20px;

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-light);

    h2 {
      margin: 0;
      font-size: 18px;
      color: var(--el-text-color-primary);
    }

    .controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .image-container {
    flex: 1;
    min-height: 0;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background: var(--el-bg-color-page);

    .image-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;

      .timeline-image {
        flex: 1;
        width: 100%;
        object-fit: contain;
        background: var(--el-bg-color-page);
      }

      .image-info {
        padding: 12px;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        backdrop-filter: blur(8px);
      }
    }

    .image-placeholder,
    .image-error {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--el-text-color-secondary);
      gap: 12px;

      .el-icon {
        font-size: 48px;
      }
    }

    .no-image {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .timeline-slider {
    padding: 0 16px;

    .slider-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
  }

  .timeline-info {
    :deep(.el-descriptions) {
      --el-descriptions-item-bordered-label-background: var(--el-bg-color-page);
    }
  }
}
</style>