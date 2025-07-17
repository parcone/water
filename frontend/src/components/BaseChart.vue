<template>
  <div
    class="base-chart"
    :class="{ loading }"
    :style="{ height: typeof height === 'number' ? `${height}px` : height }"
  >
    <div ref="chartRef" class="chart-container"></div>
    <div v-if="loading" class="chart-loading">
      <el-icon class="loading-icon" :size="32"><Loading /></el-icon>
      <span class="loading-text">{{ loadingText }}</span>
    </div>
    <div v-if="!loading && showEmpty" class="chart-empty">
      <el-empty :description="emptyText" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { debounce } from 'lodash-es'

export default {
  name: 'BaseChart',
  components: {
    Loading
  },
  props: {
    options: {
      type: Object,
      required: true
    },
    height: {
      type: [String, Number],
      default: '400px'
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '加载中...'
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    theme: {
      type: String,
      default: ''
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    showEmpty: {
      type: Boolean,
      default: false
    }
  },
  emits: ['chart-ready', 'chart-click', 'chart-error'],
  setup(props, { emit }) {
    const chartRef = ref(null)
    let chart = null

    // 初始化图表
    const initChart = () => {
      if (!chartRef.value) return

      try {
        chart = echarts.init(chartRef.value, props.theme)
        chart.setOption(props.options)
        
        // 绑定事件
        chart.on('click', (params) => {
          emit('chart-click', params)
        })

        emit('chart-ready', chart)
      } catch (error) {
        console.error('Chart initialization error:', error)
        emit('chart-error', error)
      }
    }

    // 更新图表选项
    const updateChart = () => {
      if (!chart) return

      try {
        chart.setOption(props.options)
      } catch (error) {
        console.error('Chart update error:', error)
        emit('chart-error', error)
      }
    }

    // 调整图表大小
    const resizeChart = debounce(() => {
      if (chart) {
        chart.resize()
      }
    }, 100)

    // 监听选项变化
    watch(() => props.options, () => {
      updateChart()
    }, { deep: true })

    // 监听主题变化
    watch(() => props.theme, () => {
      if (chart) {
        chart.dispose()
        initChart()
      }
    })

    onMounted(() => {
      initChart()
      if (props.autoResize) {
        window.addEventListener('resize', resizeChart)
      }
    })

    onBeforeUnmount(() => {
      if (props.autoResize) {
        window.removeEventListener('resize', resizeChart)
      }
      if (chart) {
        chart.dispose()
        chart = null
      }
    })

    return {
      chartRef
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.base-chart {
  position: relative;
  width: 100%;
  min-height: 200px;

  .chart-container {
    width: 100%;
    height: 100%;
  }

  .chart-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;

    .loading-icon {
      animation: rotate 1s linear infinite;
      color: $primary-color;
    }

    .loading-text {
      color: $text-secondary;
      font-size: $font-size-base;
    }
  }

  .chart-empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 