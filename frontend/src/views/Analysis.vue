<!-- Analysis.vue -->
<template>
  <div class="analysis-view">
    <!-- 页面标题 -->
    <div class="analysis-header">
      <h2>
        <el-icon class="title-icon"><DataLine /></el-icon>
        趋势分析
      </h2>
    </div>
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <div class="stat-card primary">
        <div class="stat-icon">
          <el-icon><DataLine /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ monitorStats[0].value }}</div>
          <div class="stat-label">在线设备</div>
          <div class="stat-trend up">
            <el-icon><ArrowUp /></el-icon>
            <span>{{ monitorStats[0].trend }}台</span>
          </div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ monitorStats[1].value }}</div>
          <div class="stat-label">离线设备</div>
          <div class="stat-trend down">
            <el-icon><ArrowDown /></el-icon>
            <span>{{ monitorStats[1].trend }}台</span>
          </div>
        </div>
      </div>

      <div class="stat-card error">
        <div class="stat-icon">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ monitorStats[2].value }}</div>
          <div class="stat-label">异常设备</div>
          <div class="stat-trend">
            <span class="status-text">无变化</span>
          </div>
        </div>
      </div>

      <div class="stat-card info">
        <div class="stat-icon">
          <el-icon><DataLine /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ monitorStats[3].value }}</div>
          <div class="stat-label">设备总数</div>
          <div class="stat-trend up">
            <el-icon><ArrowUp /></el-icon>
            <span>{{ monitorStats[3].trend }}台</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：设备管理 -->
      <div class="content-main">
        <div class="device-panel">
          <div class="panel-header">
            <div class="header-left">
              <h3>设备管理</h3>
              <el-button type="primary" size="small">
                <el-icon><Plus /></el-icon>
                新增设备
              </el-button>
            </div>
            <div class="header-right">
              <el-button-group>
                <el-button size="small" type="primary">
                  <el-icon><Grid /></el-icon>
                </el-button>
                <el-button size="small">
                  <el-icon><List /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>

          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索设备..."
              prefix-icon="Search"
              class="search-input"
            />
            <el-select v-model="statusFilter" placeholder="状态筛选" class="status-select">
              <el-option label="全部" value="" />
              <el-option label="在线" value="online" />
              <el-option label="离线" value="offline" />
            </el-select>
            <el-select v-model="typeFilter" placeholder="类型筛选" class="type-select">
              <el-option label="全部" value="" />
              <el-option label="传感器" value="sensor" />
              <el-option label="摄像头" value="camera" />
            </el-select>
          </div>

          <div class="device-grid">
            <div 
              v-for="(device, index) in filteredDevices" 
              :key="index"
              :class="['device-card', device.status]"
            >
              <div class="device-icon">
                <el-icon><component :is="getDeviceIcon(device.type)" /></el-icon>
              </div>
              <div class="device-status">
                <div :class="['status-dot', device.status]"></div>
                <span class="status-text">{{ getStatusText(device.status) }}</span>
              </div>
              <div class="device-info">
                <div class="device-name">{{ device.name }}</div>
                <div class="device-location">{{ device.location }}</div>
                <div class="device-data" v-if="device.data">{{ device.data }}</div>
                <div class="device-detail" v-if="device.detail">{{ device.detail }}</div>
              </div>
              <div class="device-actions">
                <el-button text size="small" @click="viewDevice(device)">
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
                <el-button text size="small" @click="configDevice(device)">
                  <el-icon><Setting /></el-icon>
                  配置
                </el-button>
                <el-button text size="small" type="danger" @click="deleteDevice(device)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：实时数据和告警 -->
      <div class="content-side">
        <!-- 实时数据 -->
        <div class="side-panel">
          <div class="panel-header">
            <h3>实时数据</h3>
            <el-select v-model="selectedDevice" size="small" placeholder="选择设备">
              <el-option label="传感器A" value="sensor-a" />
              <el-option label="传感器B" value="sensor-b" />
            </el-select>
          </div>
          
          <div class="realtime-legend">
            <div class="legend-item">
              <div class="legend-color temperature"></div>
              <span>温度</span>
            </div>
            <div class="legend-item">
              <div class="legend-color humidity"></div>
              <span>湿度</span>
            </div>
            <div class="legend-item">
              <div class="legend-color ph"></div>
              <span>PH值</span>
            </div>
          </div>

          <div class="realtime-chart">
            <base-e-chart 
              :options="realtimeChartOptions" 
              height="200px"
              :height="200"
              @chart-error="handleChartError"
            />
          </div>
        </div>

        <!-- 最近告警 -->
        <div class="side-panel">
          <div class="panel-header">
            <h3>最近告警</h3>
            <el-tag size="small" type="warning">3个未处理</el-tag>
          </div>
          <div class="alarm-list">
            <div 
              v-for="alert in alerts" 
              :key="alert.id"
              :class="['alarm-item', alert.level]"
            >
              <div class="alarm-icon">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="alarm-content">
                <div class="alarm-title">{{ alert.title }}</div>
                <div class="alarm-info">
                  <span class="alarm-location">{{ alert.location }}</span>
                  <span class="alarm-time">{{ alert.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import BaseEChart from '@/components/BaseEChart.vue'
import { 
  DataLine, Warning, Location, Check, ArrowUp, ArrowDown,
  Setting, Refresh, Search, CircleClose, Plus, Grid, List,
  View, Delete, Monitor, Camera
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 监测统计数据
const monitorStats = ref([
  {
    value: 12,
    label: '在线设备',
    type: 'primary',
    trend: 2
  },
  {
    value: 3,
    label: '离线设备',
    type: 'warning',
    trend: 1
  },
  {
    value: 1,
    label: '异常设备',
    type: 'error',
    trend: 0
  },
  {
    value: 16,
    label: '设备总数',
    type: 'info',
    trend: 1
  }
])

// 筛选条件
const searchKeyword = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const selectedDevice = ref('sensor-a')

// 设备列表
const devices = ref([
  {
    name: '传感器A',
    type: 'sensor',
    status: 'online',
    location: '田块1',
    data: '温度: 25°C, 湿度: 65%'
  },
  {
    name: '摄像头B',
    type: 'camera',
    status: 'offline',
    location: '田块2',
    detail: '离线中'
  }
])

// 过滤设备
const filteredDevices = computed(() => {
  return devices.value.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
                         device.location.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchesStatus = !statusFilter.value || device.status === statusFilter.value
    const matchesType = !typeFilter.value || device.type === typeFilter.value
    return matchesSearch && matchesStatus && matchesType
  })
})

// 实时数据图表配置
const realtimeChartOptions = computed(() => ({
  backgroundColor: 'transparent',
  animation: false,
  grid: {
    left: '5%',
    right: '5%',
    bottom: '15%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['17:10', '17:20', '17:30', '17:40', '17:50', '18:00'],
    axisLine: {
      lineStyle: { color: '#4a9eff' }
    },
    axisLabel: {
      color: '#8cc8ff'
    }
  },
  yAxis: {
    type: 'value',
    axisLine: {
      lineStyle: { color: '#4a9eff' }
    },
    axisLabel: {
      color: '#8cc8ff'
    },
    splitLine: {
      lineStyle: { color: '#2d5a87' }
    }
  },
  series: [
    {
      name: '温度',
      type: 'line',
      smooth: true,
      data: [20, 22, 25, 24, 23, 25],
      lineStyle: { color: '#4a9eff' },
      itemStyle: { color: '#4a9eff' }
    },
    {
      name: '湿度',
      type: 'line',
      smooth: true,
      data: [60, 65, 68, 64, 62, 65],
      lineStyle: { color: '#52c41a' },
      itemStyle: { color: '#52c41a' }
    },
    {
      name: 'PH值',
      type: 'line',
      smooth: true,
      data: [6.8, 6.9, 7.0, 6.8, 6.7, 6.8],
      lineStyle: { color: '#faad14' },
      itemStyle: { color: '#faad14' }
    }
  ]
}))

// 告警列表
const alerts = ref([
  { 
    id: 1,
    title: 'PH值超出正常范围',
    location: '田块1',
    time: '5分钟前',
    level: 'warning'
  },
  { 
    id: 2,
    title: '设备离线告警',
    location: '田块2',
    time: '10分钟前',
    level: 'error'
  }
])

// 工具函数
const getDeviceIcon = (type) => {
  return type === 'camera' ? Camera : Monitor
}

const getStatusText = (status) => {
  const statusMap = {
    online: '在线',
    offline: '离线',
    error: '异常'
  }
  return statusMap[status] || '未知'
}

// 设备操作
const viewDevice = (device) => {
  console.log('查看设备:', device)
}

const configDevice = (device) => {
  console.log('配置设备:', device)
}

const deleteDevice = (device) => {
  console.log('删除设备:', device)
}

// 错误处理
const handleChartError = (error) => {
  console.error('图表渲染错误:', error)
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.analysis-view {
  padding: 20px;
  height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  color: #ffffff;
  overflow-y: auto;

  /* 页面标题 */
  .analysis-header {
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      background: linear-gradient(45deg, #4a9eff, #6ac6ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);
      position: relative;

      .title-icon {
        vertical-align: middle;
        font-size: 28px;
        margin-right: 8px;
        color: #6ac6ff;
      }

      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -6px;
        width: 140px;
        height: 3px;
        background: linear-gradient(90deg, #4a9eff 0%, #6ac6ff 100%);
        border-radius: 2px;
      }
    }
  }

  /* 动画关键帧 */
  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(12px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  /* 应用动画 */
  .stats-section .stat-card,
  .content-main .device-card,
  .content-side .side-panel {
    animation: fadeInUp 0.6s ease both;
  }

  /* 响应式处理 */
  @media (max-width: 992px) {
    .main-content {
      grid-template-columns: 1fr;
      height: auto;
    }

    .content-side {
      flex-direction: row;
      overflow-x: auto;
      .side-panel {
        min-width: 320px;
      }
    }
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;

    .stat-card {
      background: rgba(26, 35, 50, 0.8);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(74, 158, 255, 0.2);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(74, 158, 255, 0.3);
      }

      &.primary {
        border-left: 4px solid #52c41a;
        .stat-icon { background: rgba(82, 196, 26, 0.2); color: #52c41a; }
      }

      &.warning {
        border-left: 4px solid #faad14;
        .stat-icon { background: rgba(250, 173, 20, 0.2); color: #faad14; }
      }

      &.error {
        border-left: 4px solid #ff4d4f;
        .stat-icon { background: rgba(255, 77, 79, 0.2); color: #ff4d4f; }
      }

      &.info {
        border-left: 4px solid #4a9eff;
        .stat-icon { background: rgba(74, 158, 255, 0.2); color: #4a9eff; }
      }

      .stat-icon {
        font-size: 28px;
        margin-right: 20px;
        padding: 16px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #ffffff;
        }

        .stat-label {
          color: #8cc8ff;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .stat-trend {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;

          &.up { color: #52c41a; }
          &.down { color: #ff4d4f; }

          .status-text {
            color: #8cc8ff;
          }
        }
      }
    }
  }

  .main-content {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 20px;
    height: calc(100vh - 200px);

    .content-main {
      .device-panel {
        background: rgba(26, 35, 50, 0.8);
        border-radius: 12px;
        padding: 24px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(74, 158, 255, 0.2);
        height: 100%;

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;

          .header-left {
            display: flex;
            align-items: center;
            gap: 20px;

            h3 {
              margin: 0;
              font-size: 18px;
              color: #ffffff;
            }
          }
        }

        .search-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;

          .search-input {
            flex: 1;
          }

          .status-select,
          .type-select {
            width: 120px;
          }
        }

        .device-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          max-height: calc(100% - 120px);
          overflow-y: auto;

          .device-card {
            background: rgba(15, 20, 25, 0.6);
            border-radius: 8px;
            padding: 20px;
            border: 1px solid rgba(74, 158, 255, 0.3);
            transition: all 0.3s ease;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 20px rgba(74, 158, 255, 0.2);
            }

            &.online {
              .device-icon { color: #52c41a; }
            }

            &.offline {
              .device-icon { color: #8c8c8c; }
            }

            .device-icon {
              font-size: 24px;
              margin-bottom: 12px;
            }

            .device-status {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 12px;

              .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;

                &.online { background: #52c41a; }
                &.offline { background: #8c8c8c; }
              }

              .status-text {
                font-size: 12px;
                color: #8cc8ff;
              }
            }

            .device-info {
              margin-bottom: 16px;

              .device-name {
                font-size: 16px;
                font-weight: 600;
                color: #ffffff;
                margin-bottom: 4px;
              }

              .device-location {
                font-size: 14px;
                color: #8cc8ff;
                margin-bottom: 8px;
              }

              .device-data,
              .device-detail {
                font-size: 12px;
                color: #a0a0a0;
              }
            }

            .device-actions {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;

              .el-button {
                font-size: 11px;
                padding: 4px 8px;
              }
            }
          }
        }
      }
    }

    .content-side {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .side-panel {
        background: rgba(26, 35, 50, 0.8);
        border-radius: 12px;
        padding: 20px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(74, 158, 255, 0.2);

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;

          h3 {
            margin: 0;
            font-size: 16px;
            color: #ffffff;
          }
        }

        .realtime-legend {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;

          .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #8cc8ff;

            .legend-color {
              width: 12px;
              height: 3px;
              border-radius: 2px;

              &.temperature { background: #4a9eff; }
              &.humidity { background: #52c41a; }
              &.ph { background: #faad14; }
            }
          }
        }

        .realtime-chart {
          height: 200px;
          background: rgba(15, 20, 25, 0.4);
          border-radius: 8px;
          padding: 8px;
        }

        .alarm-list {
          max-height: 300px;
          overflow-y: auto;

          .alarm-item {
            display: flex;
            align-items: flex-start;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 8px;
            background: rgba(15, 20, 25, 0.4);
            border: 1px solid rgba(74, 158, 255, 0.1);

            &.warning {
              border-left: 3px solid #faad14;
              .alarm-icon { color: #faad14; }
            }

            &.error {
              border-left: 3px solid #ff4d4f;
              .alarm-icon { color: #ff4d4f; }
            }

            .alarm-icon {
              margin-right: 12px;
              font-size: 16px;
              margin-top: 2px;
            }

            .alarm-content {
              flex: 1;

              .alarm-title {
                font-size: 14px;
                font-weight: 500;
                color: #ffffff;
                margin-bottom: 6px;
              }

              .alarm-info {
                font-size: 12px;
                color: #8cc8ff;
                display: flex;
                gap: 12px;
              }
            }
          }
        }
      }
    }
  }
}

// 深色主题样式覆盖
:deep(.el-input__wrapper) {
  background-color: rgba(15, 20, 25, 0.6) !important;
  border: 1px solid rgba(74, 158, 255, 0.3) !important;
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  color: #ffffff !important;
}

:deep(.el-select) {
  .el-input__wrapper {
    background-color: rgba(15, 20, 25, 0.6) !important;
    border: 1px solid rgba(74, 158, 255, 0.3) !important;
  }
}

:deep(.el-button) {
  background-color: rgba(74, 158, 255, 0.2) !important;
  border: 1px solid rgba(74, 158, 255, 0.4) !important;
  color: #4a9eff !important;

  &:hover {
    background-color: rgba(74, 158, 255, 0.3) !important;
    border-color: rgba(74, 158, 255, 0.6) !important;
  }

  &.el-button--primary {
    background-color: #4a9eff !important;
    border-color: #4a9eff !important;
    color: #ffffff !important;

    &:hover {
      background-color: #69b1ff !important;
      border-color: #69b1ff !important;
    }
  }
}

:deep(.el-button--text) {
  background-color: transparent !important;
  border: none !important;
  color: #4a9eff !important;

  &:hover {
    background-color: rgba(74, 158, 255, 0.1) !important;
  }
}

:deep(.el-tag) {
  background-color: rgba(250, 173, 20, 0.2) !important;
  border: 1px solid rgba(250, 173, 20, 0.4) !important;
  color: #faad14 !important;
}
</style>