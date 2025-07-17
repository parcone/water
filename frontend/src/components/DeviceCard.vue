<!-- DeviceCard.vue -->
<template>
  <div class="device-card" :class="source.status">
    <div class="device-card-header">
      <div class="device-info">
        <div class="device-name">
          <el-icon :class="getDeviceIcon(source.type)"><Monitor /></el-icon>
          {{ source.name }}
        </div>
        <div class="device-meta">
          <el-tag :type="getDeviceTagType(source.type)" size="small">{{ source.type }}</el-tag>
          <span class="device-location">
            <el-icon><Location /></el-icon>
            {{ source.location }}
          </span>
        </div>
      </div>
      <div class="device-status">
        <span class="status-dot"></span>
        {{ getStatusText(source.status) }}
      </div>
    </div>
    
    <div class="device-metrics">
      <template v-if="source.metrics">
        <div v-for="(value, key) in filteredMetrics" :key="key" class="metric-item">
          <div class="metric-label">{{ getMetricLabel(key) }}</div>
          <div class="metric-value">
            {{ formatMetricValue(value, key) }}
          </div>
        </div>
      </template>
      <div v-else class="no-data">暂无数据</div>
    </div>

    <div class="device-card-footer">
      <div class="update-time">
        <el-icon><Timer /></el-icon>
        {{ formatTime(source.lastUpdate) }}
      </div>
      <div class="actions">
        <el-tooltip content="查看详情" placement="top">
          <el-button link type="primary" @click="$emit('view', source)">
            <el-icon><View /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="配置设备" placement="top">
          <el-button link type="primary" @click="$emit('config', source)">
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="删除设备" placement="top">
          <el-button link type="danger" @click="$emit('delete', source)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Monitor, Location, Timer, View, Setting, Delete } from '@element-plus/icons-vue'
import { formatTime } from '@/utils/format'

const props = defineProps({
  source: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view', 'config', 'delete'])

const filteredMetrics = computed(() => {
  if (!props.source.metrics) return {}
  // 只显示重要指标
  const importantKeys = ['temperature', 'humidity', 'ph', 'battery']
  return Object.entries(props.source.metrics)
    .filter(([key]) => importantKeys.includes(key))
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
})

// 辅助函数
function getDeviceIcon(type) {
  const icons = {
    '温湿度': 'Temperature',
    'PH值': 'Experiment',
    '视频监控': 'VideoCamera',
    '数据网关': 'Connection'
  }
  return icons[type] || 'Monitor'
}

function getDeviceTagType(type) {
  const types = {
    '温湿度': '',
    'PH值': 'warning',
    '视频监控': 'success',
    '数据网关': 'info'
  }
  return types[type] || 'info'
}

function getStatusText(status) {
  const statuses = {
    online: '在线',
    offline: '离线',
    error: '异常'
  }
  return statuses[status] || status
}

function getMetricLabel(key) {
  const labels = {
    temperature: '温度',
    humidity: '湿度',
    ph: 'PH值',
    battery: '电量'
  }
  return labels[key] || key
}

function formatMetricValue(value, key) {
  const units = {
    temperature: '°C',
    humidity: '%',
    ph: '',
    battery: '%'
  }
  return `${value}${units[key] || ''}`
}
</script>

<style lang="scss" scoped>
.device-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.online { border-left-color: #52c41a; }
  &.offline { border-left-color: #ff4d4f; }
  &.error { border-left-color: #faad14; }
}

.device-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.device-info {
  flex: 1;
  min-width: 0;

  .device-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 8px;
    
    .el-icon {
      font-size: 18px;
      color: #40a9ff;
    }
  }

  .device-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .device-location {
      display: flex;
      align-items: center;
      gap: 4px;
      color: rgba(255, 255, 255, 0.65);
      font-size: 13px;
      
      .el-icon {
        font-size: 14px;
      }
    }
  }
}

.device-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .online & .status-dot { background: #52c41a; }
  .offline & .status-dot { background: #ff4d4f; }
  .error & .status-dot { background: #faad14; }
}

.device-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
  
  .metric-item {
    padding: 6px 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    
    .metric-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.45);
      margin-bottom: 2px;
    }
    
    .metric-value {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
    }
  }
  
  .no-data {
    grid-column: 1 / -1;
    text-align: center;
    color: rgba(255, 255, 255, 0.45);
    font-size: 13px;
    padding: 8px;
  }
}

.device-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .update-time {
    display: flex;
    align-items: center;
    gap: 4px;
    color: rgba(255, 255, 255, 0.45);
    font-size: 12px;
    
    .el-icon {
      font-size: 14px;
    }
  }
  
  .actions {
    display: flex;
    gap: 8px;
    
    .el-button {
      padding: 4px;
      
      .el-icon {
        font-size: 16px;
      }
    }
  }
}
</style> 