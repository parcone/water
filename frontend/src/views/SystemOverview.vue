<!-- SystemOverview.vue -->
<template>
  <div class="system-overview">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <div 
        class="stat-card primary"
        @click="goTo('monitoring')"
        style="cursor:pointer"
      >
        <div class="stat-icon">
          <el-icon><Location /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statisticsData.totalPoints }}</div>
          <div class="stat-label">监测点总数</div>
          <div class="stat-sparkline">
            <base-e-chart :options="sparklineOptions.points" height="32px" />
          </div>
        </div>
        <div class="stat-trend up">
          <el-icon><ArrowUp /></el-icon>
          <span>8%</span>
        </div>
      </div>
      <div 
        class="stat-card success"
        @click="goTo('analysis')"
        style="cursor:pointer"
      >
        <div class="stat-icon">
          <el-icon><DataLine /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statisticsData.todayNewData }}</div>
          <div class="stat-label">今日新增数据</div>
          <div class="stat-sparkline">
            <base-e-chart :options="sparklineOptions.newData" height="32px" />
          </div>
        </div>
        <div class="stat-trend up">
          <el-icon><ArrowUp /></el-icon>
          <span>12%</span>
        </div>
      </div>
      <div 
        class="stat-card warning"
        @click="goTo('warning-analysis')"
        style="cursor:pointer"
      >
        <div class="stat-icon">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statisticsData.abnormalPoints }}</div>
          <div class="stat-label">异常监测点</div>
          <div class="stat-sparkline">
            <base-e-chart :options="sparklineOptions.abnormal" height="32px" />
          </div>
        </div>
        <div class="stat-trend down">
          <el-icon><ArrowDown /></el-icon>
          <span>3%</span>
        </div>
      </div>
      <div 
        class="stat-card danger"
        @click="goTo('evaluation')"
        style="cursor:pointer"
      >
        <div class="stat-icon">
          <el-icon><CircleClose /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statisticsData.severeAreas }}</div>
          <div class="stat-label">严重污染区域</div>
          <div class="stat-sparkline">
            <base-e-chart :options="sparklineOptions.severe" height="32px" />
          </div>
        </div>
        <div class="stat-trend down">
          <el-icon><ArrowDown /></el-icon>
          <span>1%</span>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：地图和实时数据 -->
      <div class="content-main">
        <!-- 地图面板 -->
        <div class="map-panel">
          <div class="panel-header">
            <div class="header-left">
              <h3>监测点分布</h3>
              <div class="system-status">
                <span class="status-dot"></span>
                系统运行正常
              </div>
            </div>
            <div class="header-right">
              <div class="time-info">
                <el-icon><Clock /></el-icon>
                <span>{{ currentTime }}</span>
              </div>
              <div class="weather-info">
                <el-icon><Sunny /></el-icon>
                <span>25°C 晴朗</span>
              </div>
            </div>
          </div>
          <div class="map-container">
            <base-e-chart :options="mapOptions" />
          </div>
        </div>

        <!-- 实时监测数据 -->
        <div class="realtime-panel">
          <div class="panel-header">
            <h3>实时监测数据</h3>
            <el-select v-model="selectedStation" size="small" placeholder="选择监测站">
              <el-option 
                v-for="station in stations" 
                :key="station.value" 
                :label="station.label" 
                :value="station.value" 
              />
            </el-select>
          </div>
          <div class="realtime-grid">
            <div v-for="(item, index) in realtimeData" :key="index" class="realtime-item">
              <div class="item-icon">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <div class="item-info">
                <div class="item-label">{{ item.label }}</div>
                <div class="item-value">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：信息面板 -->
      <div class="content-side">
        <!-- 影像信息 -->
        <div class="side-panel">
          <div class="panel-header">
            <h3>影像信息</h3>
            <el-select v-model="selectedYear" size="small" placeholder="选择年份">
              <el-option 
                v-for="year in years" 
                :key="year" 
                :label="year" 
                :value="year" 
              />
            </el-select>
          </div>
          <div class="image-details">
            <div class="detail-item">
              <span class="label">唯一编号</span>
              <span class="value">{{ currentImage.id }}</span>
            </div>
            <div class="detail-item">
              <span class="label">卫星类型</span>
              <span class="value">{{ currentImage.satellite }}</span>
            </div>
            <div class="detail-item">
              <span class="label">经度范围</span>
              <span class="value">{{ currentImage.longitude }}</span>
            </div>
            <div class="detail-item">
              <span class="label">纬度范围</span>
              <span class="value">{{ currentImage.latitude }}</span>
            </div>
          </div>
        </div>

        <!-- 告警信息 -->
        <div class="side-panel">
          <div class="panel-header">
            <h3>最近告警</h3>
            <el-tag size="small" type="danger">{{ alerts.length }} 个未处理</el-tag>
          </div>
          <div class="alert-list">
            <div v-for="(alert, index) in alerts" 
                 :key="index" 
                 class="alert-item"
                 :class="alert.level">
              <div class="alert-icon">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-info">
                  <span class="alert-location">{{ alert.location }}</span>
                  <span class="alert-time">{{ alert.time }}</span>
                </div>
              </div>
              <div class="alert-action">
                <el-button size="small" type="primary" link>处理</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 系统状态 -->
        <div class="side-panel">
          <div class="panel-header">
            <h3>系统状态</h3>
          </div>
          <div class="system-metrics">
            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-label">CPU使用率</span>
                <span class="metric-value">68%</span>
              </div>
              <el-progress :percentage="68" :color="customColors" />
            </div>
            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-label">内存使用率</span>
                <span class="metric-value">42%</span>
              </div>
              <el-progress :percentage="42" :color="customColors" />
            </div>
            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-label">存储空间</span>
                <span class="metric-value">25%</span>
              </div>
              <el-progress :percentage="25" :color="customColors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BaseEChart from '@/components/BaseEChart.vue'
