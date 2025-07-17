<!-- Monitoring.vue -->
<template>
  <div class="monitoring-view">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <el-tooltip
        v-for="(stat, key) in deviceStats"
        :key="key"
        :content="getStatTooltip(key)"
        placement="top"
      >
        <div :class="['stat-card', key]">
          <div class="stat-icon">
            <el-icon><component :is="getStatIcon(key)" /></el-icon>
          </div>
          <div class="stat-content">
            <animated-number 
              :value="stat" 
              :duration="1000"
              class="stat-value"
            />
            <div class="stat-label">{{ getStatLabel(key) }}</div>
          </div>
          <div :class="['stat-trend', getTrendClass(key)]">
            <el-icon><component :is="getTrendIcon(key)" /></el-icon>
            <span>{{ getTrendText(key) }}</span>
          </div>
        </div>
      </el-tooltip>
    </div>

    <!-- 设备列表工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button 
            type="primary" 
            @click="showAddDevice"
            :loading="loading"
          >
            <el-icon><Plus /></el-icon>新增设备
          </el-button>
          <el-button 
            :class="{ active: viewMode === 'grid' }" 
            @click="viewMode = 'grid'"
          >
            <el-icon><Grid /></el-icon>
          </el-button>
          <el-button 
            :class="{ active: viewMode === 'table' }" 
            @click="viewMode = 'table'"
          >
            <el-icon><List /></el-icon>
          </el-button>
        </el-button-group>
        
        <el-button-group class="view-options">
          <el-tooltip content="刷新数据" placement="top">
            <el-button @click="refreshData" :loading="loading">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="导出数据" placement="top">
            <el-button @click="exportData" :loading="exporting">
              <el-icon><Download /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>
      
      <div class="toolbar-right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索设备..."
          prefix-icon="Search"
          clearable
          @input="debouncedSearch"
        >
          <template #append>
            <el-button @click="showAdvancedSearch">
              <el-icon><Setting /></el-icon>
            </el-button>
          </template>
        </el-input>
        
        <el-select
          v-model="filterStatus"
          placeholder="状态筛选"
          clearable
          @change="debouncedFilter"
        >
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            v-bind="option"
          >
            <div class="select-option">
              <span class="status-dot" :class="option.value"></span>
              {{ option.label }}
            </div>
          </el-option>
        </el-select>
        
        <el-select
          v-model="filterType"
          placeholder="类型筛选"
          clearable
          @change="debouncedFilter"
        >
          <el-option
            v-for="option in typeOptions"
            :key="option.value"
            v-bind="option"
          >
            <div class="select-option">
              <el-icon :class="getDeviceIcon(option.value)"></el-icon>
              {{ option.label }}
            </div>
          </el-option>
        </el-select>
      </div>
    </div>

    <!-- 高级搜索对话框 -->
    <el-dialog
      v-model="showAdvancedSearchDialog"
      title="高级搜索"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="searchForm"
        :model="advancedSearch"
        label-width="100px"
      >
        <el-form-item label="设备名称">
          <el-input v-model="advancedSearch.name" placeholder="支持模糊搜索" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="advancedSearch.type" placeholder="请选择" clearable>
            <el-option
              v-for="option in typeOptions"
              :key="option.value"
              v-bind="option"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备状态">
          <el-select v-model="advancedSearch.status" placeholder="请选择" clearable>
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              v-bind="option"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置">
          <el-input v-model="advancedSearch.location" placeholder="支持模糊搜索" />
        </el-form-item>
        <el-form-item label="更新时间">
          <el-date-picker
            v-model="advancedSearch.updateTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdvancedSearchDialog = false">取消</el-button>
        <el-button @click="resetAdvancedSearch">重置</el-button>
        <el-button type="primary" @click="applyAdvancedSearch">确定</el-button>
      </template>
    </el-dialog>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：设备列表和状态 -->
      <div class="content-main">
        <div class="panel device-list-panel">
          <div class="panel-header">
            <div class="header-left">
              <h3>设备管理</h3>
            </div>
            <div class="header-right">
            </div>
          </div>

          <!-- 网格视图 -->
          <div v-if="viewMode === 'grid'" class="device-grid">
            <el-scrollbar height="calc(100vh - 320px)">
              <div class="virtual-list-container">
                <div
                  v-for="device in paginatedDeviceList"
                  :key="device.name"
                  class="device-card"
                  :class="device.status"
                >
                  <div class="device-card-header">
                    <div class="device-icon">
                      <el-icon><component :is="getDeviceIcon(device.type)" /></el-icon>
                    </div>
                    <div class="device-status">
                      <span class="status-dot" :class="device.status"></span>
                      <span>{{ getStatusText(device.status) }}</span>
                    </div>
                  </div>
                  <div class="device-card-content">
                    <div class="device-name">{{ device.name }}</div>
                    <div class="device-type">{{ device.type }}</div>
                    <div class="device-location">{{ device.location }}</div>
                    <div class="device-data">
                      <span class="label">最近数据:</span>
                      <span class="value">{{ device.latestData }}</span>
                    </div>
                    <div class="device-data">
                      <span class="label">最后更新:</span>
                      <span class="value">{{ device.lastUpdate }}</span>
                    </div>
                  </div>
                  <div class="device-card-footer">
                    <el-button size="small" @click="viewDetail(device)">查看</el-button>
                    <el-button size="small" type="primary" @click="configDevice(device)">配置</el-button>
                    <el-button size="small" type="danger" @click="deleteDevice(device)">删除</el-button>
                  </div>
                </div>
              </div>
            </el-scrollbar>
            <el-pagination
              background
              layout="prev, pager, next"
              :total="filteredDeviceList.length"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handlePageChange"
              class="device-pagination"
            />
          </div>

          <!-- 表格视图 -->
          <el-scrollbar v-else height="calc(100vh - 320px)">
            <el-table 
              :data="paginatedDeviceList" 
              style="width: 100%"
              :header-cell-style="{ background: '#1a1a1a', color: '#fff' }"
              v-loading="loading"
              height="100%"
              :virtual-scrolling="true"
              :row-height="54"
            >
              <el-table-column prop="name" label="设备名称" min-width="200">
                <template #default="{ row }">
                  <div class="device-name">
                    <el-icon :class="getDeviceIcon(row.type)"><Monitor /></el-icon>
                    <span>{{ row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getDeviceTagType(row.type)">{{ row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <div class="status-indicator" :class="row.status">
                    <span class="status-dot"></span>
                    {{ getStatusText(row.status) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="location" label="位置" width="120" />
              <el-table-column label="最近数据" min-width="180">
                <template #default="{ row }">
                  <div class="latest-data">
                    <el-tooltip 
                      :content="row.lastUpdate" 
                      placement="top"
                    >
                      <span>{{ row.latestData }}</span>
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button-group>
                    <el-button size="small" @click="viewDetail(row)">
                      <el-icon><View /></el-icon>
                    </el-button>
                    <el-button size="small" type="primary" @click="configDevice(row)">
                      <el-icon><Setting /></el-icon>
                    </el-button>
                    <el-button size="small" type="danger" @click="deleteDevice(row)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              background
              layout="prev, pager, next"
              :total="filteredDeviceList.length"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handlePageChange"
              class="device-pagination"
            />
          </el-scrollbar>
        </div>

        <!-- 最近告警面板（移动到左侧） -->
        <div class="panel alert-panel" style="margin-top:24px">
          <div class="panel-header">
            <h3>最近告警</h3>
            <el-tag size="small" type="danger">{{ alerts.length }} 个未处理</el-tag>
          </div>
          <div class="alert-list">
            <div v-for="alert in alerts" 
                 :key="alert.id" 
                 class="alert-item"
                 :class="[alert.level, { unread: alert.unread } ]"
                 @click="handleAlert(alert)">
              <div class="alert-icon">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-info">
                  <span class="alert-device">{{ alert.device }}</span>
                  <span class="alert-time">{{ alert.time }}</span>
                </div>
              </div>
              <div class="alert-action">
                <el-button size="small" type="primary" link>处理</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：实时数据和告警 -->
      <div class="content-side">
        <!-- 智能预测面板 -->
        <div class="side-panel prediction-panel">
          <div class="panel-header">
            <h3>智能预测</h3>
            <div class="panel-actions">
              <el-select 
                v-model="selectedDevice" 
                size="small" 
                placeholder="选择设备"
                @change="updatePredictionData"
              >
                <el-option 
                  v-for="device in deviceList" 
                  :key="device.name" 
                  :label="device.name" 
                  :value="device.name"
                />
              </el-select>
              <el-select 
                v-model="predictionTimeRange" 
                size="small" 
                placeholder="预测时间范围"
                @change="updatePredictionData"
              >
                <el-option 
                  v-for="option in timeRangeOptions" 
                  :key="option.value" 
                  v-bind="option"
                />
              </el-select>
              <!-- 预测指标选择 -->
              <el-select 
                v-model="predictionMetric" 
                size="small" 
                placeholder="预测指标"
              >
                <el-option label="温度" value="temperature" />
                <el-option label="湿度" value="humidity" />
                <el-option label="PH值" value="ph" />
              </el-select>
            </div>
          </div>
          
          <div class="prediction-content">
            <div class="prediction-chart">
              <base-e-chart :options="predictionChartOptions" />
            </div>
            
            <!-- 图片时间轴 -->
            <div class="timeline-section">
              <div class="section-header">
                <h4>历史影像分析</h4>
              </div>
              <div class="timeline-wrapper">
                <PhotoTimeline />
              </div>
            </div>
            
            <div class="prediction-settings">
              <el-form :model="predictionConfig" label-width="120px" size="small">
                <el-form-item label="自动更新">
                  <el-switch v-model="predictionConfig.enableAutoUpdate" />
                </el-form-item>
                <el-form-item label="更新间隔(分钟)">
                  <el-input-number 
                    v-model="predictionConfig.updateInterval"
                    :min="1"
                    :max="60"
                    :disabled="!predictionConfig.enableAutoUpdate"
                  />
                </el-form-item>
                <el-form-item label="置信区间">
                  <el-select v-model="predictionConfig.confidenceInterval">
                    <el-option label="90%" value="0.90" />
                    <el-option label="95%" value="0.95" />
                    <el-option label="99%" value="0.99" />
                  </el-select>
                </el-form-item>
                <el-form-item label="显示置信区间">
                  <el-switch v-model="predictionConfig.showConfidenceBounds" />
                </el-form-item>
              </el-form>
            </div>
            
            <div class="prediction-metrics">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="metric-card">
                    <div class="metric-label">预测准确率</div>
                    <div class="metric-value">95.8%</div>
                    <div class="metric-trend positive">
                      <el-icon><ArrowUp /></el-icon>
                      <span>2.3%</span>
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="metric-card">
                    <div class="metric-label">预警提前量</div>
                    <div class="metric-value">30min</div>
                    <div class="metric-trend positive">
                      <el-icon><ArrowUp /></el-icon>
                      <span>5min</span>
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="metric-card">
                    <div class="metric-label">误报率</div>
                    <div class="metric-value">2.1%</div>
                    <div class="metric-trend negative">
                      <el-icon><ArrowDown /></el-icon>
                      <span>0.5%</span>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>

            <!-- 预测数据表格 -->
            <div class="prediction-table">
              <el-table :data="predictionTableData" height="240" stripe size="small">
                <el-table-column prop="time" label="时间" width="90" align="center" />
                <el-table-column prop="predicted" :label="metricLabel" align="right" />
              </el-table>
            </div>
          </div>
        </div>

        <!-- 实时数据图表 -->
        <div class="side-panel">
          <div class="panel-header">
            <h3>实时数据</h3>
            <el-select v-model="selectedDevice" size="small" placeholder="选择设备">
              <el-option 
                v-for="device in deviceList" 
                :key="device.name" 
                :label="device.name" 
                :value="device.name"
              />
            </el-select>
          </div>
          <div class="chart-container">
            <base-e-chart :options="chartOptions" />
          </div>
        </div>
      </div>
    </div>

    <!-- 设备详情对话框 -->
    <el-dialog 
      v-model="showDetail" 
      title="设备详情" 
      width="60%"
      destroy-on-close
    >
      <el-tabs v-if="currentDevice">
        <el-tab-pane label="基本信息">
          <div class="device-info">
            <div class="info-item">
              <span class="label">设备名称</span>
              <span class="value">{{ currentDevice.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">设备类型</span>
              <span class="value">{{ currentDevice.type }}</span>
            </div>
            <div class="info-item">
              <span class="label">当前状态</span>
              <span class="value">{{ getStatusText(currentDevice.status) }}</span>
            </div>
            <div class="info-item">
              <span class="label">安装位置</span>
              <span class="value">{{ currentDevice.location }}</span>
            </div>
            <div class="info-item">
              <span class="label">最近数据</span>
              <span class="value">{{ currentDevice.latestData }}</span>
            </div>
            <div class="info-item">
              <span class="label">最后更新</span>
              <span class="value">{{ currentDevice.lastUpdate }}</span>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="历史数据">
          <div class="history-data">
            <base-e-chart :options="historyChartOptions" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="告警记录">
          <el-table :data="deviceAlerts" style="width: 100%">
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="title" label="告警内容" />
            <el-table-column prop="level" label="级别" width="100">
              <template #default="{ row }">
                <el-tag :type="getAlertTagType(row.level)">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 新增设备对话框 -->
    <el-dialog 
      v-model="showAddDeviceDialog" 
      title="新增设备" 
      width="50%"
      destroy-on-close
    >
      <el-form 
        ref="deviceForm"
        :model="newDevice"
        :rules="deviceRules"
        label-width="100px"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="newDevice.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="newDevice.type" placeholder="请选择设备类型">
            <el-option label="温湿度传感器" value="温湿度" />
            <el-option label="PH值传感器" value="PH值" />
            <el-option label="视频监控" value="视频监控" />
            <el-option label="数据网关" value="数据网关" />
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="newDevice.location" placeholder="请输入安装位置" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDeviceDialog = false">取消</el-button>
        <el-button type="primary" @click="submitNewDevice">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onActivated, onDeactivated, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import { debounce } from 'lodash-es'
import cache from '@/utils/cache'
import BaseEChart from '@/components/BaseEChart.vue'
import { 
  Monitor, Connection, Warning, InfoFilled, Cpu, 
  ArrowUp, ArrowDown, Plus, View, Setting, Delete, Search,
  Grid, List, Refresh, Download, Timer, Location
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AnimatedNumber from '@/components/AnimatedNumber.vue'
import { exportToExcel } from '@/utils/excel'
import BaseMap from '@/components/BaseMap.vue'
import { formatTime, formatNumber } from '@/utils/format'
import PhotoTimeline from '@/components/PhotoTimeline.vue'

// chart update timer placeholder
let chartUpdateTimer = null

// WebSocket连接
const ws = ref(null)
const wsReconnectTimer = ref(null)
const wsReconnectAttempts = ref(0)
const MAX_RECONNECT_ATTEMPTS = 5

// 状态管理
const store = useStore()

// 加载状态
const loading = ref(false)

// 缓存设备数据
const DEVICE_CACHE_KEY = 'monitoring_devices'
const DEVICE_CACHE_EXPIRY = 5 * 60 * 1000 // 5分钟

// 防抖的搜索和筛选
const debouncedSearch = debounce((query) => {
  searchQuery.value = query
}, 300)

const debouncedFilter = debounce((status, type) => {
  filterStatus.value = status
  filterType.value = type
}, 300)

// 初始化WebSocket连接
const initWebSocket = () => {
  if (ws.value) return

  ws.value = new WebSocket(process.env.VUE_APP_WS_URL || 'ws://localhost:8082/api/ws/monitoring')
  
  ws.value.onopen = () => {
    console.log('WebSocket connected')
    wsReconnectAttempts.value = 0
  }

  ws.value.onmessage = (event) => {
    const data = JSON.parse(event.data)
    handleWebSocketMessage(data)
  }

  ws.value.onclose = () => {
    console.log('WebSocket disconnected')
    ws.value = null
    handleWebSocketReconnect()
  }

  ws.value.onerror = (error) => {
    console.error('WebSocket error:', error)
    ws.value?.close()
  }
}

// 处理WebSocket重连
const handleWebSocketReconnect = () => {
  if (wsReconnectAttempts.value >= MAX_RECONNECT_ATTEMPTS) {
    ElMessage.error('连接服务器失败，请刷新页面重试')
    return
  }

  if (wsReconnectTimer.value) {
    clearTimeout(wsReconnectTimer.value)
  }

  wsReconnectTimer.value = setTimeout(() => {
    wsReconnectAttempts.value++
    initWebSocket()
  }, 3000 * Math.min(wsReconnectAttempts.value + 1, 5))
}

// 处理WebSocket消息
const handleWebSocketMessage = (data) => {
  switch (data.type) {
    case 'deviceUpdate':
      updateDeviceData(data.payload)
      break
    case 'alert':
      handleNewAlert(data.payload)
      break
    case 'stats':
      updateDeviceStats(data.payload)
      break
  }
}

// 更新设备数据
const updateDeviceData = async (deviceData) => {
  const index = deviceList.value.findIndex(d => d.name === deviceData.name)
  if (index !== -1) {
    deviceList.value[index] = { ...deviceList.value[index], ...deviceData }
    // 更新缓存
    await cache.set(DEVICE_CACHE_KEY, deviceList.value, DEVICE_CACHE_EXPIRY)
  }
}

// 处理新告警
const handleNewAlert = (alert) => {
  alerts.value.unshift({
    ...alert,
    unread: true
  })
  
  // 限制告警列表长度
  if (alerts.value.length > 50) {
    alerts.value = alerts.value.slice(0, 50)
  }

  // 显示告警通知
  ElMessage({
    type: alert.level === 'error' ? 'error' : alert.level === 'warning' ? 'warning' : 'info',
    message: `${alert.device}: ${alert.title}`,
    duration: 5000
  })
}

// 更新设备统计数据
const updateDeviceStats = (stats) => {
  deviceStats.value = stats
}

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    // 尝试从缓存获取数据
    const cachedData = await cache.get(DEVICE_CACHE_KEY)
    if (cachedData) {
      deviceList.value = cachedData
      loading.value = false
      return
    }

    // 如果没有缓存，从服务器获取
    const response = await store.dispatch('device/fetchDevices')
    deviceList.value = response
    
    // 更新缓存
    await cache.set(DEVICE_CACHE_KEY, response, DEVICE_CACHE_EXPIRY)
  } catch (error) {
    ElMessage.error('获取设备数据失败')
    console.error('Failed to fetch devices:', error)
  } finally {
    loading.value = false
  }
}

// 预测相关数据
const predictionData = ref({
  temperature: [],
  humidity: [],
  ph: []
})

// 预测时间范围
const predictionTimeRange = ref('24h')
const timeRangeOptions = [
  { label: '24小时', value: '24h' },
  { label: '48小时', value: '48h' },
  { label: '7天', value: '7d' }
]

// 预测配置
const predictionConfig = ref({
  enableAutoUpdate: true,
  updateInterval: 30, // 分钟
  confidenceInterval: 0.95,
  showConfidenceBounds: true
})

// 预测图表配置
const predictionChartOptions = computed(() => {
  return {
    title: {
      text: '智能预测分析',
      left: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['实际值', '预测值', '置信区间'],
      bottom: 0,
      textStyle: {
        color: '#fff'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#fff'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#fff'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.1)'
        }
      }
    },
    series: [
      {
        name: '实际值',
        type: 'line',
        data: generateTimeData(25, 2),
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '预测值',
        type: 'line',
        data: generatePredictionData(25, 2),
        lineStyle: {
          type: 'dashed'
        },
        itemStyle: {
          color: '#52c41a'
        }
      },
      {
        name: '置信区间',
        type: 'line',
        data: generateConfidenceBounds(25, 2),
        lineStyle: {
          color: 'rgba(82, 196, 26, 0.2)'
        },
        areaStyle: {
          color: 'rgba(82, 196, 26, 0.1)'
        }
      }
    ]
  }
})

// 生成预测数据
function generatePredictionData(baseValue, variance) {
  const now = new Date()
  const data = []
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 3600000)
    const value = baseValue + Math.sin(i / 12 * Math.PI) * variance
    data.push([
      time.toISOString(),
      +value.toFixed(1)
    ])
  }
  return data
}

// 生成置信区间
function generateConfidenceBounds(baseValue, variance) {
  const now = new Date()
  const data = []
  const confidenceMultiplier = 1.96 // 95% 置信区间
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 3600000)
    const prediction = baseValue + Math.sin(i / 12 * Math.PI) * variance
    const uncertainty = Math.abs(Math.sin(i / 12 * Math.PI)) * variance * 0.5
    
    data.push([
      time.toISOString(),
      +(prediction - uncertainty * confidenceMultiplier).toFixed(1),
      +(prediction + uncertainty * confidenceMultiplier).toFixed(1)
    ])
  }
  return data
}

