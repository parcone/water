<!-- QualityEvaluation.vue -->
<template>
  <div class="quality-evaluation">
    <!-- 评价指标面板 -->
    <div class="evaluation-panel">
      <h3>综合评价</h3>
      <div class="indicator-grid">
        <div class="indicator-group">
          <h4>地效评价</h4>
          <div class="indicators">
            <div class="indicator">
              <span class="label">全量</span>
              <div class="value">85</div>
              <el-progress :percentage="85" :color="getColorByScore(85)" :show-text="false" />
            </div>
            <div class="indicator">
              <span class="label">有机质</span>
              <div class="value">78</div>
              <el-progress :percentage="78" :color="getColorByScore(78)" :show-text="false" />
            </div>
            <div class="indicator">
              <span class="label">碱解氮</span>
              <div class="value">92</div>
              <el-progress :percentage="92" :color="getColorByScore(92)" :show-text="false" />
            </div>
          </div>
        </div>
        <div class="indicator-group">
          <h4>土壤评价</h4>
          <div class="indicators">
            <div class="indicator">
              <span class="label">土壤肥力</span>
              <div class="value">76</div>
              <el-progress :percentage="76" :color="getColorByScore(76)" :show-text="false" />
            </div>
            <div class="indicator">
              <span class="label">土壤质量</span>
              <div class="value">88</div>
              <el-progress :percentage="88" :color="getColorByScore(88)" :show-text="false" />
            </div>
            <div class="indicator">
              <span class="label">土壤侵蚀</span>
              <div class="value">65</div>
              <el-progress :percentage="65" :color="getColorByScore(65)" :show-text="false" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-container">
      <div class="chart-header">
        <h3>各等级农田面积占比</h3>
        <div class="chart-controls">
          <el-select v-model="selectedYear" placeholder="选择年份" size="small">
            <el-option
              v-for="year in years"
              :key="year"
              :label="year"
              :value="year"
            />
          </el-select>
        </div>
      </div>
      <div class="chart-content">
        <base-e-chart :options="chartOptions" height="100%" />
      </div>
    </div>

    <!-- 雷达图 -->
    <div class="radar-chart">
      <div class="chart-header">
        <h3>土壤质量综合评分</h3>
        <div class="chart-controls">
          <el-radio-group v-model="selectedRegion" size="small">
            <el-radio-button label="region1">区域1</el-radio-button>
            <el-radio-button label="region2">区域2</el-radio-button>
            <el-radio-button label="region3">区域3</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="chart-content">
        <base-e-chart :options="radarOptions" height="100%" />
      </div>
    </div>

    <!-- 评价结果 -->
    <div class="evaluation-result">
      <h3>综合评价结果</h3>
      <div class="result-content" v-if="!evaluationResult">
        <p>当前智能土壤环境综合评价，请先进行综合评价。</p>
        <el-button type="primary" @click="startEvaluation">
          开始进行综合评价
        </el-button>
      </div>
      <div class="result-content" v-else>
        <div class="score-card">
          <div class="score">{{ evaluationResult.totalScore }}</div>
          <div class="score-label">综合评分</div>
          <div class="score-level" :class="evaluationResult.level.toLowerCase()">
            {{ evaluationResult.level }}
          </div>
        </div>
        <div class="result-details">
          <h4>评价结论</h4>
          <p>{{ evaluationResult.conclusion }}</p>
          <h4>建议措施</h4>
          <ul>
            <li v-for="(suggestion, index) in evaluationResult.suggestions" :key="index">
              {{ suggestion }}
            </li>
          </ul>
          <el-button type="primary" @click="downloadReport">下载完整报告</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import BaseEChart from '@/components/BaseEChart.vue'

