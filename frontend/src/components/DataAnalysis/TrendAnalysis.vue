<!-- 趋势分析组件 -->
<template>
  <div class="trend-analysis">
    <div class="control-panel">
      <el-form :model="analysisForm" inline>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="analysisForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="数据维度">
          <el-select
            v-model="analysisForm.dimensions"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="选择分析维度"
            @change="handleDimensionChange"
          >
            <el-option
              v-for="dim in availableDimensions"
              :key="dim.value"
              :label="dim.label"
              :value="dim.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="聚合方式">
          <el-select
            v-model="analysisForm.aggregation"
            placeholder="选择聚合方式"
            @change="handleAggregationChange"
          >
            <el-option label="求和" value="sum" />
            <el-option label="平均值" value="avg" />
            <el-option label="最大值" value="max" />
            <el-option label="最小值" value="min" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="performAnalysis">分析</el-button>
          <el-button @click="exportData">导出数据</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="analysis-content">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="趋势图" name="chart">
          <div class="chart-container">
            <base-echart
              :options="chartOptions"
              :loading="loading"
              height="400px"
              @chart-ready="handleChartReady"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="数据表格" name="table">
          <div class="table-container">
            <el-table
              :data="tableData"
              border
              stripe
              height="400"
              :summary-method="getSummaries"
              show-summary
            >
              <el-table-column
                type="index"
                width="50"
                fixed
              />
              <el-table-column
                prop="date"
                label="日期"
                width="120"
                fixed
              />
              <el-table-column
                v-for="col in tableCols"
                :key="col.prop"
                :prop="col.prop"
                :label="col.label"
                :width="col.width"
              >
                <template #default="{ row }">
                  <span :class="getValueClass(row[col.prop])">
                    {{ formatValue(row[col.prop]) }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="统计分析" name="stats">
          <div class="stats-container">
            <el-row :gutter="20">
              <el-col :span="8" v-for="stat in statistics" :key="stat.label">
                <data-card
                  :title="stat.label"
                  :value="stat.value"
                  :type="stat.type"
                  :icon="stat.icon"
                >
                  <template #footer>
                    <div class="stat-trend">
                      <el-tag :type="stat.trend.type" size="small">
                        {{ stat.trend.label }}
                      </el-tag>
                      <span>较上期</span>
                    </div>
                  </template>
                </data-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import BaseEChart from '../BaseEChart.vue'
import DataCard from '../DataCard.vue'
import { useStore } from 'vuex'
import * as echarts from 'echarts'
import { exportToExcel } from '@/utils/excel'
import { formatNumber, formatDate } from '@/utils/format'

export default {
  name: 'TrendAnalysis',
  components: {
    BaseEChart,
    DataCard
  },
  props: {
    initialData: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const store = useStore()
    const loading = ref(false)
    const activeTab = ref('chart')
    let chartInstance = null

    // 表单数据
    const analysisForm = reactive({
      dateRange: [],
      dimensions: [],
      aggregation: 'sum'
    })

    // 可选维度
    const availableDimensions = [
      { label: '温度', value: 'temperature' },
      { label: '压力', value: 'pressure' },
      { label: '流量', value: 'flow' },
      { label: '水质', value: 'quality' }
    ]

    // 日期快捷选项
    const dateShortcuts = [
      {
        text: '最近一周',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
          return [start, end]
        }
      },
      {
        text: '最近一月',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
          return [start, end]
        }
      },
      {
        text: '最近三月',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
          return [start, end]
        }
      }
    ]

    // 图表配置
    const chartOptions = computed(() => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: analysisForm.dimensions.map(dim => 
          availableDimensions.find(d => d.value === dim)?.label
        )
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: tableData.value.map(item => item.date)
      },
      yAxis: {
        type: 'value'
      },
      series: analysisForm.dimensions.map(dim => ({
        name: availableDimensions.find(d => d.value === dim)?.label,
        type: 'line',
        smooth: true,
        data: tableData.value.map(item => item[dim])
      }))
    }))

    // 表格数据
    const tableData = ref([])
    const tableCols = computed(() => {
      return analysisForm.dimensions.map(dim => ({
        prop: dim,
        label: availableDimensions.find(d => d.value === dim)?.label,
        width: 120
      }))
    })

    // 统计数据
    const statistics = computed(() => {
      if (!tableData.value.length) return []
      
      return analysisForm.dimensions.map(dim => {
        const values = tableData.value.map(item => item[dim])
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        const last = values[values.length - 1]
        const prevLast = values[values.length - 2]
        const trend = last > prevLast
          ? { type: 'success', label: '上升' }
          : { type: 'danger', label: '下降' }

        return {
          label: availableDimensions.find(d => d.value === dim)?.label,
          value: formatNumber(avg),
          type: trend.type === 'success' ? 'primary' : 'danger',
          icon: trend.type === 'success' ? 'TrendChartOutlined' : 'WarningOutlined',
          trend
        }
      })
    })

    // 方法
    const performAnalysis = async () => {
      loading.value = true
      try {
        // 模拟API调用
        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve(generateMockData())
          }, 1000)
        })
        tableData.value = response
      } catch (error) {
        console.error('Analysis failed:', error)
      } finally {
        loading.value = false
      }
    }

    const generateMockData = () => {
      const { dateRange, dimensions } = analysisForm
      if (!dateRange[0] || !dateRange[1]) return []

      const days = Math.floor((dateRange[1] - dateRange[0]) / (24 * 60 * 60 * 1000))
      return Array.from({ length: days }, (_, index) => {
        const date = new Date(dateRange[0])
        date.setDate(date.getDate() + index)
        
        const result = { date: formatDate(date) }
        dimensions.forEach(dim => {
          result[dim] = Math.random() * 100
        })
        return result
      })
    }

    const handleChartReady = (chart) => {
      chartInstance = chart
    }

    const handleDateChange = () => {
      performAnalysis()
    }

    const handleDimensionChange = () => {
      if (tableData.value.length) {
        performAnalysis()
      }
    }

    const handleAggregationChange = () => {
      if (tableData.value.length) {
        performAnalysis()
      }
    }

    const handleTabChange = () => {
      if (activeTab.value === 'chart' && chartInstance) {
        chartInstance.resize()
      }
    }

    const getSummaries = (param) => {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计'
          return
        }
        if (index === 1) {
          sums[index] = ''
          return
        }
        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          switch (analysisForm.aggregation) {
            case 'sum':
              sums[index] = formatNumber(values.reduce((prev, curr) => prev + curr, 0))
              break
            case 'avg':
              sums[index] = formatNumber(values.reduce((prev, curr) => prev + curr, 0) / values.length)
              break
            case 'max':
              sums[index] = formatNumber(Math.max(...values))
              break
            case 'min':
              sums[index] = formatNumber(Math.min(...values))
              break
            default:
              sums[index] = 'N/A'
          }
        } else {
          sums[index] = 'N/A'
        }
      })
      return sums
    }

    const getValueClass = (value) => {
      if (typeof value !== 'number') return ''
      return value > 80 ? 'text-danger' :
             value > 60 ? 'text-warning' :
             value > 40 ? 'text-success' : ''
    }

    const formatValue = (value) => {
      if (typeof value === 'number') {
        return formatNumber(value)
      }
      return value
    }

    const exportData = () => {
      const header = ['日期', ...analysisForm.dimensions.map(dim => 
        availableDimensions.find(d => d.value === dim)?.label
      )]
      const data = tableData.value.map(row => [
        row.date,
        ...analysisForm.dimensions.map(dim => row[dim])
      ])
      exportToExcel(header, data, '趋势分析数据')
    }

    // 生命周期
    onMounted(() => {
      if (props.initialData.length) {
        tableData.value = props.initialData
      }
    })

    return {
      loading,
      activeTab,
      analysisForm,
      availableDimensions,
      dateShortcuts,
      chartOptions,
      tableData,
      tableCols,
      statistics,
      handleChartReady,
      handleDateChange,
      handleDimensionChange,
      handleAggregationChange,
      handleTabChange,
      performAnalysis,
      getSummaries,
      getValueClass,
      formatValue,
      exportData
    }
  }
}
</script>

<style lang="scss" scoped>
.trend-analysis {
  .control-panel {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .analysis-content {
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20px;

    .chart-container,
    .table-container,
    .stats-container {
      margin-top: 20px;
    }
  }

  .stat-trend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
  }

  :deep(.text-danger) {
    color: var(--el-color-danger);
  }

  :deep(.text-warning) {
    color: var(--el-color-warning);
  }

  :deep(.text-success) {
    color: var(--el-color-success);
  }
}
</style> 