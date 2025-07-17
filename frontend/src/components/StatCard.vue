<template>
  <div :class="['stat-card', type]">
    <div class="stat-icon">
      <el-icon><component :is="icon" /></el-icon>
    </div>
    <div class="stat-content">
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
      <div v-if="trend" :class="['stat-trend', trendDirection]">
        <el-icon v-if="trendDirection === 'up'"><ArrowUp /></el-icon>
        <el-icon v-else-if="trendDirection === 'down'"><ArrowDown /></el-icon>
        <span>{{ trend }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

export default {
  name: 'StatCard',
  components: {
    ArrowUp,
    ArrowDown
  },
  props: {
    type: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'success', 'warning', 'error', 'info'].includes(value)
    },
    icon: {
      type: String,
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
      validator: (value) => ['up', 'down', ''].includes(value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.stat-card {
  &.primary {
    .stat-icon {
      color: $primary-color;
      background: rgba($primary-color, 0.1);
    }
    .stat-trend.up { color: $success-color; }
    .stat-trend.down { color: $error-color; }
  }

  &.success {
    .stat-icon {
      color: $success-color;
      background: rgba($success-color, 0.1);
    }
    .stat-trend.up { color: $success-color; }
    .stat-trend.down { color: $warning-color; }
  }

  &.warning {
    .stat-icon {
      color: $warning-color;
      background: rgba($warning-color, 0.1);
    }
    .stat-trend.up { color: $success-color; }
    .stat-trend.down { color: $warning-color; }
  }

  &.error {
    .stat-icon {
      color: $error-color;
      background: rgba($error-color, 0.1);
    }
    .stat-trend.up { color: $success-color; }
    .stat-trend.down { color: $error-color; }
  }

  &.info {
    .stat-icon {
      color: $info-color;
      background: rgba($info-color, 0.1);
    }
    .stat-trend.up { color: $success-color; }
    .stat-trend.down { color: $info-color; }
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: $border-radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .stat-trend {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-sm;
    margin-top: $spacing-xs;

    .el-icon {
      font-size: 14px;
    }
  }
}
</style> 