// 更新预测数据
const updatePredictionData = async () => {
  try {
    // TODO: 从后端获取预测数据
    const response = await store.dispatch('device/fetchPredictions', {
      timeRange: predictionTimeRange.value,
      deviceId: selectedDevice.value
    })
    
    predictionData.value = response
  } catch (error) {
    console.error('Failed to fetch prediction data:', error)
    ElMessage.error('获取预测数据失败')
  }
}

// 自动更新预测数据
let predictionUpdateTimer = null

const startPredictionUpdate = () => {
  if (predictionConfig.value.enableAutoUpdate) {
    predictionUpdateTimer = setInterval(() => {
      updatePredictionData()
    }, predictionConfig.value.updateInterval * 60 * 1000)
  }
}

const stopPredictionUpdate = () => {
  if (predictionUpdateTimer) {
    clearInterval(predictionUpdateTimer)
    predictionUpdateTimer = null
  }
}

// 监听配置变化
watch(() => predictionConfig.value.enableAutoUpdate, (newValue) => {
  if (newValue) {
    startPredictionUpdate()
  } else {
    stopPredictionUpdate()
  }
})

watch(() => predictionConfig.value.updateInterval, () => {
  if (predictionConfig.value.enableAutoUpdate) {
    stopPredictionUpdate()
    startPredictionUpdate()
  }
})