import DataCard from '@/components/DataCard.vue'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import chinaMapData from '@/assets/china.json'
import { Clock, Sunny, Warning, Location, DataLine, ArrowUp, ArrowDown, CircleClose } from '@element-plus/icons-vue'

// 监测站选择
const selectedStation = ref('station1')
const stations = [
  { label: '监测站 A', value: 'station1' },
  { label: '监测站 B', value: 'station2' },
  { label: '监测站 C', value: 'station3' }
]

// 实时监测数据
const realtimeData = [
  { label: '土壤温度', value: '23.5°C', icon: 'Thermometer' },
  { label: '土壤湿度', value: '65%', icon: 'WaterMeter' },
  { label: 'pH值', value: '7.2', icon: 'Monitor' },
  { label: '氮含量', value: '1.8%', icon: 'Histogram' },
  { label: '磷含量', value: '0.5%', icon: 'TrendCharts' },
  { label: '钾含量', value: '2.1%', icon: 'PieChart' }
]

// 进度条颜色
const customColors = [
  { color: '#1890ff', percentage: 20 },
  { color: '#52c41a', percentage: 40 },
  { color: '#faad14', percentage: 60 },
  { color: '#ff4d4f', percentage: 80 }
]

echarts.registerMap('china', chinaMapData)

const selectedYear = ref('2024')
const years = ['2024', '2023', '2022', '2021']
const currentTime = ref(new Date().toLocaleString())
const timer = ref(null)

const currentImage = ref({
  id: '167599247012556843',
  satellite: 'LANDSAT 8',
  longitude: '107.50233-110.08263',
  latitude: '33.50790-35.69403'
})

const statisticsData = ref({
  totalPoints: 1284,  // 总监测点数量
  todayNewData: 156,  // 今日新增
  abnormalPoints: 18, // 异常监测点
  severeAreas: 3      // 严重污染区域
})

// 省级监测点数据
const provinceData = {
  北京: { total: 120, normal: 108, abnormal: 12 },
  上海: { total: 98, normal: 90, abnormal: 8 },
  陕西: { total: 150, normal: 135, abnormal: 15 },
  四川: { total: 80, normal: 75, abnormal: 5 },
  广东: { total: 60, normal: 55, abnormal: 5 },
  新疆: { total: 30, normal: 28, abnormal: 2 },
  浙江: { total: 95, normal: 88, abnormal: 7 },
  江苏: { total: 88, normal: 82, abnormal: 6 },
  山东: { total: 78, normal: 72, abnormal: 6 },
  河南: { total: 66, normal: 60, abnormal: 6 },
  湖北: { total: 72, normal: 65, abnormal: 7 },
  湖南: { total: 58, normal: 54, abnormal: 4 },
  河北: { total: 45, normal: 42, abnormal: 3 },
  山西: { total: 35, normal: 32, abnormal: 3 },
  内蒙古: { total: 28, normal: 26, abnormal: 2 },
  辽宁: { total: 42, normal: 39, abnormal: 3 },
  吉林: { total: 36, normal: 33, abnormal: 3 },
  黑龙江: { total: 32, normal: 30, abnormal: 2 }
}

