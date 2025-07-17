<template>
  <div class="warning-analysis">
    <div class="warning-header">
      <div class="header-content">
        <h2>
          <el-icon class="title-icon"><Warning /></el-icon>
          预警分析
        </h2>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-label">总预警数</span>
            <span class="stat-value">{{ warningStats.total }}</span>
            <span class="stat-trend" :class="{ 'up': warningStats.trend > 0, 'down': warningStats.trend < 0 }">
              {{ warningStats.trend > 0 ? '+' : '' }}{{ warningStats.trend }}%
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">未处理</span>
            <span class="stat-value warning">{{ warningStats.unhandled }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">已处理</span>
            <span class="stat-value success">{{ warningStats.handled }}</span>
          </div>
        </div>
      </div>
      <div class="warning-filters">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
            />
          </el-form-item>
          <el-form-item label="预警类型">
            <el-select v-model="filterForm.warningType" placeholder="选择预警类型" clearable>
              <el-option
                v-for="type in warningTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="预警等级">
            <el-select v-model="filterForm.warningLevel" placeholder="选择预警等级" clearable>
              <el-option
                v-for="level in warningLevels"
                :key="level.value"
                :label="level.label"
                :value="level.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>查询
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="warning-content">
      <el-row :gutter="20">
        <el-col :span="6" v-for="(stat, index) in warningLevelStats" :key="index">
          <el-card class="warning-stat-card" :class="stat.type">
            <div class="stat-card-content">
              <div class="stat-card-header">
                <span class="stat-card-title">{{ stat.label }}</span>
                <el-tag :type="stat.type" effect="dark">{{ stat.count }}</el-tag>
              </div>
              <div class="stat-card-body">
                <el-progress
                  :percentage="stat.percentage"
                  :color="stat.color"
                  :show-text="false"
                  :stroke-width="8"
                />
                <div class="stat-card-info">
                  <span class="percentage">占比 {{ stat.percentage }}%</span>
                  <span class="trend" :class="{ 'up': stat.trend > 0, 'down': stat.trend < 0 }">
                    {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div class="warning-chart">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>预警趋势分析</span>
              <div class="chart-controls">
                <el-radio-group v-model="chartTimeRange" size="small">
                  <el-radio-button label="day">24小时</el-radio-button>
                  <el-radio-button label="week">7天</el-radio-button>
                  <el-radio-button label="month">30天</el-radio-button>
                </el-radio-group>
                <el-select v-model="chartType" size="small" style="margin-left: 16px;">
                  <el-option label="堆叠图" value="stack" />
                  <el-option label="折线图" value="line" />
                </el-select>
              </div>
            </div>
          </template>
          <div class="chart-container">
            <base-echart :options="chartOptions" height="300px" />
          </div>
        </el-card>
      </div>

      <div class="warning-list">
        <el-card>
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span>预警记录</span>
                <el-tag type="danger" effect="dark" size="small" style="margin-left: 12px;">
                  {{ warningStats.unhandled }} 个未处理
                </el-tag>
              </div>
              <div class="header-right">
                <el-button type="primary" link @click="exportData">
                  <el-icon><Download /></el-icon>导出数据
                </el-button>
                <el-button type="primary" link @click="refreshList">
                  <el-icon><Refresh /></el-icon>刷新
                </el-button>
              </div>
            </div>
          </template>
          <el-table 
            :data="warningList" 
            style="width: 100%"
            v-loading="loading"
            :row-class-name="getRowClassName"
          >
            <el-table-column prop="time" label="时间" width="180" sortable />
            <el-table-column prop="type" label="预警类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getWarningTypeTag(row.type)" size="small">
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="level" label="预警等级" width="100">
              <template #default="{ row }">
                <el-tag :type="getWarningLevelType(row.level)" size="small" effect="dark">
                  {{ row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="预警描述" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag 
                  :type="row.status === '已处理' ? 'success' : 'warning'"
                  size="small"
                  effect="plain"
                >
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleDetail(row)">
                  <el-icon><View /></el-icon>详情
                </el-button>
                <el-button 
                  v-if="row.status !== '已处理'"
                  link 
                  type="success" 
                  size="small"
                  @click="handleProcess(row)"
                >
                  <el-icon><Check /></el-icon>处理
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 预警详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="预警详情"
      width="60%"
    >
      <div v-if="currentWarning" class="warning-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="预警时间">{{ currentWarning.time }}</el-descriptions-item>
          <el-descriptions-item label="预警类型">{{ currentWarning.type }}</el-descriptions-item>
          <el-descriptions-item label="预警等级">
            <el-tag :type="getWarningLevelType(currentWarning.level)">
              {{ currentWarning.level }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="currentWarning.status === '已处理' ? 'success' : 'warning'">
              {{ currentWarning.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预警描述" :span="2">
            {{ currentWarning.description }}
          </el-descriptions-item>
          <el-descriptions-item label="相关数据" :span="2">
            <el-table :data="currentWarning.relatedData" border size="small">
              <el-table-column prop="parameter" label="参数" />
              <el-table-column prop="value" label="数值" />
              <el-table-column prop="threshold" label="阈值" />
              <el-table-column prop="deviation" label="偏差" />
            </el-table>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentWarning.processInfo" label="处理信息" :span="2">
            <div class="process-info">
              <p>处理时间：{{ currentWarning.processInfo.time }}</p>
              <p>处理人员：{{ currentWarning.processInfo.operator }}</p>
              <p>处理方案：{{ currentWarning.processInfo.solution }}</p>
              <p>处理结果：{{ currentWarning.processInfo.result }}</p>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 处理预警对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      title="处理预警"
      width="50%"
    >
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理方案">
          <el-input
            v-model="processForm.solution"
            type="textarea"
            rows="3"
            placeholder="请输入处理方案"
          />
        </el-form-item>
        <el-form-item label="处理结果">
          <el-input
            v-model="processForm.result"
            type="textarea"
            rows="3"
            placeholder="请输入处理结果"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProcess">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BaseEChart from '@/components/BaseEChart.vue'
import {
  Search, Refresh, View, Check, Download,
  Warning, ArrowUp, ArrowDown
} from '@element-plus/icons-vue'

// 预警统计数据
const warningStats = reactive({
  total: 128,
  unhandled: 45,
  handled: 83,
  trend: 15
})

// 预警类型
const warningTypes = [
  { label: '温度异常', value: 'temperature' },
  { label: '压力异常', value: 'pressure' },
  { label: '流量异常', value: 'flow' },
  { label: '质量异常', value: 'quality' }
]

// 预警等级
const warningLevels = [
  { label: '一般', value: 'low' },
  { label: '重要', value: 'medium' },
  { label: '严重', value: 'high' },
  { label: '紧急', value: 'critical' }
]

// 日期快捷选项
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
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 筛选表单
const filterForm = reactive({
  dateRange: [],
  warningType: '',
  warningLevel: ''
})

// 预警等级统计
const warningLevelStats = [
  { 
    label: '一般预警', 
    count: 45, 
    percentage: 35, 
    type: 'info', 
    color: '#909399',
    trend: 5 
  },
  { 
    label: '重要预警', 
    count: 38, 
    percentage: 30, 
    type: 'warning', 
    color: '#E6A23C',
    trend: -2 
  },
  { 
    label: '严重预警', 
    count: 25, 
    percentage: 20, 
    type: 'danger', 
    color: '#F56C6C',
    trend: 8 
  },
  { 
    label: '紧急预警', 
    count: 20, 
    percentage: 15, 
    type: 'error', 
    color: '#ff0000',
    trend: -3 
  }
]

// 图表相关
const chartTimeRange = ref('day')
const chartType = ref('stack')
const chartOptions = computed(() => {
  const isStack = chartType.value === 'stack'
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['一般', '重要', '严重', '紧急'],
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
      data: getTimeAxisData(),
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
        lineStyle: { color: 'rgba(74, 158, 255, 0.2)' }
      }
    },
    series: [
      {
        name: '一般',
        type: isStack ? 'bar' : 'line',
        stack: isStack ? 'total' : undefined,
        smooth: !isStack,
        emphasis: {
          focus: 'series'
        },
        itemStyle: { color: '#909399' },
        data: generateRandomData(8, 10)
      },
      {
        name: '重要',
        type: isStack ? 'bar' : 'line',
        stack: isStack ? 'total' : undefined,
        smooth: !isStack,
        emphasis: {
          focus: 'series'
        },
        itemStyle: { color: '#E6A23C' },
        data: generateRandomData(6, 8)
      },
      {
        name: '严重',
        type: isStack ? 'bar' : 'line',
        stack: isStack ? 'total' : undefined,
        smooth: !isStack,
        emphasis: {
          focus: 'series'
        },
        itemStyle: { color: '#F56C6C' },
        data: generateRandomData(4, 6)
      },
      {
        name: '紧急',
        type: isStack ? 'bar' : 'line',
        stack: isStack ? 'total' : undefined,
        smooth: !isStack,
        emphasis: {
          focus: 'series'
        },
        itemStyle: { color: '#ff0000' },
        data: generateRandomData(2, 4)
      }
    ]
  }
})

// 预警列表数据
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(128)
const warningList = ref([
  {
    time: '2024-03-20 10:30:00',
    type: '温度异常',
    level: '严重',
    description: '3号监测点温度超过阈值30%，当前温度85℃，已持续30分钟',
    status: '未处理',
    relatedData: [
      { parameter: '温度', value: '85℃', threshold: '65℃', deviation: '+30%' },
      { parameter: '压力', value: '2.5MPa', threshold: '2.0MPa', deviation: '+25%' }
    ]
  },
  {
    time: '2024-03-20 09:15:00',
    type: '压力异常',
    level: '重要',
    description: '主管道压力波动异常，当前压力2.8MPa，波动范围±0.5MPa',
    status: '已处理',
    relatedData: [
      { parameter: '压力', value: '2.8MPa', threshold: '2.5MPa', deviation: '+12%' },
      { parameter: '流量', value: '150L/s', threshold: '180L/s', deviation: '-17%' }
    ],
    processInfo: {
      time: '2024-03-20 09:45:00',
      operator: '张工',
      solution: '调整减压阀开度，稳定主管道压力',
      result: '压力恢复正常，系统运行稳定'
    }
  }
])

// 对话框相关
const detailDialogVisible = ref(false)
const processDialogVisible = ref(false)
const currentWarning = ref(null)
const processForm = reactive({
  solution: '',
  result: ''
})

// 工具函数
const getTimeAxisData = () => {
  switch (chartTimeRange.value) {
    case 'day':
      return ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
    case 'week':
      return ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    case 'month':
      return Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
    default:
      return []
  }
}

const generateRandomData = (min, max) => {
  return Array.from({ length: getTimeAxisData().length }, () => 
    Math.floor(Math.random() * (max - min + 1)) + min
  )
}

const getWarningTypeTag = (type) => {
  const typeMap = {
    '温度异常': 'danger',
    '压力异常': 'warning',
    '流量异常': 'info',
    '质量异常': 'error'
  }
  return typeMap[type] || 'info'
}

const getWarningLevelType = (level) => {
  const typeMap = {
    '一般': 'info',
    '重要': 'warning',
    '严重': 'danger',
    '紧急': 'error'
  }
  return typeMap[level] || 'info'
}

const getRowClassName = ({ row }) => {
  if (row.status === '未处理') {
    return 'unhandled-warning'
  }
  return ''
}

// 方法
const handleSearch = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 1000)
}

const handleReset = () => {
  Object.assign(filterForm, {
    dateRange: [],
    warningType: '',
    warningLevel: ''
  })
}

const handleSizeChange = (val) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // 重新加载数据
}

const handleDetail = (row) => {
  currentWarning.value = row
  detailDialogVisible.value = true
}

const handleProcess = (row) => {
  currentWarning.value = row
  processDialogVisible.value = true
}

const submitProcess = () => {
  console.log('Process submitted:', processForm)
  processDialogVisible.value = false
  // 更新预警状态
}

const exportData = () => {
  ElMessageBox.confirm(
    '确认导出当前筛选条件下的预警数据？',
    '导出确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('导出成功')
  })
}