// 视图模式
const viewMode = ref('grid')

// 自动刷新
const autoRefresh = ref(true)
const refreshInterval = ref(30) // 秒
let refreshTimer = null

// 设备数据结构
const deviceList = ref([
  { 
    name: '传感器A', 
    type: '温湿度', 
    status: 'online', 
    location: '田块1',
    lastUpdate: '2024-03-15 14:30:00',
    metrics: {
      temperature: 25.5,
      humidity: 65.2,
      battery: 85
    }
  },
  { 
    name: '摄像头B', 
    type: '视频监控', 
    status: 'offline', 
    location: '田块2',
    lastUpdate: '2024-03-15 10:15:00',
    metrics: {
      resolution: '1080p',
      framerate: 30,
      battery: 45
    }
  },
  { 
    name: '网关C', 
    type: '数据网关', 
    status: 'online', 
    location: '田块3',
    lastUpdate: '2024-03-15 14:35:00',
    metrics: {
      throughput: 2.5,
      latency: 50,
      connections: 12
    }
  },
  { 
    name: '传感器D', 
    type: 'PH值', 
    status: 'error', 
    location: '田块4',
    lastUpdate: '2024-03-15 14:20:00',
    metrics: {
      ph: 8.5,
      temperature: 26.8,
      battery: 30
    }
  },
  // 添加更多测试数据
  ...Array.from({ length: 20 }, (_, i) => ({
    name: `传感器${String.fromCharCode(69 + i)}`,
    type: ['温湿度', 'PH值', '视频监控', '数据网关'][i % 4],
    status: ['online', 'offline', 'error'][i % 3],
    location: `田块${i + 5}`,
    lastUpdate: '2024-03-15 14:30:00',
    metrics: {
      temperature: 20 + Math.random() * 10,
      humidity: 50 + Math.random() * 30,
      battery: 30 + Math.random() * 70,
      ph: 6 + Math.random() * 2,
      throughput: 1 + Math.random() * 4,
      latency: 20 + Math.random() * 80,
      connections: Math.floor(5 + Math.random() * 20),
      resolution: ['720p', '1080p', '4K'][i % 3],
      framerate: [24, 30, 60][i % 3]
    }
  }))
])

