<template>
  <div class="farmland-analysis">
    <!-- 背景介绍 -->
    <div class="background-info">
      <h3>背景介绍</h3>
      <div class="info-content">
        <p>近年来，随着城镇化建设快速发展，不合理的人类活动导致土壤污染，严重影响着我国粮食安全、居民健康以及社会经济的可持续发展。</p>
        <p>生态环境保护结构性、根源性、趋势性压力依然未解，以重化工为主的产业结构尚未根本改变，部分污染物排放总量仍处于高位。</p>
        <p>涉及土壤环境的问题具体为：（1）局部区域土壤较为突出；（2）土壤污染源类别防压力较大；（3）环境监管能力仍然薄弱。</p>
        <p>以数字化赋能生态环境治理，既是顺应新形势下数字经济发展趋势和规律，也能为精准治污、科学治污、依法治污以及土壤环境质量分析评价的重要依据提供支撑，为生态环境治理体系和治理能力现代化提供新的方法路径。</p>
      </div>
      
      <!-- 土壤污染指标 -->
      <div class="soil-indicators">
        <h3>土壤污染指标</h3>
        <div class="indicator-list">
          <div class="indicator-item" v-for="(indicator, index) in soilIndicators" :key="index">
            <div class="indicator-name">{{ indicator.name }}</div>
            <el-progress 
              :percentage="indicator.value" 
              :color="getIndicatorColor(indicator.value)" 
              :format="format => `${indicator.value}%`"
              :stroke-width="10"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- 农田景观 -->
      <div class="farmland-view">
        <div class="view-header">
          <h3>农田景观</h3>
          <div class="view-controls">
            <el-button-group>
              <el-button type="primary" :icon="ZoomIn">放大</el-button>
              <el-button type="primary" :icon="ZoomOut">缩小</el-button>
              <el-button type="primary" :icon="RefreshRight">重置</el-button>
            </el-button-group>
          </div>
        </div>
        <div class="view-content">
          <!-- 这里放置农田景观图像 -->
          <img src="https://img.freepik.com/free-photo/aerial-view-rice-terrace-agricultural-fields-mu-cang-chai-district-vietnam_335224-1379.jpg" alt="农田景观" class="landscape-image" />
        </div>
      </div>

      <!-- 趋势分析 -->
      <div class="trend-analysis">
        <div class="view-header">
          <h3>土壤污染趋势分析</h3>
          <div class="view-controls">
            <el-select v-model="selectedPollutant" placeholder="选择污染物" size="small">
              <el-option v-for="item in pollutants" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
        </div>
        <div class="chart-container">
          <base-e-chart :options="trendChartOptions" height="100%" />
        </div>
      </div>
    </div>

    <!-- 分析工具栏 -->
    <div class="analysis-toolbar">
      <div class="tool-group">
        <h4>遥感影像操作</h4>
        <div class="tools">
          <el-button type="primary" plain>土壤湿度水文</el-button>
          <el-button type="primary" plain>土壤污染分析</el-button>
          <el-button type="primary" plain>影像数据分析</el-button>
          <el-button type="primary" plain>污染趋势监测</el-button>
        </div>
      </div>
      <div class="tool-group">
        <h4>应用市各县三调公报</h4>
        <div class="tools">
          <el-button type="primary" plain>金台区</el-button>
          <el-button type="primary" plain>陈仓区</el-button>
          <el-button type="primary" plain>凤翔区</el-button>
          <el-button type="primary" plain>岐山县</el-button>
          <el-button type="primary" plain>扶风县</el-button>
          <el-button type="primary" plain>眉县</el-button>
          <el-button type="primary" plain>陇县</el-button>
          <el-button type="primary" plain>千阳县</el-button>
          <el-button type="primary" plain>麟游县</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ZoomIn, ZoomOut, RefreshRight } from '@element-plus/icons-vue'
import BaseEChart from '@/components/BaseEChart.vue'

