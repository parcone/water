<template>
  <div 
    :class="['stat-card', type, { 'stat-card--clickable': clickable }]"
    @click="handleClick"
  >
    <!-- 背景装饰 -->
    <div class="stat-card__bg">
      <div class="bg-pattern"></div>
      <div class="bg-gradient"></div>
    </div>
    
    <!-- 主要内容 -->
    <div class="stat-card__content">
      <div class="stat-card__icon">
        <div class="icon-wrapper">
          <el-icon><component :is="icon" /></el-icon>
        </div>
        <div class="icon-glow"></div>
      </div>
      
      <div class="stat-card__info">
        <div class="stat-value">
          <animated-number 
            v-if="animated" 
            :value="numericValue" 
            :duration="animationDuration"
            :format="formatValue"
          />
          <span v-else>{{ formattedValue }}</span>
        </div>
        <div class="stat-label">{{ label }}</div>
        
        <!-- 趋势指示器 -->
        <div v-if="trend" class="stat-trend" :class="trendDirection">
          <el-icon v-if="trendDirection === 'up'"><TrendUp /></el-icon>
          <el-icon v-else-if="trendDirection === 'down'"><TrendDown /></el-icon>
          <el-icon v-else><Minus /></el-icon>
          <span class="trend-text">{{ trend }}</span>
        </div>
        
        <!-- 小图表 -->
        <div v-if="sparklineData" class="stat-sparkline">
          <base-e-chart 
            :options="sparklineOptions" 
            height="40px" 
            :auto-resize="true"
          />
        </div>
      </div>
    </div>
    
    <!-- 更多信息按钮 -->
    <div v-if="showMore" class="stat-card__more">
      <el-icon><MoreFilled /></el-icon>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="stat-card__loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { TrendUp, TrendDown, Minus, MoreFilled, Loading } from '@element-plus/icons-vue'
import AnimatedNumber from './AnimatedNumber.vue'
import BaseEChart from './BaseEChart.vue'