const refreshList = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已更新')
  }, 1000)
}

// 自动刷新
let refreshTimer = null
const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    if (!loading.value) {
      refreshList()
    }
  }, 60000) // 每分钟刷新一次
}

onMounted(() => {
  startAutoRefresh()
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style lang="scss" scoped>
.warning-analysis {
  padding: 12px;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  color: #ffffff;

  .warning-header {
    margin-bottom: 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h2 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        background: linear-gradient(45deg, #4a9eff, #6ac6ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);

        .title-icon {
          vertical-align: middle;
          font-size: 28px;
          margin-right: 8px;
          color: #6ac6ff;
        }
      }

      .header-stats {
        display: flex;
        gap: 16px;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 12px;

          .stat-label {
            color: #8cc8ff;
            font-size: 14px;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #fff;

            &.warning {
              color: #E6A23C;
            }

            &.success {
              color: #67C23A;
            }
          }

          .stat-trend {
            font-size: 14px;
            padding: 2px 8px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);

            &.up {
              color: #F56C6C;
            }

            &.down {
              color: #67C23A;
            }
          }
        }
      }
    }

    .warning-filters {
      background: rgba(26, 35, 50, 0.8);
      border-radius: 12px;
      padding: 12px 16px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(74, 158, 255, 0.2);

      /* 滚动时固定于顶部，随后阴影提示 */
      position: sticky;
      top: 0;
      z-index: 50;
      transition: box-shadow 0.3s ease;

      &:hover,
      &.is-stuck {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .filter-form {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: flex-start;

        :deep(.el-form-item) {
          margin-bottom: 0;
          margin-right: 0;
        }
      }

      /* 小屏折叠布局 */
      @media (max-width: 768px) {
        .filter-form {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }
      }
    }
  }

  .warning-content {
    .warning-stat-card {
      background: rgba(26, 35, 50, 0.8);
      border: 1px solid rgba(74, 158, 255, 0.2);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(74, 158, 255, 0.1);
      }

      .stat-card-content {
        padding: 16px;

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .stat-card-title {
            font-size: 16px;
            font-weight: 500;
            color: #fff;
          }
        }

        .stat-card-body {
          .stat-card-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 12px;

            .percentage {
              color: #8cc8ff;
              font-size: 14px;
            }

            .trend {
              font-size: 14px;
              padding: 2px 8px;
              border-radius: 12px;
              background: rgba(255, 255, 255, 0.1);

              &.up {
                color: #F56C6C;
              }

              &.down {
                color: #67C23A;
              }
            }
          }
        }
      }

      &.info {
        border-left: 4px solid #909399;
      }

      &.warning {
        border-left: 4px solid #E6A23C;
      }

      &.danger {
        border-left: 4px solid #F56C6C;
      }

      &.error {
        border-left: 4px solid #ff0000;
      }
    }

    .warning-chart {
      margin: 16px 0;

      :deep(.el-card) {
        background: rgba(26, 35, 50, 0.8);
        border: 1px solid rgba(74, 158, 255, 0.2);
        border-radius: 12px;

        .el-card__header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 16px;

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            span {
              font-size: 16px;
              font-weight: 500;
              color: #fff;
            }

            .chart-controls {
              display: flex;
              align-items: center;
              gap: 16px;
            }
          }
        }

        .el-card__body {
          padding: 20px;
        }
      }

      .chart-container {
        height: 300px;
      }
    }

    .warning-list {
      :deep(.el-card) {
        background: rgba(26, 35, 50, 0.8);
        border: 1px solid rgba(74, 158, 255, 0.2);
        border-radius: 12px;

        /* Zebra striping & Hover highlight */
        .el-table__body {
          .el-table__row:nth-child(odd) td.el-table__cell {
            background-color: rgba(74, 158, 255, 0.03);
          }

          .el-table__row:hover td.el-table__cell {
            background-color: rgba(74, 158, 255, 0.08) !important;
          }
        }

        .el-card__header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px 20px;

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .header-left {
              display: flex;
              align-items: center;
              gap: 12px;

              span {
                font-size: 16px;
                font-weight: 500;
                color: #fff;
              }
            }

            .header-right {
              display: flex;
              align-items: center;
              gap: 16px;
            }
          }
        }

        .el-table {
          background: transparent;
          
          &::before {
            display: none;
          }

          .el-table__header-wrapper {
            th.el-table__cell {
              background-color: rgba(74, 158, 255, 0.1);
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              color: #8cc8ff;
              font-weight: 500;
            }
          }

          .el-table__body-wrapper {
            td.el-table__cell {
              background-color: transparent;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              color: #fff;
            }
          }

          .unhandled-warning {
            background-color: rgba(245, 108, 108, 0.1);
          }
        }
      }

      .pagination-container {
        margin-top: 12px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}