export default {
  name: 'FarmlandAnalysis',
  components: {
    BaseEChart,
    ZoomIn,
    ZoomOut,
    RefreshRight
  },
  setup() {
    const selectedPollutant = ref('heavy_metals')
    
    const pollutants = [
      { label: '重金属', value: 'heavy_metals' },
      { label: '有机污染物', value: 'organic_pollutants' },
      { label: '农药残留', value: 'pesticides' },
      { label: '石油烃', value: 'petroleum_hydrocarbons' }
    ]
    
    const soilIndicators = [
      { name: '镉 (Cd)', value: 78 },
      { name: '铅 (Pb)', value: 45 },
      { name: '铬 (Cr)', value: 32 },
      { name: '砷 (As)', value: 67 },
      { name: '汞 (Hg)', value: 23 }
    ]
    
    const getIndicatorColor = (value) => {
      if (value >= 80) return '#ff4d4f'
      if (value >= 60) return '#faad14'
      if (value >= 40) return '#fadb14'
      return '#52c41a'
    }
    
    // 趋势图配置
    const trendChartOptions = computed(() => {
      const pollutantData = {
        heavy_metals: {
          years: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
          data: [
            { name: '镉 (Cd)', data: [45, 48, 52, 58, 65, 72, 76, 78, 75] },
            { name: '铅 (Pb)', data: [60, 58, 55, 52, 50, 48, 46, 45, 43] },
            { name: '铬 (Cr)', data: [38, 37, 36, 35, 34, 33, 32, 32, 31] },
            { name: '砷 (As)', data: [55, 57, 60, 62, 64, 65, 66, 67, 68] },
            { name: '汞 (Hg)', data: [28, 27, 26, 25, 24, 24, 23, 23, 22] }
          ]
        },
        organic_pollutants: {
          years: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
          data: [
            { name: 'PAHs', data: [65, 68, 70, 72, 75, 78, 80, 82, 84] },
            { name: 'PCBs', data: [45, 43, 42, 40, 38, 36, 34, 32, 30] },
            { name: '二噁英', data: [25, 24, 23, 22, 21, 20, 19, 18, 17] }
          ]
        },
        pesticides: {
          years: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
          data: [
            { name: 'DDT', data: [55, 52, 50, 48, 45, 42, 40, 38, 35] },
            { name: '六六六', data: [42, 40, 38, 36, 34, 32, 30, 28, 26] },
            { name: '草甘膦', data: [65, 68, 70, 72, 74, 76, 78, 80, 82] }
          ]
        },
        petroleum_hydrocarbons: {
          years: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
          data: [
            { name: 'TPH', data: [75, 78, 80, 82, 84, 86, 88, 90, 92] },
            { name: 'BTEX', data: [45, 47, 49, 51, 53, 55, 57, 59, 61] }
          ]
        }
      }
      
      const currentData = pollutantData[selectedPollutant.value]
      
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: currentData.data.map(item => item.name),
          textStyle: {
            color: '#fff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: currentData.years,
          axisLine: {
            lineStyle: {
              color: '#8c8c8c'
            }
          },
          axisLabel: {
            color: '#fff'
          }
        },
        yAxis: {
          type: 'value',
          name: '污染指数 (%)',
          nameTextStyle: {
            color: '#fff'
          },
          axisLine: {
            lineStyle: {
              color: '#8c8c8c'
            }
          },
          axisLabel: {
            color: '#fff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: currentData.data.map(item => ({
          name: item.name,
          type: 'line',
          data: item.data,
          smooth: true
        }))
      }
    })

    return {
      ZoomIn,
      ZoomOut,
      RefreshRight,
      selectedPollutant,
      pollutants,
      soilIndicators,
      getIndicatorColor,
      trendChartOptions
    }
  }
}
</script>

<style lang="scss" scoped>
.farmland-analysis {
  padding: 20px;
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: 1fr auto;
  gap: 20px;
  height: calc(100vh - 80px);
  background-color: #001529;
  color: #fff;
}

.background-info {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;

  h3 {
    margin: 0 0 15px;
    font-size: 18px;
  }

  .info-content {
    p {
      margin: 0 0 15px;
      line-height: 1.6;
      color: #bfbfbf;
      text-align: justify;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.soil-indicators {
  .indicator-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .indicator-item {
    .indicator-name {
      margin-bottom: 5px;
      font-size: 14px;
      color: #bfbfbf;
    }
  }
}

.main-content {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 20px;
}

.farmland-view, .trend-analysis {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  padding: 20px;
  display: flex;
  flex-direction: column;

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
    }
  }

  .view-content {
    flex: 1;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    
    .landscape-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.chart-container {
  flex: 1;
}

.analysis-toolbar {
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  padding: 20px;

  .tool-group {
    &:not(:last-child) {
      margin-bottom: 20px;
    }

    h4 {
      margin: 0 0 15px;
      color: #8c8c8c;
    }

    .tools {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      :deep(.el-button) {
        margin: 0;
      }
    }
  }
}
</style> 