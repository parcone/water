<template>
  <div 
    :class="[
      'base-panel',
      `base-panel--${size}`,
      {
        'base-panel--loading': loading,
        'base-panel--collapsible': collapsible,
        'base-panel--collapsed': isCollapsed,
        'base-panel--hoverable': hoverable,
        'base-panel--borderless': borderless
      }
    ]"
  >
    <!-- 面板头部 -->
    <div 
      v-if="title || $slots.header || $slots.extra" 
      class="base-panel__header"
      @click="collapsible && toggleCollapse()"
    >
      <div class="header-left">
        <!-- 折叠图标 -->
        <el-icon 
          v-if="collapsible" 
          class="collapse-icon"
          :class="{ 'is-collapsed': isCollapsed }"
        >
          <ArrowDown />
        </el-icon>
        
        <!-- 标题区域 -->
        <div class="title-section">
          <h3 v-if="title" class="panel-title">{{ title }}</h3>
          <span v-if="subtitle" class="panel-subtitle">{{ subtitle }}</span>
          <slot name="header" />
        </div>
      </div>
      
      <div class="header-right">
        <slot name="extra" />
        
        <!-- 工具栏 -->
        <div v-if="showToolbar" class="panel-toolbar">
          <el-tooltip content="刷新" placement="top">
            <el-button 
              type="text" 
              size="small" 
              class="toolbar-btn"
              @click.stop="handleRefresh"
            >
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
          
          <el-tooltip content="全屏" placement="top">
            <el-button 
              type="text" 
              size="small" 
              class="toolbar-btn"
              @click.stop="handleFullscreen"
            >
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
          
          <el-tooltip content="设置" placement="top">
            <el-button 
              type="text" 
              size="small" 
              class="toolbar-btn"
              @click.stop="handleSettings"
            >
              <el-icon><Setting /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 面板内容 -->
    <transition name="panel-collapse">
      <div v-show="!isCollapsed" class="base-panel__body">
        <!-- 加载状态 -->
        <div v-if="loading" class="panel-loading">
          <div class="loading-content">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span class="loading-text">{{ loadingText }}</span>
          </div>
        </div>
        
        <!-- 错误状态 -->
        <div v-else-if="error" class="panel-error">
          <div class="error-content">
            <el-icon class="error-icon"><Warning /></el-icon>
            <div class="error-text">
              <h4>{{ errorTitle || '加载失败' }}</h4>
              <p>{{ error }}</p>
            </div>
            <el-button type="primary" @click="handleRetry">重试</el-button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="empty" class="panel-empty">
          <div class="empty-content">
            <el-icon class="empty-icon"><DocumentDelete /></el-icon>
            <div class="empty-text">
              <h4>{{ emptyTitle || '暂无数据' }}</h4>
              <p>{{ emptyDescription || '暂时没有可显示的内容' }}</p>
            </div>
            <el-button v-if="showEmptyAction" type="primary" @click="handleEmptyAction">
              {{ emptyActionText || '立即添加' }}
            </el-button>
          </div>
        </div>
        
        <!-- 主要内容 -->
        <div v-else class="panel-content">
          <slot />
        </div>
      </div>
    </transition>

    <!-- 面板底部 -->
    <div v-if="$slots.footer" class="base-panel__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { 
  Loading, 
  Warning, 
  DocumentDelete, 
  ArrowDown, 
  Refresh, 
  FullScreen, 
  Setting 
} from '@element-plus/icons-vue'