const alerts = ref([
  { 
    title: '监测点A12水质超标', 
    time: '10分钟前',
    location: '西区-A12',
    level: 'severe' 
  },
  { 
    title: '监测点B23土壤重金属含量异常', 
    time: '30分钟前',
    location: '东区-B23',
    level: 'moderate' 
  },
  { 
    title: '监测点C45数据传输异常', 
    time: '1小时前',
    location: '南区-C45',
    level: 'light' 
  }
])

const mapOptions = ref({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    formatter: (params) => {
      const provinceStats = provinceData[params.name] || { total: 0 };
      return `${params.name}<br/>监测点数量：${provinceStats.total}个`;
    },
    backgroundColor: 'rgba(0, 21, 41, 0.9)',
    borderColor: '#1890ff',
    textStyle: {
      color: '#fff'
    }
  },
  visualMap: [
    {
      type: 'piecewise',
      left: 'left',
      bottom: 50,
      pieces: [
        {min: 100, label: '密集区', color: '#002766'},
        {min: 60, max: 99, label: '高覆盖区', color: '#0050b3'},
        {min: 30, max: 59, label: '一般覆盖区', color: '#1890ff'},
        {max: 29, label: '低覆盖区', color: '#91d5ff'}
      ],
      textStyle: {
        color: '#fff'
      },
      seriesIndex: 0
    }
  ],
  geo: {
    map: 'china',
    roam: true,
    scaleLimit: {
      min: 1,
      max: 5
    },
    zoom: 1.2,
    itemStyle: {
      areaColor: '#003a8c',
      borderColor: '#1890ff',
      borderWidth: 1,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowBlur: 10
    },
    emphasis: {
      itemStyle: {
        areaColor: '#0050b3',
        shadowColor: 'rgba(0, 0, 0, 0.8)',
        shadowBlur: 20
      },
      label: {
        show: false
      }
    },
    label: {
      show: false
    }
  },
  series: [
    {
      name: '监测点分布',
      type: 'map',
      geoIndex: 0,
      data: [
        { name: '北京', value: 120 },
        { name: '上海', value: 98 },
        { name: '陕西', value: 150 },
        { name: '四川', value: 80 },
        { name: '广东', value: 60 },
        { name: '新疆', value: 30 },
        { name: '浙江', value: 95 },
        { name: '江苏', value: 88 },
        { name: '山东', value: 78 },
        { name: '河南', value: 66 },
        { name: '湖北', value: 72 },
        { name: '湖南', value: 58 },
        { name: '河北', value: 45 },
        { name: '山西', value: 35 },
        { name: '内蒙古', value: 28 },
        { name: '辽宁', value: 42 },
        { name: '吉林', value: 36 },
        { name: '黑龙江', value: 32 }
      ],
      label: {
        show: false
      }
    }
  ]
})

// 计算总体统计数据
onMounted(() => {
  // 初始化图表
  timer.value = setInterval(() => {
    currentTime.value = new Date().toLocaleString()
  }, 1000)

  // 计算总体统计
  let total = 0;
  let abnormal = 0;
  let severe = 0;
  Object.values(provinceData).forEach(data => {
    total += data.total;
    abnormal += data.abnormal;
    if (data.total >= 100) severe++;
  });

  statisticsData.value = {
    totalPoints: total,
    todayNewData: Math.floor(total * 0.12), // 假设12%是今日新增
    abnormalPoints: abnormal,
    severeAreas: severe
  }
})

onBeforeUnmount(() => {
  clearInterval(timer.value)
})

const router = useRouter()
function goTo(name) {
  router.push({ name })
}