// 设备配置
const showConfig = ref(false)
const configForm = ref(null)
const deviceConfig = ref({
  sampleRate: 60,
  thresholds: {
    temperature: { min: 20, max: 30 },
    humidity: { min: 40, max: 80 },
    ph: { min: 6.5, max: 7.5 }
  },
  autoCalibration: true,
  storage: 'local'
})

const configRules = {
  sampleRate: [
    { required: true, message: '请输入采集频率', trigger: 'blur' },
    { type: 'number', min: 1, max: 3600, message: '频率范围1-3600秒', trigger: 'blur' }
  ]
}

// 历史数据
const historyDateRange = ref([])
const selectedMetrics = ref([])
const availableMetrics = [
  { label: '温度', value: 'temperature' },
  { label: '湿度', value: 'humidity' },
  { label: 'PH值', value: 'ph' },
  { label: '电量', value: 'battery' }
]

const dateShortcuts = [
  {
    text: '最近一天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      return [start, end]
    }
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  }
]

// 计算属性
const currentDevice = computed(() => {
  return deviceList.value.find(d => d.name === selectedDevice.value)
})

const unreadAlerts = computed(() => {
  return alerts.value.filter(a => a.unread)
})

// 方法
const selectDevice = (device) => {
  selectedDevice.value = device.name
  updateDeviceCharts()
}