export default {
  name: 'StatCard',
  components: {
    TrendUp,
    TrendDown,
    Minus,
    MoreFilled,
    Loading,
    AnimatedNumber,
    BaseEChart
  },
  props: {
    type: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'success', 'warning', 'error', 'info'].includes(value)
    },
    icon: {
      type: [String, Object],
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    trend: {
      type: String,
      default: ''
    },
    trendDirection: {
      type: String,
      default: '',
      validator: (value) => ['up', 'down', 'flat', ''].includes(value)
    },
    unit: {
      type: String,
      default: ''
    },
    precision: {
      type: Number,
      default: 0
    },
    animated: {
      type: Boolean,
      default: true
    },
    animationDuration: {
      type: Number,
      default: 1000
    },
    clickable: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    showMore: {
      type: Boolean,
      default: false
    },
    sparklineData: {
      type: Array,
      default: () => null
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    // 数值处理
    const numericValue = computed(() => {
      return typeof props.value === 'number' ? props.value : parseFloat(props.value) || 0
    })
    
    const formattedValue = computed(() => {
      const val = numericValue.value
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M'
      }
      if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K'
      }
      return val.toFixed(props.precision)
    })
    
    const formatValue = (value) => {
      const val = parseFloat(value) || 0
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M'
      }
      if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K'
      }
      return val.toFixed(props.precision) + (props.unit ? ` ${props.unit}` : '')
    }
    
    // 小图表配置
    const sparklineOptions = computed(() => {
      if (!props.sparklineData) return {}
      
      return {
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        },
        xAxis: {
          type: 'category',
          show: false,
          data: props.sparklineData.map((_, index) => index)
        },
        yAxis: {
          type: 'value',
          show: false
        },
        series: [{
          data: props.sparklineData,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color: getSparklineColor()
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: getSparklineColor(0.3)
              }, {
                offset: 1,
                color: getSparklineColor(0)
              }]
            }
          }
        }]
      }
    })
    
    const getSparklineColor = (opacity = 1) => {
      const colors = {
        primary: `rgba(24, 144, 255, ${opacity})`,
        success: `rgba(82, 196, 26, ${opacity})`,
        warning: `rgba(250, 173, 20, ${opacity})`,
        error: `rgba(255, 77, 79, ${opacity})`,
        info: `rgba(24, 144, 255, ${opacity})`
      }
      return colors[props.type] || colors.primary
    }
    
    const handleClick = () => {
      if (props.clickable) {
        emit('click')
      }
    }
    
    return {
      numericValue,
      formattedValue,
      formatValue,
      sparklineOptions,
      handleClick
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.stat-card {
  position: relative;
  background: $background-base;
  border-radius: $border-radius-xl;
  padding: $spacing-xl;
  box-shadow: $shadow-1;
  border: 1px solid $border-color-light;
  overflow: hidden;
  transition: all $animation-duration-base $ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: $primary-color;
    transform: scaleY(0);
    transition: transform $animation-duration-base $ease-out;
    transform-origin: bottom;
  }
  
  &:hover {
    box-shadow: $shadow-hover;
    transform: translateY(-4px);
    
    &::before {
      transform: scaleY(1);
    }
    
    .stat-card__icon .icon-wrapper {
      transform: scale(1.1) rotate(5deg);
    }
    
    .icon-glow {
      opacity: 1;
      transform: scale(1.2);
    }
    
    .stat-card__more {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &--clickable {
    cursor: pointer;
    
    &:active {
      transform: translateY(-2px);
    }
  }
  
  // 背景装饰
  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
    pointer-events: none;
    
    .bg-pattern {
      position: absolute;
      top: -50%;
      right: -20%;
      width: 120px;
      height: 120px;
      background: radial-gradient(circle, currentColor 1px, transparent 1px);
      background-size: 20px 20px;
      opacity: 0.3;
      animation: float 6s ease-in-out infinite;
    }
    
    .bg-gradient {
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, currentColor 0%, transparent 70%);
      opacity: 0.1;
    }
  }
  
  // 主要内容
  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    gap: $spacing-lg;
  }
  
  // 图标区域
  &__icon {
    position: relative;
    flex-shrink: 0;
    
    .icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: $border-radius-xl;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: white;
      background: $primary-color;
      transition: all $animation-duration-base $ease-out;
      position: relative;
      z-index: 2;
    }
    
    .icon-glow {
      position: absolute;
      top: 0;
      left: 0;
      width: 64px;
      height: 64px;
      border-radius: $border-radius-xl;
      background: $primary-color;
      opacity: 0;
      filter: blur(8px);
      transition: all $animation-duration-base $ease-out;
      z-index: 1;
    }
  }
  
  // 信息区域
  &__info {
    flex: 1;
    min-width: 0;
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: $font-weight-bold;
      line-height: 1;
      margin-bottom: $spacing-xs;
      color: $text-primary;
      
      @media (max-width: $screen-sm) {
        font-size: 2rem;
      }
    }
    
    .stat-label {
      font-size: $font-size-base;
      color: $text-secondary;
      font-weight: $font-weight-medium;
      margin-bottom: $spacing-sm;
    }
    
    .stat-trend {
      display: inline-flex;
      align-items: center;
      gap: $spacing-xs;
      padding: $spacing-xs $spacing-sm;
      border-radius: $border-radius-pill;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      
      .el-icon {
        font-size: 14px;
      }
      
      &.up {
        color: $success-color;
        background: $success-light;
        
        .el-icon {
          animation: bounce-up 2s infinite;
        }
      }
      
      &.down {
        color: $error-color;
        background: $error-light;
        
        .el-icon {
          animation: bounce-down 2s infinite;
        }
      }
      
      &.flat {
        color: $text-secondary;
        background: $background-lighter;
      }
    }
    
    .stat-sparkline {
      margin-top: $spacing-md;
      height: 40px;
      opacity: 0.8;
      transition: opacity $animation-duration-base $ease-out;
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
  // 更多按钮
  &__more {
    position: absolute;
    top: $spacing-md;
    right: $spacing-md;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-secondary;
    opacity: 0;
    transform: translateY(-4px);
    transition: all $animation-duration-base $ease-out;
    cursor: pointer;
    
    &:hover {
      background: rgba(0, 0, 0, 0.15);
      color: $text-primary;
    }
  }
  
  // 加载状态
  &__loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    
    .loading-icon {
      font-size: 32px;
      color: $primary-color;
      animation: spin 1s linear infinite;
    }
  }
  
  // 主题变体
  &.primary {
    &::before,
    .stat-card__icon .icon-wrapper,
    .stat-card__icon .icon-glow {
      background: $primary-color;
    }
    
    .stat-card__bg {
      color: $primary-color;
    }
  }
  
  &.success {
    &::before,
    .stat-card__icon .icon-wrapper,
    .stat-card__icon .icon-glow {
      background: $success-color;
    }
    
    .stat-card__bg {
      color: $success-color;
    }
  }
  
  &.warning {
    &::before,
    .stat-card__icon .icon-wrapper,
    .stat-card__icon .icon-glow {
      background: $warning-color;
    }
    
    .stat-card__bg {
      color: $warning-color;
    }
  }
  
  &.error {
    &::before,
    .stat-card__icon .icon-wrapper,
    .stat-card__icon .icon-glow {
      background: $error-color;
    }
    
    .stat-card__bg {
      color: $error-color;
    }
  }
  
  &.info {
    &::before,
    .stat-card__icon .icon-wrapper,
    .stat-card__icon .icon-glow {
      background: $info-color;
    }
    
    .stat-card__bg {
      color: $info-color;
    }
  }
}

// 动画
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

@keyframes bounce-up {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

@keyframes bounce-down {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(2px);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式调整
@media (max-width: $screen-md) {
  .stat-card {
    padding: $spacing-lg;
    
    &__content {
      gap: $spacing-md;
    }
    
    &__icon .icon-wrapper {
      width: 48px;
      height: 48px;
      font-size: 24px;
    }
    
    &__icon .icon-glow {
      width: 48px;
      height: 48px;
    }
  }
}

@media (max-width: $screen-sm) {
  .stat-card {
    padding: $spacing-md;
    
    &__content {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-sm;
    }
    
    &__info .stat-value {
      font-size: 1.8rem;
    }
  }
}
</style> 