export default {
  name: 'BasePanel',
  components: {
    Loading,
    Warning,
    DocumentDelete,
    ArrowDown,
    Refresh,
    FullScreen,
    Setting
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '加载中...'
    },
    error: {
      type: [String, Boolean],
      default: false
    },
    errorTitle: {
      type: String,
      default: ''
    },
    empty: {
      type: Boolean,
      default: false
    },
    emptyTitle: {
      type: String,
      default: ''
    },
    emptyDescription: {
      type: String,
      default: ''
    },
    emptyActionText: {
      type: String,
      default: ''
    },
    showEmptyAction: {
      type: Boolean,
      default: false
    },
    collapsible: {
      type: Boolean,
      default: false
    },
    collapsed: {
      type: Boolean,
      default: false
    },
    hoverable: {
      type: Boolean,
      default: true
    },
    borderless: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['small', 'default', 'large'].includes(value)
    },
    showToolbar: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-collapse', 'refresh', 'fullscreen', 'settings', 'retry', 'empty-action'],
  setup(props, { emit }) {
    const isCollapsed = ref(props.collapsed)
    
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
      emit('toggle-collapse', isCollapsed.value)
    }
    
    const handleRefresh = () => {
      emit('refresh')
    }
    
    const handleFullscreen = () => {
      emit('fullscreen')
    }
    
    const handleSettings = () => {
      emit('settings')
    }
    
    const handleRetry = () => {
      emit('retry')
    }
    
    const handleEmptyAction = () => {
      emit('empty-action')
    }
    
    return {
      isCollapsed,
      toggleCollapse,
      handleRefresh,
      handleFullscreen,
      handleSettings,
      handleRetry,
      handleEmptyAction
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.base-panel {
  background: $background-base;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-1;
  border: 1px solid $border-color-light;
  overflow: hidden;
  transition: all $animation-duration-base $ease-out;
  position: relative;
  
  &--hoverable:hover {
    box-shadow: $shadow-hover;
    transform: translateY(-2px);
  }
  
  &--borderless {
    border: none;
    box-shadow: none;
  }
  
  &--loading {
    pointer-events: none;
  }
  
  // 尺寸变体
  &--small {
    .base-panel__header {
      padding: $spacing-md $spacing-lg;
      
      .panel-title {
        font-size: $font-size-base;
      }
    }
    
    .base-panel__body {
      padding: $spacing-md $spacing-lg;
    }
    
    .base-panel__footer {
      padding: $spacing-md $spacing-lg;
    }
  }
  
  &--default {
    .base-panel__header {
      padding: $spacing-lg $spacing-xl;
    }
    
    .base-panel__body {
      padding: $spacing-xl;
    }
    
    .base-panel__footer {
      padding: $spacing-lg $spacing-xl;
    }
  }
  
  &--large {
    .base-panel__header {
      padding: $spacing-xl $spacing-xxl;
    }
    
    .base-panel__body {
      padding: $spacing-xxl;
    }
    
    .base-panel__footer {
      padding: $spacing-xl $spacing-xxl;
    }
  }
  
  // 面板头部
  &__header {
    background: $background-light;
    border-bottom: 1px solid $border-color-light;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all $animation-duration-base $ease-out;
    
    .base-panel--collapsible & {
      cursor: pointer;
      
      &:hover {
        background: rgba(0, 0, 0, 0.02);
      }
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      flex: 1;
      min-width: 0;
      
      .collapse-icon {
        color: $text-secondary;
        font-size: 16px;
        transition: transform $animation-duration-base $ease-out;
        
        &.is-collapsed {
          transform: rotate(-90deg);
        }
      }
      
      .title-section {
        flex: 1;
        min-width: 0;
        
        .panel-title {
          font-size: $font-size-lg;
          font-weight: $font-weight-semibold;
          color: $text-primary;
          margin: 0;
          line-height: 1.4;
        }
        
        .panel-subtitle {
          font-size: $font-size-sm;
          color: $text-secondary;
          font-weight: $font-weight-normal;
          margin-top: $spacing-xs;
          display: block;
        }
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      
      .panel-toolbar {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        
        .toolbar-btn {
          width: 28px;
          height: 28px;
          padding: 0;
          border-radius: $border-radius-sm;
          color: $text-secondary;
          transition: all $animation-duration-fast $ease-out;
          
          &:hover {
            color: $primary-color;
            background: rgba(24, 144, 255, 0.1);
            transform: translateY(-1px);
          }
          
          .el-icon {
            font-size: 14px;
          }
        }
      }
    }
  }
  
  // 面板内容
  &__body {
    position: relative;
    min-height: 120px;
    
    .panel-content {
      position: relative;
      z-index: 1;
    }
    
    // 加载状态
    .panel-loading {
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
      
      .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: $spacing-md;
        
        .loading-icon {
          font-size: 32px;
          color: $primary-color;
          animation: spin 1s linear infinite;
        }
        
        .loading-text {
          color: $text-secondary;
          font-size: $font-size-base;
          font-weight: $font-weight-medium;
        }
      }
    }
    
    // 错误状态
    .panel-error {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: $spacing-xxl;
      text-align: center;
      
      .error-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: $spacing-lg;
        max-width: 400px;
        
        .error-icon {
          font-size: 48px;
          color: $error-color;
        }
        
        .error-text {
          h4 {
            font-size: $font-size-lg;
            font-weight: $font-weight-semibold;
            color: $text-primary;
            margin: 0 0 $spacing-sm 0;
          }
          
          p {
            font-size: $font-size-base;
            color: $text-secondary;
            line-height: 1.6;
            margin: 0;
          }
        }
      }
    }
    
    // 空状态
    .panel-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: $spacing-xxl;
      text-align: center;
      
      .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: $spacing-lg;
        max-width: 400px;
        
        .empty-icon {
          font-size: 48px;
          color: $text-disabled;
        }
        
        .empty-text {
          h4 {
            font-size: $font-size-lg;
            font-weight: $font-weight-semibold;
            color: $text-primary;
            margin: 0 0 $spacing-sm 0;
          }
          
          p {
            font-size: $font-size-base;
            color: $text-secondary;
            line-height: 1.6;
            margin: 0;
          }
        }
      }
    }
  }
  
  // 面板底部
  &__footer {
    background: $background-light;
    border-top: 1px solid $border-color-light;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

// 折叠动画
.panel-collapse-enter-active,
.panel-collapse-leave-active {
  transition: all $animation-duration-base $ease-out;
  overflow: hidden;
}

.panel-collapse-enter-from,
.panel-collapse-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.panel-collapse-enter-to,
.panel-collapse-leave-from {
  max-height: 1000px;
  opacity: 1;
  transform: translateY(0);
}

// 动画
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
  .base-panel {
    &--small .base-panel__header,
    &--default .base-panel__header,
    &--large .base-panel__header {
      padding: $spacing-md $spacing-lg;
      
      .header-left {
        gap: $spacing-sm;
      }
      
      .header-right {
        gap: $spacing-sm;
      }
    }
    
    &--small .base-panel__body,
    &--default .base-panel__body,
    &--large .base-panel__body {
      padding: $spacing-lg;
    }
    
    &--small .base-panel__footer,
    &--default .base-panel__footer,
    &--large .base-panel__footer {
      padding: $spacing-md $spacing-lg;
    }
  }
}

@media (max-width: $screen-sm) {
  .base-panel {
    &__header {
      .header-left {
        .title-section {
          .panel-title {
            font-size: $font-size-base;
          }
          
          .panel-subtitle {
            font-size: $font-size-xs;
          }
        }
      }
      
      .header-right {
        .panel-toolbar {
          gap: $spacing-xs;
          
          .toolbar-btn {
            width: 24px;
            height: 24px;
            
            .el-icon {
              font-size: 12px;
            }
          }
        }
      }
    }
    
    &__body {
      .panel-error,
      .panel-empty {
        padding: $spacing-lg;
        
        .error-content,
        .empty-content {
          gap: $spacing-md;
          
          .error-icon,
          .empty-icon {
            font-size: 36px;
          }
        }
      }
    }
  }
}
</style> 