export default {
  name: 'QualityEvaluation',
  components: {
    BaseEChart
  },
  setup() {
    const selectedYear = ref('2021')
    const years = ['2021', '2020', '2019', '2018']
    const selectedRegion = ref('region1')
    const evaluationResult = ref(null)

    const getColorByScore = (score) => {
      if (score >= 90) return '#52c41a'
      if (score >= 75) return '#1890ff'
      if (score >= 60) return '#faad14'
      return '#ff4d4f'
    }

    const chartOptions = reactive({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['面积占比'],
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
        data: ['未监测', '一等级', '二等级', '三等级', '四等级', '五等级'],
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        },
        axisLabel: {
          color: '#fff'
        }
      },
      yAxis: {
        type: 'value',
        name: '面积占比（公顷）',
        nameTextStyle: {
          color: '#fff'
        },
        axisLine: {
          lineStyle: {
            color: '#fff'
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
      series: [
        {
          name: '面积占比',
          type: 'bar',
          data: [10, 25, 30, 20, 10, 5],
          itemStyle: {
            color: new Function('params', `
              const colors = ['#666666', '#2f54eb', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'];
              return colors[params.dataIndex];
            `)
          }
        }
      ]
    })

    const radarOptions = computed(() => {
      const regionData = {
        region1: [85, 78, 92, 76, 88, 65],
        region2: [75, 82, 88, 70, 92, 60],
        region3: [90, 70, 85, 80, 75, 85]
      }

      return {
        backgroundColor: 'transparent',
        radar: {
          indicator: [
            { name: '全量', max: 100 },
            { name: '有机质', max: 100 },
            { name: '碱解氮', max: 100 },
            { name: '土壤肥力', max: 100 },
            { name: '土壤质量', max: 100 },
            { name: '土壤侵蚀', max: 100 }
          ],
          shape: 'circle',
          splitNumber: 5,
          axisName: {
            color: '#fff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.2)'
            }
          },
          splitArea: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.2)'
            }
          }
        },
        series: [
          {
            name: '土壤质量评分',
            type: 'radar',
            data: [
              {
                value: regionData[selectedRegion.value],
                name: '当前评分',
                areaStyle: {
                  color: 'rgba(24, 144, 255, 0.3)'
                },
                lineStyle: {
                  color: '#1890ff'
                },
                itemStyle: {
                  color: '#1890ff'
                }
              }
            ]
          }
        ]
      }
    })

    const startEvaluation = () => {
      // 模拟评价过程
      setTimeout(() => {
        evaluationResult.value = {
          totalScore: 82,
          level: '良好',
          conclusion: '该区域土壤质量整体良好，有机质含量丰富，适合多种作物种植。部分区域存在轻微的重金属污染，但未超过安全标准。',
          suggestions: [
            '加强有机肥施用，提高土壤有机质含量',
            '适当调整作物种植结构，增加豆科作物比例',
            '定期监测土壤重金属含量，防止污染加重',
            '实施水土保持措施，减少土壤侵蚀'
          ]
        }
      }, 1500)
    }

    const downloadReport = () => {
      // 实现下载报告的逻辑
      alert('报告下载功能正在开发中')
    }

    return {
      selectedYear,
      years,
      selectedRegion,
      chartOptions,
      radarOptions,
      evaluationResult,
      startEvaluation,
      downloadReport,
      getColorByScore
    }
  }
}
</script>

<style lang="scss" scoped>
.quality-evaluation {
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr 1fr;
  gap: 20px;
  height: calc(100vh - 80px);
  background-color: #001529;
  color: #fff;
}

.evaluation-panel {
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  padding: 20px;

  h3 {
    margin: 0 0 20px;
    font-size: 18px;
  }

  .indicator-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .indicator-group {
    h4 {
      margin: 0 0 15px;
      color: #8c8c8c;
    }

    .indicators {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }

    .indicator {
      background: rgba(0, 0, 0, 0.2);
      padding: 15px;
      border-radius: 4px;
      text-align: center;

      .label {
        color: #8c8c8c;
        font-size: 14px;
      }

      .value {
        font-size: 24px;
        font-weight: bold;
        margin: 10px 0;
      }
    }
  }
}

.chart-container, .radar-chart {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  padding: 20px;
  display: flex;
  flex-direction: column;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
    }
  }

  .chart-content {
    flex: 1;
    position: relative;
  }
}

.evaluation-result {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  padding: 20px;

  h3 {
    margin: 0 0 20px;
    font-size: 18px;
  }

  .result-content {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    height: calc(100% - 50px);

    p {
      margin: 0 0 20px;
    }
  }

  .score-card {
    background: rgba(0, 0, 0, 0.2);
    padding: 20px;
    border-radius: 4px;
    text-align: center;
    min-width: 150px;

    .score {
      font-size: 48px;
      font-weight: bold;
      color: #1890ff;
    }

    .score-label {
      color: #8c8c8c;
      margin: 10px 0;
    }

    .score-level {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 15px;
      font-weight: bold;

      &.优秀 {
        background-color: rgba(82, 196, 26, 0.2);
        color: #52c41a;
      }

      &.良好 {
        background-color: rgba(24, 144, 255, 0.2);
        color: #1890ff;
      }

      &.一般 {
        background-color: rgba(250, 173, 20, 0.2);
        color: #faad14;
      }

      &.较差 {
        background-color: rgba(255, 77, 79, 0.2);
        color: #ff4d4f;
      }
    }
  }

  .result-details {
    flex: 1;
    overflow-y: auto;

    h4 {
      margin: 0 0 10px;
      color: #8c8c8c;
    }

    p {
      margin: 0 0 15px;
      line-height: 1.6;
    }

    ul {
      margin: 0 0 20px;
      padding-left: 20px;

      li {
        margin-bottom: 8px;
        line-height: 1.6;
      }
    }
  }
}
</style> 