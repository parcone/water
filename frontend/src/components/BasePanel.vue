<template>
  <div class="panel" :class="{ loading }">
    <div class="panel-header">
      <div class="header-left">
        <h3>{{ title }}</h3>
        <slot name="header-left" />
      </div>
      <div class="header-right">
        <slot name="header-right" />
      </div>
    </div>
    <div class="panel-body">
      <div v-if="loading" class="panel-loading">
        <el-icon class="loading-icon" :size="32"><Loading /></el-icon>
        <span class="loading-text">{{ loadingText }}</span>
      </div>
      <slot v-else />
    </div>
    <div v-if="$slots.footer" class="panel-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
import { Loading } from '@element-plus/icons-vue'

export default {
  name: 'BasePanel',
  components: {
    Loading
  },
  props: {
    title: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '加载中...'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.panel {
  position: relative;
  min-height: 100px;

  &.loading .panel-body {
    min-height: 200px;
  }

  .panel-loading {
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

  .panel-footer {
    padding: $spacing-md;
    border-top: 1px solid $border-color;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 