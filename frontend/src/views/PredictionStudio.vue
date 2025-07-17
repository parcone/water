<template>
  <div class="prediction-studio">
    <el-page-header content="智能预测实验室" style="margin-bottom: 20px" />

    <!-- 顶部模型选择与评估指标 -->
    <el-card shadow="hover" class="model-config-card">
      <template #header>
        <div class="card-header">
          <span>模型配置</span>
          <el-button type="primary" size="small" @click="trainModel">
            <el-icon><Refresh /></el-icon>
            重新训练
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="config" label-width="100px">
        <el-form-item label="选择模型">
          <el-select v-model="config.model" placeholder="请选择模型" style="width: 180px">
            <el-option v-for="m in models" :key="m.value" :label="m.label" :value="m.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="预测步长">
          <el-input-number v-model="config.horizon" :min="1" :max="72" />
        </el-form-item>
        <el-form-item label="训练集比例">
          <el-slider v-model="config.trainSplit" :min="0.5" :max="0.95" :step="0.05" style="width: 200px" />
        </el-form-item>
      </el-form>

      <el-divider />
      <el-row :gutter="20">
        <el-col :span="6" v-for="metric in metrics" :key="metric.label">
          <div class="metric-card">
            <div class="metric-label">{{ metric.label }}</div>
            <animated-number :value="metric.value" :duration="800" />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <span>预测结果（实际值 vs 预测值）</span>
          </template>
          <base-e-chart :options="forecastChartOptions" height="400px" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>特征重要性</span>
          </template>
          <base-e-chart :options="importanceChartOptions" height="400px" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" style="margin-top: 20px">
      <template #header>
        <span>预测数据表</span>
      </template>
      <el-table :data="tableData" height="300" size="small" stripe>
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="actual" label="实际值" />
        <el-table-column prop="predicted" label="预测值" />
        <el-table-column prop="error" label="误差" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import BaseEChart from '@/components/BaseEChart.vue'
import AnimatedNumber from '@/components/AnimatedNumber.vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

// 模型候选
const models = [
  { label: 'LSTM 双层', value: 'lstm' },
  { label: 'ARIMA', value: 'arima' },
  { label: 'Prophet', value: 'prophet' },
  { label: 'XGBoost', value: 'xgb' }
]

// 表单配置
const config = reactive({
  model: 'lstm',
  horizon: 24,
  trainSplit: 0.8
})

const metrics = reactive([
  { label: 'MAE', value: 1.12 },
  { label: 'RMSE', value: 1.95 },
  { label: 'MAPE(%)', value: 3.25 },
  { label: 'R²', value: 0.93 }
])

// 图表配置（静态示例数据）
const forecastChartOptions = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['实际值', '预测值'] },
  xAxis: {
    type: 'category',
    data: Array.from({ length: 24 }).map((_, i) => `${i}:00`)
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '实际值',
      type: 'line',
      data: Array.from({ length: 24 }).map(() => (Math.random() * 20 + 30).toFixed(2))
    },
    {
      name: '预测值',
      type: 'line',
      areaStyle: {},
      data: Array.from({ length: 24 }).map(() => (Math.random() * 20 + 30).toFixed(2))
    }
  ]
})

const importanceChartOptions = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'value' },
  yAxis: {
    type: 'category',
    data: ['温度', '湿度', '风速', '土壤含水量', '降雨量'],
    inverse: true
  },
  series: [{
    type: 'bar',
    data: [0.35, 0.28, 0.18, 0.12, 0.07],
    itemStyle: { color: '#409EFF' },
    label: { show: true, position: 'right', formatter: '{c}%'}
  }]
})

// 表格示例数据
const tableData = ref(
  Array.from({ length: 24 }).map((_, i) => {
    const actual = +(Math.random() * 20 + 30).toFixed(2)
    const predicted = +(actual + (Math.random() * 2 - 1)).toFixed(2)
    return {
      time: `${i}:00`,
      actual,
      predicted,
      error: +(predicted - actual).toFixed(2)
    }
  })
)

// 模拟训练模型
function trainModel() {
  ElMessage.success('已触发模型重新训练（示例）')
  // TODO: 调用后端训练接口
}
</script>

<style scoped>
.prediction-studio {
  padding: 24px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.metric-card {
  text-align: center;
  padding: 12px 0;
  border-right: 1px solid #eee;
}
.metric-card:last-child {
  border-right: none;
}
.metric-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 4px;
}
</style> 