// 深色主题适配
:deep(.el-dialog) {
  background: rgba(26, 35, 50, 0.95);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  
  .el-dialog__header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-right: 0;
    padding: 20px;

    .el-dialog__title {
      color: #fff;
      font-size: 18px;
      font-weight: 500;
    }
  }
  
  .el-dialog__body {
    color: #fff;
    padding: 24px;
  }

  .el-dialog__footer {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 16px 20px;
  }
}

:deep(.el-descriptions) {
  .el-descriptions__header {
    margin-bottom: 16px;

    .el-descriptions__title {
      color: #fff;
      font-size: 16px;
      font-weight: 500;
    }
  }
  
  .el-descriptions__body {
    background-color: transparent;

    .el-descriptions__table {
      border-radius: 8px;
      overflow: hidden;
    }

    .el-descriptions__cell {
      background-color: rgba(74, 158, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.1);

      &.el-descriptions__label {
        color: #8cc8ff;
        font-weight: 500;
      }

      &.el-descriptions__content {
        color: #fff;
      }
    }
  }
}

:deep(.el-input__wrapper),
:deep(.el-select .el-input__wrapper),
:deep(.el-date-editor.el-input__wrapper) {
  background-color: rgba(0, 21, 41, 0.8) !important;
  border: 1px solid rgba(74, 158, 255, 0.3) !important;
  box-shadow: none !important;

  &:hover,
  &.is-focus {
    border-color: #4a9eff !important;
  }

  .el-input__inner {
    color: #fff !important;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5) !important;
    }
  }
}

