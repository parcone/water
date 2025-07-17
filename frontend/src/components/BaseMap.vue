<!-- 基础地图组件 -->
<template>
  <div class="base-map-container">
    <div ref="mapContainer" class="map-container"></div>
    <div class="map-overlay" v-if="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>
    <div class="map-controls">
      <el-button-group>
        <el-button :icon="Plus" @click="handleZoom(1)" circle></el-button>
        <el-button :icon="Minus" @click="handleZoom(-1)" circle></el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Plus, Minus, Loading } from '@element-plus/icons-vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  center: {
    type: Array,
    default: () => [39.916527, 116.397128] // 默认北京中心坐标
  },
  zoom: {
    type: Number,
    default: 13
  },
  markers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['marker-click', 'map-ready'])

const mapContainer = ref(null)
const loading = ref(true)
let map = null

// 初始化地图
onMounted(async () => {
  if (!mapContainer.value) return

  // 创建地图实例
  map = L.map(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    zoomControl: false
  })

  // 添加图层
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  // 添加标记
  updateMarkers()

  loading.value = false
  emit('map-ready', map)
})

// 更新标记
const updateMarkers = () => {
  if (!map) return

  // 清除现有标记
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer)
    }
  })

  // 添加新标记
  props.markers.forEach(marker => {
    const { position, icon, popup } = marker
    
    const markerInstance = L.marker(position, {
      icon: icon ? L.icon(icon) : undefined
    }).addTo(map)

    if (popup) {
      markerInstance.bindPopup(popup)
    }

    markerInstance.on('click', () => {
      emit('marker-click', marker)
    })
  })
}

// 缩放控制
const handleZoom = (delta) => {
  if (!map) return
  map.setZoom(map.getZoom() + delta)
}

// 组件销毁时清理
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

// 监听属性变化
watch(() => props.markers, updateMarkers, { deep: true })
watch(() => props.center, (newCenter) => {
  if (map) {
    map.setView(newCenter, map.getZoom())
  }
})
watch(() => props.zoom, (newZoom) => {
  if (map) {
    map.setZoom(newZoom)
  }
})
</script>

<style scoped>
.base-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
}

.map-container {
  width: 100%;
  height: 100%;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.map-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

:deep(.leaflet-container) {
  background: #f5f7fa;
}

:deep(.leaflet-control-attribution) {
  background: rgba(255, 255, 255, 0.8);
  padding: 0 5px;
  border-radius: 4px;
}
</style> 