const toggleAutoRefresh = (value) => {
  if (value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  refreshTimer = setInterval(() => {
    refreshData()
  }, refreshInterval.value * 1000)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await updateDeviceData()
    if (selectedDevice.value) {
      updateDeviceCharts()
    }
  } catch (error) {
    console.error('Failed to refresh data:', error)
    ElMessage.error('刷新数据失败')
  } finally {
    loading.value = false
  }
}

const getMetricLabel = (key) => {
  const labels = {
    temperature: '温度',
    humidity: '湿度',
    ph: 'PH值',
    battery: '电量',
    throughput: '流量',
    latency: '延迟',
    connections: '连接数',
    framerate: '帧率',
    resolution: '分辨率'
  }
  return labels[key] || key
}

const getMetricUnit = (key) => {
  const units = {
    temperature: '°C',
    humidity: '%',
    ph: '',
    battery: '%',
    throughput: 'MB/s',
    latency: 'ms',
    connections: '',
    framerate: 'fps',
    resolution: ''
  }
  return units[key] || ''
}

const formatMetricValue = (value, key) => {
  if (typeof value === 'number') {
    return `${formatNumber(value)}${getMetricUnit(key)}`
  }
  return value
}

const getMetricStatus = (value, key) => {
  const thresholds = deviceConfig.value.thresholds[key]
  if (!thresholds) return { type: '', effect: 'plain', text: '正常' }

  if (value < thresholds.min) {
    return { type: 'danger', effect: 'dark', text: '过低' }
  }
  if (value > thresholds.max) {
    return { type: 'danger', effect: 'dark', text: '过高' }
  }
  return { type: 'success', effect: 'dark', text: '正常' }
}

const getMetricChartOptions = (key) => {
  return {
    grid: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 50
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: '#fff' } }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#fff' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [
      {
        type: 'line',
        data: generateMetricData(key),
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2 },
        areaStyle: {
          opacity: 0.1
        }
      }
    ]
  }
}

const generateMetricData = (key) => {
  const now = new Date()
  const data = []
  for (let i = 0; i < 60; i++) {
    const time = new Date(now - (59 - i) * 60000)
    const baseValue = currentDevice.value.metrics[key]
    const value = typeof baseValue === 'number' 
      ? baseValue + (Math.random() * 2 - 1)
      : baseValue
    data.push([time.getTime(), value])
  }
  return data
}

const loadHistoryData = async () => {
  if (!historyDateRange.value || !selectedDevice.value) return
  
  loading.value = true
  try {
    // TODO: 从后端获取历史数据
    const response = await store.dispatch('device/fetchHistory', {
      deviceId: selectedDevice.value,
      startTime: historyDateRange.value[0],
      endTime: historyDateRange.value[1],
      metrics: selectedMetrics.value
    })
    
    // 更新图表
    updateHistoryChart(response)
  } catch (error) {
    console.error('Failed to load history data:', error)
    ElMessage.error('获取历史数据失败')
  } finally {
    loading.value = false
  }
}

const updateHistoryChart = (data) => {
  // TODO: 更新历史数据图表
}

const viewHistory = (device) => {
  selectDevice(device)
  showDetail.value = true
  nextTick(() => {
    // 切换到历史数据标签
    // TODO: 实现标签切换
  })
}

const configDevice = (device) => {
  selectDevice(device)
  showConfig.value = true
}

const saveConfig = async () => {
  if (!configForm.value) return
  
  try {
    await configForm.value.validate()
    // TODO: 保存设备配置
    showConfig.value = false
    ElMessage.success('配置保存成功')
  } catch (error) {
    console.error('Config validation failed:', error)
  }
}

// 生命周期钩子
onMounted(() => {
  initWebSocket()
  initData()
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  if (ws.value) {
    ws.value.close()
    ws.value = null
  }
  if (wsReconnectTimer.value) {
    clearTimeout(wsReconnectTimer.value)
  }
  stopAutoRefresh()
})

// keep-alive 支持
onActivated(() => {
  initWebSocket()
  initData()
})

onDeactivated(() => {
  if (ws.value) {
    ws.value.close()
    ws.value = null
  }
})

  // 设备统计数据
const deviceStats = ref({
  online: deviceList.value.filter(d => d.status === 'online').length,
  offline: deviceList.value.filter(d => d.status === 'offline').length,
  error: deviceList.value.filter(d => d.status === 'error').length,
  total: deviceList.value.length
})



// 告警数据
const alerts = ref(
  Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: ['PH值超出正常范围', '设备离线', '数据传输异常'][i % 3],
    device: `设备-${i + 1}`,
    time: `${(i + 1) * 5} 分钟前`,
    level: ['error', 'warning', 'info'][i % 3],
    unread: i < 3
  }))
)

// 搜索和筛选
const searchQuery = ref('')
const filterStatus = ref('')
const filterType = ref('')

// 优化的计算属性
const filteredDeviceList = computed(() => {
  if (!deviceList.value) return []
  
  const query = searchQuery.value.toLowerCase()
  const status = filterStatus.value
  const type = filterType.value
  
  return deviceList.value.filter(device => {
    if (status && device.status !== status) return false
    if (type && device.type !== type) return false
    if (!query) return true
    
    return device.name.toLowerCase().includes(query) ||
           device.type.toLowerCase().includes(query) ||
           device.location.toLowerCase().includes(query)
  })
})

// 分页
const pageSize = ref(12)
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(filteredDeviceList.value.length / pageSize.value))

const paginatedDeviceList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredDeviceList.value.slice(start, start + pageSize.value)
})

function handlePageChange(page) {
  currentPage.value = page
}

// 设备详情相关
const showDetail = ref(false)
const deviceAlerts = ref([
  { time: '2024-03-15 14:20:00', title: 'PH值超出正常范围', level: 'error', status: '未处理' },
  { time: '2024-03-15 10:15:00', title: '设备离线', level: 'warning', status: '已处理' },
  { time: '2024-03-14 16:30:00', title: '数据异常', level: 'info', status: '已处理' }
])

// 新增设备相关
const showAddDeviceDialog = ref(false)
const deviceForm = ref(null)
const newDevice = ref({
  name: '',
  type: '',
  location: ''
})