// sparkline 图表配置
const sparklineOptions = {
  points: {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: Array.from({length: 7}, (_,i)=>`周${i+1}`) },
    yAxis: { type: 'value', show: false },
    series: [{
      data: [120, 132, 101, 134, 90, 230, 210],
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#40a9ff', width: 2 },
      areaStyle: { color: 'rgba(64,169,255,0.15)' }
    }]
  },
  newData: {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: Array.from({length: 7}, (_,i)=>`周${i+1}`) },
    yAxis: { type: 'value', show: false },
    series: [{
      data: [30, 40, 32, 50, 42, 60, 55],
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#52c41a', width: 2 },
      areaStyle: { color: 'rgba(82,196,26,0.15)' }
    }]
  },
  abnormal: {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: Array.from({length: 7}, (_,i)=>`周${i+1}`) },
    yAxis: { type: 'value', show: false },
    series: [{
      data: [5, 7, 6, 8, 7, 9, 6],
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#faad14', width: 2 },
      areaStyle: { color: 'rgba(250,173,20,0.15)' }
    }]
  },
  severe: {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: Array.from({length: 7}, (_,i)=>`周${i+1}`) },
    yAxis: { type: 'value', show: false },
    series: [{
      data: [1, 2, 1, 2, 1, 3, 2],
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#ff4d4f', width: 2 },
      areaStyle: { color: 'rgba(255,77,79,0.15)' }
    }]
  }
}
</script>

<style scoped>
.system-overview {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #001529 0%, #003366 100%);
  color: #fff;
}

/* 顶部统计卡片样式 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-card.primary .stat-icon {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.stat-card.success .stat-icon {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.stat-card.warning .stat-icon {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.stat-card.danger .stat-icon {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #ffffff;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 8px;
}

.stat-trend.up {
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
}

.stat-trend.down {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
}

.stat-sparkline {
  width: 100%;
  height: 32px;
  margin-bottom: 4px;
}

/* 主要内容区域样式 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  min-height: 600px;
}

.content-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.map-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h3 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  position: relative;
  padding-left: 12px;
}

.header-left h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background: linear-gradient(to bottom, #1890ff, #52c41a);
  border-radius: 2px;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #52c41a;
  font-size: 14px;
  padding: 4px 12px;
  background: rgba(82, 196, 26, 0.1);
  border-radius: 20px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #52c41a;
  animation: pulse 2s infinite;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-info,
.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
}

.map-container {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.realtime-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 200px;
  max-height: 340px;
  overflow-y: auto;
}

.realtime-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.realtime-item {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.realtime-item:hover {
  transform: translateY(-2px);
  border-color: rgba(24, 144, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(24, 144, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
  font-size: 20px;
}

.item-info {
  flex: 1;
}

.item-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 4px;
}

.item-value {
  font-size: 20px;
  font-weight: 500;
  background: linear-gradient(120deg, #fff, rgba(255, 255, 255, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 右侧面板样式 */
.content-side {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.side-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.image-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.label {
  color: rgba(255, 255, 255, 0.65);
  font-size: 14px;
}

.value {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.alert-item:hover {
  transform: translateX(5px);
  border-color: rgba(24, 144, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.alert-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.alert-item.severe .alert-icon {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.alert-item.moderate .alert-icon {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.alert-item.light .alert-icon {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.alert-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

.system-metrics {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
}

.metric-item {
  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .metric-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.65);
  }

  .metric-value {
    font-size: 14px;
    color: #fff;
    font-weight: 500;
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(82, 196, 26, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
  }
}

/* Element Plus 组件样式覆盖 */
:deep(.el-select) {
  width: 120px;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(0, 0, 0, 0.2);
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: rgba(24, 144, 255, 0.3);
}

:deep(.el-select .el-input__inner) {
  color: #fff;
}

:deep(.el-progress-bar__outer) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-radius: 4px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 4px;
  transition: all 0.3s ease;
}

:deep(.el-tag) {
  border: none;
}

:deep(.el-button) {
  background: rgba(24, 144, 255, 0.1);
  border: 1px solid rgba(24, 144, 255, 0.3);
  color: #1890ff;
}

:deep(.el-button:hover) {
  background: rgba(24, 144, 255, 0.2);
  border-color: #1890ff;
  color: #fff;
}

/* 响应式布局优化 */
@media (max-width: 1200px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  .main-content {
    grid-template-columns: 1fr;
    height: auto;
  }
  .content-side {
    order: 2;
    margin-top: 24px;
  }
  .content-main {
    order: 1;
  }
  .realtime-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
  .realtime-grid {
    grid-template-columns: 1fr;
  }
  .map-panel,
  .realtime-panel,
  .side-panel {
    padding: 16px;
  }
  .stat-card {
    padding: 16px;
  }
  .stat-value {
    font-size: 24px;
  }
}
</style> 