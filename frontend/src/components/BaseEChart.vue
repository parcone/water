<!-- ECharts基础组件 -->
<template>
  <div 
    ref="chartRef" 
    :style="{ 
      width: width, 
      height: height,
      minHeight: computedMinHeight
    }"
  ></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { debounce } from 'lodash-es'

export default {
  name: 'BaseEChart',
  props: {
    options: {
      type: Object,
      required: true
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '100%'
    },
    minHeight: {
      type: String,
      default: '300px'
    },
    theme: {
      type: String,
      default: ''
    }
  },
  emits: ['chartReady', 'chartError'],
  setup(props, { emit }) {
    const chartRef = ref(null)
    let chart = null
    const isInitialized = ref(false)

    const computedMinHeight = computed(() => {
      return props.height === '100%' ? props.minHeight : 'auto'
    })

    // 初始化图表
    const initChart = async () => {
      try {
        if (!chartRef.value || isInitialized.value) return
        
        // 等待DOM更新
        await new Promise(resolve => setTimeout(resolve, 0))
        
        if (!chartRef.value) {
          throw new Error('Chart container not found')
        }

        chart = echarts.init(chartRef.value, props.theme)
        chart.setOption(props.options, true)
        isInitialized.value = true
        emit('chartReady', chart)

        // 监听窗口大小变化
        window.addEventListener('resize', handleResize)
      } catch (error) {
        console.error('Chart initialization failed:', error)
        emit('chartError', error)
      }
    }

    // 防抖处理窗口大小变化
    const handleResize = debounce(() => {
      if (chart && chartRef.value) {
        chart.resize()
      }
    }, 100)

    // 更新图表选项
    const updateChart = () => {
      if (!chart || !chartRef.value) return
      try {
        chart.setOption(props.options, true)
      } catch (error) {
        console.error('Chart update failed:', error)
        emit('chartError', error)
      }
    }

    // 监听选项变化
    watch(
      () => props.options,
      () => {
        if (isInitialized.value) {
          updateChart()
        }
      },
      { deep: true }
    )

    // 生命周期钩子
    onMounted(() => {
      initChart()
    })

    onBeforeUnmount(() => {
      if (!chart) return
      window.removeEventListener('resize', handleResize)
      chart.dispose()
      chart = null
      isInitialized.value = false
    })

    return {
      chartRef,
      computedMinHeight
    }
  }
}
</script>

<style scoped>
div {
  position: relative;
}
</style> 