const deviceRules = {
  name: [
    { required: true, message: '请输入设备名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择设备类型', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入安装位置', trigger: 'blur' }
  ]
}

// 图表相关
const selectedDevice = ref('')
/* 实时数据图表配置 */
const chartOptions = computed(() => {
  const device = currentDevice.value || deviceList.value[0]
  if (!device) return {}

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: 40,
      right: 20,
      bottom: 20,
      left: 50
    },
    legend: {
      data: ['温度', '湿度', 'PH值'],
      textStyle: { color: '#fff' }
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: '#fff' } },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#fff' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [
      {
        name: '温度',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: generateTimeData(25, 2)
      },
      {
        name: '湿度',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: generateTimeData(60, 5)
      },
      {
        name: 'PH值',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: generateTimeData(7, 0.5)
      }
    ]
  }
})

const historyChartOptions = computed(() => ({
  backgroundColor: 'transparent',
  title: {
    text: '历史数据趋势',
    textStyle: { color: '#fff' }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['温度', '湿度', 'PH值'],
    textStyle: { color: '#fff' },
    top: 30
  },
  grid: {
    top: 80,
    right: 20,
    bottom: 30,
    left: 50,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLabel: { color: '#fff' },
    axisLine: {
      lineStyle: {
        color: '#8c8c8c'
      }
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#fff' },
    splitLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    },
    axisLine: {
      lineStyle: {
        color: '#8c8c8c'
      }
    }
  },
  series: [
    {
      name: '温度',
      type: 'bar',
      data: [23, 24, 25, 23, 24, 26, 25],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: '#1890ff'
          }, {
            offset: 1,
            color: 'rgba(24, 144, 255, 0.3)'
          }]
        }
      }
    },
    {
      name: '湿度',
      type: 'bar',
      data: [65, 63, 68, 64, 62, 65, 66],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: '#52c41a'
          }, {
            offset: 1,
            color: 'rgba(82, 196, 26, 0.3)'
          }]
        }
      }
    },
    {
      name: 'PH值',
      type: 'bar',
      data: [7.1, 7.0, 7.2, 7.1, 7.0, 7.1, 7.2],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: '#faad14'
          }, {
            offset: 1,
            color: 'rgba(250, 173, 20, 0.3)'
          }]
        }
      }
    }
  ]
}))

// 生成时间序列数据
function generateTimeData(baseValue, variance) {
  const now = new Date()
  const data = []
  for (let i = 0; i < 60; i++) {
    const time = new Date(now - (59 - i) * 60000)
    data.push([
      time.toISOString(),
      +(baseValue + (Math.random() * 2 - 1) * variance).toFixed(1)
    ])
  }
  return data
}

// 优化的设备操作
const viewDetail = async (device) => {
  currentDevice.value = device;
  showDetail.value = true;

  try {
    // 预加载设备历史数据
    const history = await store.dispatch('device/fetchDeviceHistory', device.name);
    await nextTick();
    // 可以在这里更新依赖于历史数据的图表或组件
  } catch (error) {
    ElMessage.error('获取设备历史数据失败');
  }
};