:deep(.el-button) {
  &.el-button--primary {
    background: linear-gradient(45deg, #4a9eff, #6ac6ff) !important;
    border: none !important;
    
    &:hover {
      background: linear-gradient(45deg, #69b1ff, #89d5ff) !important;
    }
  }

  &.el-button--default {
    background: rgba(74, 158, 255, 0.1) !important;
    border: 1px solid rgba(74, 158, 255, 0.3) !important;
    color: #4a9eff !important;

    &:hover {
      background: rgba(74, 158, 255, 0.2) !important;
      border-color: #4a9eff !important;
    }
  }

  &.el-button--link {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;

    &:hover {
      color: #69b1ff !important;
    }
  }
}

:deep(.el-pagination) {
  .el-pagination__total,
  .el-pagination__sizes .el-input__inner,
  .el-pagination__jump .el-input__inner {
    background-color: transparent !important;
    color: #fff !important;
  }

  .btn-prev,
  .btn-next,
  .el-pager li {
    background-color: rgba(74, 158, 255, 0.1) !important;
    color: #fff !important;

    &:hover {
      color: #4a9eff !important;
    }

    &.is-active {
      background-color: #4a9eff !important;
      color: #fff !important;
    }
  }
}

.process-info {
  p {
    margin: 8px 0;
    color: #fff;
    line-height: 1.5;
  }
}

/* ---------- 新增整体动效与细节美化 ---------- */

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.warning-analysis {
  /* 卡片、列表、表头淡入 */
  .warning-stat-card,
  .warning-chart :deep(.el-card),
  .warning-list :deep(.el-card) {
    animation: fadeInUp 0.6s ease both;
  }

  /* 表格行交替背景与 Hover 高亮 */
  .warning-list {
    :deep(.el-table__body) {
      .el-table__row:nth-child(odd) td.el-table__cell {
        background-color: rgba(74, 158, 255, 0.03);
      }

      .el-table__row:hover td.el-table__cell {
        background-color: rgba(74, 158, 255, 0.08) !important;
      }
    }
  }

  /* 标题渐变下划线 */
  .header-content {
    h2 {
      position: relative;

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

  /* 响应式：<=768px 时改为列布局 */
  @media (max-width: 768px) {
    .warning-header .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .warning-content .warning-stat-card {
      margin-bottom: 16px;
    }
  }
}
</style> 