const deleteDevice = async (device) => {
  try {
    await ElMessageBox.confirm(
      `您正在尝试删除设备：<strong>${device.name}</strong><br/>此操作将永久删除该设备及其所有关联数据，且无法恢复。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
      }
    );
    
    loading.value = true;
    await store.dispatch('device/deleteDevice', device.name);
    
    // 更新本地数据和缓存
    deviceList.value = deviceList.value.filter(d => d.name !== device.name);
    await cache.set(DEVICE_CACHE_KEY, deviceList.value, DEVICE_CACHE_EXPIRY);
    
    ElMessage.success('设备已删除');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除设备失败');
      console.error('Delete device error:', error);
    }
  } finally {
    loading.value = false;
  }
};

// 优化的告警处理
const handleAlert = async (alert) => {
  const device = deviceList.value.find(d => d.name === alert.device);
  if (device) {
    viewDetail(device);
  }

  if (alert.unread) {
    // 使用 nextTick 确保在 DOM 更新后再标记为已读
    await nextTick();
    
    const index = alerts.value.findIndex(a => a.id === alert.id);
    if (index !== -1 && alerts.value[index].unread) {
      alerts.value[index].unread = false;
      try {
        await store.dispatch('alert/markAsRead', alert.id);
      } catch (error) {
        // 如果标记已读失败，将状态改回未读
        alerts.value[index].unread = true;
        console.error('Failed to mark alert as read:', error);
      }
    }
  }
};

function showAddDevice() {
  showAddDeviceDialog.value = true
}

function submitNewDevice() {
  deviceForm.value?.validate((valid) => {
    if (valid) {
      const device = {
        ...newDevice.value,
        status: 'online',
        latestData: '暂无数据',
        lastUpdate: new Date().toLocaleString()
      }
      deviceList.value.push(device)
      showAddDeviceDialog.value = false
      ElMessage.success('添加成功')
      newDevice.value = {
        name: '',
        type: '',
        location: ''
      }
    }
  })
}

// Helper functions
function getDeviceIcon(type) {
  const icons = {
    '温湿度': 'Temperature',
    'PH值': 'Experiment',
    '视频监控': 'VideoCamera',
    '数据网关': 'Connection'
  };
  return icons[type] || 'Monitor';
}

function getDeviceTagType(type) {
  const types = {
    '温湿度': '',
    'PH值': 'warning',
    '视频监控': 'success',
    '数据网关': 'info'
  };
  return types[type] || 'info';
}

function getStatusText(status) {
  const statuses = {
    online: '在线',
    offline: '离线',
    error: '异常'
  };
  return statuses[status] || status;
}

function getAlertTagType(level) {
  const types = {
    error: 'danger',
    warning: 'warning',
    info: 'info'
  };
  return types[level] || 'info';
}


// 状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' },
  { label: '异常', value: 'error' }
]

// 类型选项
const typeOptions = [
  { label: '全部', value: '' },
  { label: '温湿度传感器', value: '温湿度' },
  { label: 'PH值传感器', value: 'PH值' },
  { label: '视频监控', value: '视频监控' },
  { label: '数据网关', value: '数据网关' }
]

// 高级搜索
const showAdvancedSearchDialog = ref(false)
const advancedSearch = ref({
  name: '',
  type: '',
  status: '',
  location: '',
  updateTime: []
})

// Excel导出
const exporting = ref(false)

// 导出数据
const exportData = async () => {
  try {
    exporting.value = true
    await exportToExcel(deviceList.value, {
      filename: `设备列表_${new Date().toLocaleDateString()}`,
      sheets: [{
        name: '设备列表',
        columns: [
          { header: '设备名称', key: 'name' },
          { header: '设备类型', key: 'type' },
          { header: '状态', key: 'status' },
          { header: '位置', key: 'location' },
          { header: '最近数据', key: 'latestData' },
          { header: '最后更新', key: 'lastUpdate' }
        ]
      }]
    })
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
    console.error('Export failed:', error)
  } finally {
    exporting.value = false
  }
}

// 显示高级搜索
const showAdvancedSearch = () => {
  showAdvancedSearchDialog.value = true
}

// 重置高级搜索
const resetAdvancedSearch = () => {
  advancedSearch.value = {
    name: '',
    type: '',
    status: '',
    location: '',
    updateTime: []
  }
}

// 应用高级搜索
const applyAdvancedSearch = () => {
  searchQuery.value = advancedSearch.value.name
  filterType.value = advancedSearch.value.type
  filterStatus.value = advancedSearch.value.status
  showAdvancedSearchDialog.value = false
}

// 统计卡片相关方法
const getStatTooltip = (key) => {
  const tooltips = {
    online: '当前在线的设备数量',
    offline: '当前离线的设备数量',
    error: '存在异常的设备数量',
    total: '系统中的设备总数'
  }
  return tooltips[key]
}

const getStatLabel = (key) => {
  const labels = {
    online: '在线设备',
    offline: '离线设备',
    error: '异常设备',
    total: '设备总数'
  }
  return labels[key]
}

const getStatIcon = (key) => {
  const icons = {
    online: Monitor,
    offline: Connection,
    error: Warning,
    total: Cpu
  }
  return icons[key]
}

const getTrendClass = (key) => {
  const trends = {
    online: 'up',
    offline: 'down',
    error: '',
    total: 'up'
  }
  return trends[key]
}

const getTrendIcon = (key) => {
  const trends = {
    online: ArrowUp,
    offline: ArrowDown,
    error: InfoFilled,
    total: ArrowUp
  }
  return trends[key]
}

const getTrendText = (key) => {
  const texts = {
    online: '2台',
    offline: '1台',
    error: '无变化',
    total: '1台'
  }
  return texts[key]
}

// 预测指标选择
const predictionMetric = ref('temperature')

const unitMap = {
  temperature: '°C',
  humidity: '%',
  ph: ''
}

const predictionTableData = computed(() => {
  const data = []
  const metric = predictionMetric.value
  const unit = unitMap[metric] || ''
  for (let i = 0; i < 24; i++) {
    const hourStr = `${i.toString().padStart(2, '0')}:00`
    const value = predictionData.value[metric][i]
    data.push({
      time: hourStr,
      predicted: value !== undefined && value !== null ? `${value.toFixed(1)}${unit}` : '--'
    })
  }
  return data
})

// 预测数据表格标签
const metricLabel = computed(() => {
  return getMetricLabel(predictionMetric.value)
})
</script>

<style lang="scss" scoped>
.monitoring-view {
  padding: 16px; /* 缩小整体左右留白 */
  height: 100%;
  overflow-y: auto;
  /* 与主布局统一的深蓝渐变背景 */
  background: linear-gradient(180deg, #001529 0%, #002140 100%);
  color: #fff;
  /* 添加滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  // 顶部统计卡片区域
  .stats-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
  padding: 20px;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        background: rgba(255, 255, 255, 0.08);
      }

      .stat-icon {
        font-size: 24px;
        margin-bottom: 12px;
        color: #40a9ff;
      }

      .stat-content {
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
          background: linear-gradient(45deg, #40a9ff, #69c0ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.65);
          font-size: 14px;
        }
      }

      .stat-trend {
  display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 12px;
        font-size: 14px;

        &.up {
          color: #52c41a;
        }

        &.down {
          color: #ff4d4f;
        }
      }

      &.online { .stat-icon { color: #52c41a; } }
      &.offline { .stat-icon { color: #ff4d4f; } }
      &.error { .stat-icon { color: #faad14; } }
      &.total { .stat-icon { color: #40a9ff; } }
    }
  }

  // 工具栏
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .toolbar-left {
      display: flex;
      gap: 16px;
      align-items: center;

      .el-button-group {
        .el-button {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.85);

          &:hover {
            background: rgba(255, 255, 255, 0.12);
          }

          &.active {
            background: #40a9ff;
            color: #fff;
          }
        }
      }
    }

    .toolbar-right {
      display: flex;
      gap: 16px;
      align-items: center;

      .el-input {
        width: 240px;
        .el-input__wrapper {
          background: rgba(255, 255, 255, 0.08);
        }
      }

      .el-select {
        width: 160px;
        .el-input__wrapper {
          background: rgba(255, 255, 255, 0.08);
        }
      }
    }
  }

  // 主要内容区域
  .main-content {
    display: block; /* 只保留右侧预测面板 */
    margin-bottom: 24px;
  }

  /* 隐藏设备管理/左列相关 */
  .content-main,
  .device-list-panel {
    display: none !important;
  }

  /* 右侧面板全宽 */
  .content-side {
    width: 100%;
  }

  /* 恢复历史影像时间轴原始高度，并增加内边距增强上下左右间距 */
  .prediction-panel .timeline-section {
    padding: 24px 0; /* 上下留白 */
  }

  .prediction-panel .timeline-section .timeline-wrapper {
    height: 300px; /* 原始高度 */
    padding: 0 24px; /* 左右留白 */
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.65);
      font-size: 14px;
    }
  }

  .stat-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;

    &.up {
      color: #52c41a;
    }

    &.down {
      color: #ff4d4f;
    }
  }

  &.online .stat-icon {
    background: rgba(82, 196, 26, 0.15);
    color: #52c41a;
  }

  &.offline .stat-icon {
    background: rgba(255, 77, 79, 0.15);
    color: #ff4d4f;
  }

  &.error .stat-icon {
    background: rgba(250, 173, 20, 0.15);
    color: #faad14;
  }

  &.total .stat-icon {
    background: rgba(24, 144, 255, 0.15);
    color: #1890ff;
  }
}

.main-content {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.content-main {
  flex: 0 0 420px; /* 固定 420px，可根据需要调整 */
  max-width: 420px;
  min-width: 360px;
}

.content-side {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.panel {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
}

.device-grid {
  height: calc(100vh - 320px);
  overflow: hidden;
  padding: 0 12px;
  
  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }
  
  :deep(.virtual-list-container) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    padding: 16px;
  }
}

.device-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.online {
    border-left: 4px solid #52c41a;
  }

  &.offline {
    border-left: 4px solid #ff4d4f;
  }

  &.error {
    border-left: 4px solid #faad14;
  }
}

.device-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.device-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &.online .status-dot {
    background: #52c41a;
  }

  &.offline .status-dot {
    background: #ff4d4f;
  }

  &.error .status-dot {
    background: #faad14;
  }
}

.device-card-content {
  margin-bottom: 12px;

  .device-name {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .device-type {
    margin-bottom: 8px;
  }

  .device-location {
    color: rgba(255, 255, 255, 0.65);
    font-size: 14px;
    margin-bottom: 8px;
  }

  .device-data {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
  }
}

.device-card-footer {
  display: flex;
  justify-content: flex-end;
}

.alert-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &.unread {
    border-left: 3px solid #1890ff;
  }

  &.error {
    border-left: 3px solid #ff4d4f;
  }

  &.warning {
    border-left: 3px solid #faad14;
  }

  &.info {
    border-left: 3px solid #1890ff;
  }
}

.alert-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.alert-content {
  flex: 1;
  min-width: 0;

  .alert-title {
    font-size: 14px;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .alert-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);

    .alert-device {
      color: rgba(255, 255, 255, 0.65);
    }
  }
}

.chart-container {
  flex: 1;
  min-height: 300px;
  padding: 0 20px 20px;
}

:deep(.el-table) {
  background: transparent;
  
  th {
    background: #1a1a1a !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  td {
    background: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  tr {
    background: transparent;

    &:hover > td {
      background: rgba(255, 255, 255, 0.04);
    }
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;

  .el-input {
    width: 200px;
  }

  .el-select {
    width: 120px;
  }
}

:deep(.el-button) {
  &.active {
    background: #1890ff;
    border-color: #1890ff;
    color: #fff;
  }
}

.toolbar {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: rgba(255, 255, 255, 0.02);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.view-options {
  margin-left: 12px;
}

.select-option {
  display: flex;
  align-items: center;
  gap: 8px;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.online {
      background: #52c41a;
    }

    &.offline {
      background: #ff4d4f;
    }

    &.error {
      background: #faad14;
    }
  }

  .el-icon {
    font-size: 16px;
  }
}

:deep(.el-dialog) {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

  .el-dialog__header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin: 0;
    padding: 20px;

    .el-dialog__title {
      color: #fff;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .el-dialog__body {
    padding: 20px;
  }

  .el-dialog__footer {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 20px;
  }
}

:deep(.el-form) {
  .el-form-item__label {
    color: rgba(255, 255, 255, 0.85);
  }
}

:deep(.el-input),
:deep(.el-select) {
  .el-input__wrapper {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;

    &:hover {
      border-color: #1890ff;
    }

    &.is-focus {
      border-color: #1890ff;
      box-shadow: 0 0 0 1px #1890ff;
    }
  }

  .el-input__inner {
    color: #fff;

    &::placeholder {
      color: rgba(255, 255, 255, 0.45);
    }
  }
}

:deep(.el-date-editor) {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  .el-range-input {
    color: #fff;
    background: transparent;
  }
  
  .el-range-separator {
    color: rgba(255, 255, 255, 0.45);
  }
}

.virtual-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.device-list-panel {
  .device-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      font-size: 18px;
      color: #40a9ff;
    }
  }

  .device-info {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: rgba(255, 255, 255, 0.65);

      .el-icon {
        font-size: 16px;
      }
    }
  }

  .device-metrics {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;

    .metric-item {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      padding: 8px;

      .metric-label {
        color: rgba(255, 255, 255, 0.45);
        font-size: 12px;
        margin-bottom: 4px;
      }

      .metric-value {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;

        .el-tag {
          margin-left: 8px;
        }
      }
    }
  }
}

.realtime-panel {
  .realtime-content {
    padding: 20px;

    .selected-device-info {
      .device-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .device-basic {
          display: flex;
          align-items: center;
          gap: 12px;

          .el-icon {
            font-size: 24px;
            color: #40a9ff;
          }

          .device-name {
            font-size: 18px;
            font-weight: 500;
          }
        }

        .device-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          &.online .status-dot { background: #52c41a; }
          &.offline .status-dot { background: #ff4d4f; }
          &.error .status-dot { background: #faad14; }
        }
      }

      .device-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;

        .metric-card {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 16px;

          .metric-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .metric-label {
              color: rgba(255, 255, 255, 0.65);
              font-size: 14px;
            }
          }

          .metric-value {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
          }

          .metric-chart {
            height: 120px;
          }
        }
      }
    }

    .no-device-selected {
      height: 400px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}

.device-detail-dialog {
  .device-info {
    .el-descriptions {
      --el-descriptions-item-bordered-label-background: #1a1a1a;
      
      .el-descriptions-item__label {
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }

  .history-data {
    .chart-filters {
      margin-bottom: 20px;
    }

    .history-chart {
      height: 400px;
    }
  }
}

.device-config-dialog {
  .threshold-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .threshold-label {
      width: 80px;
    }

    .separator {
      color: rgba(255, 255, 255, 0.45);
    }

    .unit {
      color: rgba(255, 255, 255, 0.45);
      margin-left: 4px;
    }
  }
}

.device-map {
  height: 100%;
  
  .map-container {
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }
}

.content-side {
  .side-panel {
    &.prediction-panel {
      .prediction-content {
        .timeline-section {
          margin: 20px 0;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          overflow: hidden;
          
          .section-header {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            
            h4 {
              margin: 0;
              font-size: 14px;
              font-weight: 500;
              color: rgba(255, 255, 255, 0.85);
            }
          }
          
          .timeline-wrapper {
            height: 400px;
            
            :deep(.photo-timeline) {
              height: 100%;
              background: transparent;
              
              .timeline-header {
                padding: 12px;
                
                h2 {
                  display: none;
                }
              }
              
              .image-container {
                height: calc(100% - 120px);
              }
              
              .timeline-slider {
                padding: 12px;
              }
              
              .timeline-info {
                padding: 12px;
              }
            }
          }
        }
      }
    }
  }
}

.prediction-table {
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;

  :deep(.el-table) {
    background: transparent;
    
    th {
      background: #1a1a1a !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    td {
      background: transparent;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    tr {
      background: transparent;

      &:hover > td {
        background: rgba(255, 255, 255, 0.04);
      }
    }
  }
}

/* 让面板无内容时不占用过多空间 */
.device-list-panel:empty,
.alert-panel:empty {
  display: none;
}

.device-pagination {
  margin: 12px 0;
  text-align: center;
}

.alert-panel {
  display: none !important; /* 去掉中间告警列 */
}

.content-main {
  /* 固定左侧宽度，右侧自适应，且只保留一个面板 */
  flex: 0 0 420px; /* 固定 420px，可根据需要调整 */
  max-width: 420px;
  min-width: 360px;
  gap: 0;
}
</style> 