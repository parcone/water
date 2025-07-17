<!-- 主布局组件 -->
<template>
  <div class="main-layout">
    <!-- 侧边导航栏 (移动端) -->
    <div 
      v-if="isMobile" 
      class="mobile-sidebar-overlay" 
      :class="{ show: showMobileSidebar }"
      @click="showMobileSidebar = false"
    ></div>
    
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <!-- 移动端菜单按钮 -->
        <el-button 
          v-if="isMobile"
          type="text" 
          class="mobile-menu-btn"
          @click="showMobileSidebar = !showMobileSidebar"
        >
          <el-icon><Menu /></el-icon>
        </el-button>
        
        <div class="logo">
          <div class="logo-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="logo-content">
            <h1 class="logo-text">智能先知</h1>
            <span class="logo-subtitle">多变量土湿预测监测系统</span>
          </div>
        </div>
      </div>
      
      <nav class="nav-container" :class="{ 'mobile-nav': isMobile && showMobileSidebar }">
        <el-menu
          :default-active="activeMenu"
          :mode="isMobile ? 'vertical' : 'horizontal'"
          class="main-menu"
          background-color="transparent"
          text-color="rgba(255, 255, 255, 0.85)"
          active-text-color="#40a9ff"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/overview" class="menu-item">
            <el-icon><Monitor /></el-icon>
            <span>实时监测</span>
            <div class="menu-item-indicator"></div>
          </el-menu-item>
          <el-menu-item index="/monitoring" class="menu-item">
            <el-icon><VideoCamera /></el-icon>
            <span>智能预测</span>
            <div class="menu-item-indicator"></div>
          </el-menu-item>
          <el-menu-item index="/analysis" class="menu-item">
            <el-icon><DataLine /></el-icon>
            <span>趋势分析</span>
            <div class="menu-item-indicator"></div>
          </el-menu-item>
          <el-menu-item index="/warning-analysis" class="menu-item">
            <el-icon><Warning /></el-icon>
            <span>预警分析</span>
            <div class="menu-item-indicator"></div>
          </el-menu-item>
          <el-menu-item index="/evaluation" class="menu-item">
            <el-icon><TrendCharts /></el-icon>
            <span>预警评估</span>
            <div class="menu-item-indicator"></div>
          </el-menu-item>
        </el-menu>
      </nav>
      
      <div class="header-right">
        <!-- 工具栏 -->
        <div class="toolbar">
          <el-tooltip content="全屏" placement="bottom">
            <el-button type="text" class="toolbar-btn" @click="toggleFullscreen">
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
          
          <el-tooltip content="刷新" placement="bottom">
            <el-button type="text" class="toolbar-btn" @click="refreshPage">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
          
          <el-tooltip content="通知" placement="bottom">
            <el-button type="text" class="toolbar-btn" @click="showNotifications">
              <el-badge :value="notificationCount" :hidden="notificationCount === 0">
                <el-icon><Bell /></el-icon>
              </el-badge>
            </el-button>
          </el-tooltip>
        </div>
        
        <!-- 用户菜单 -->
        <el-dropdown trigger="click" class="user-dropdown">
          <div class="user-info">
            <el-avatar :size="32" class="user-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span v-if="!isMobile" class="username">管理员</span>
            <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToProfile">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item @click="goToSettings">
                <el-icon><Setting /></el-icon>系统设置
              </el-dropdown-item>
              <el-dropdown-item divided @click="logout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-container">
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Monitor,
  VideoCamera,
  DataLine,
  Warning,
  TrendCharts,
  Menu,
  FullScreen,
  Refresh,
  Bell,
  User,
  Setting,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'

export default {
  name: 'MainLayout',
  components: {
    Monitor,
    VideoCamera,
    DataLine,
    Warning,
    TrendCharts,
    Menu,
    FullScreen,
    Refresh,
    Bell,
    User,
    Setting,
    SwitchButton,
    ArrowDown
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const isMobile = ref(false)
    const showMobileSidebar = ref(false)
    const notificationCount = ref(3)
    
    const activeMenu = computed(() => route.path)
    
    // 检测移动设备
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768
      if (!isMobile.value) {
        showMobileSidebar.value = false
      }
    }
    
    // 处理窗口大小变化
    const handleResize = () => {
      checkMobile()
    }
    
    // 菜单选择处理
    const handleMenuSelect = (index) => {
      router.push(index)
      if (isMobile.value) {
        showMobileSidebar.value = false
      }
    }
    
    // 全屏切换
    const toggleFullscreen = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        document.documentElement.requestFullscreen()
      }
    }
    
    // 刷新页面
    const refreshPage = () => {
      window.location.reload()
    }
    
    // 显示通知
    const showNotifications = () => {
      ElMessage.info('暂无新通知')
    }
    
    // 跳转到个人中心
    const goToProfile = () => {
      router.push('/profile')
    }
    
    // 跳转到设置
    const goToSettings = () => {
      router.push('/settings')
    }
    
    // 退出登录
    const logout = () => {
      router.push('/login')
    }
    
    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      activeMenu,
      isMobile,
      showMobileSidebar,
      notificationCount,
      handleMenuSelect,
      toggleFullscreen,
      refreshPage,
      showNotifications,
      goToProfile,
      goToSettings,
      logout
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $gradient-background;
  overflow: hidden;
  
  // 移动端侧边栏遮罩
  .mobile-sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: $zindex-modal-backdrop;
    opacity: 0;
    visibility: hidden;
    transition: all $animation-duration-base $ease-out;
    
    &.show {
      opacity: 1;
      visibility: visible;
    }
  }

  .header {
    height: $header-height;
    background: rgba(0, 21, 41, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0 $spacing-xl;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: $zindex-fixed;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

    .header-left {
      display: flex;
      align-items: center;
      gap: $spacing-lg;
      min-width: 280px;
      
      .mobile-menu-btn {
        color: rgba(255, 255, 255, 0.85);
        font-size: 20px;
        
        &:hover {
          color: $primary-hover;
          background: rgba(255, 255, 255, 0.1);
        }
      }

      .logo {
        display: flex;
        align-items: center;
        gap: $spacing-md;
        
        .logo-icon {
          width: 40px;
          height: 40px;
          background: $gradient-primary;
          border-radius: $border-radius-lg;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
        }
        
        .logo-content {
          .logo-text {
            font-size: 24px;
            font-weight: $font-weight-bold;
            color: #fff;
            margin: 0;
            letter-spacing: 0.5px;
            background: linear-gradient(135deg, #fff 0%, #40a9ff 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .logo-subtitle {
            font-size: $font-size-sm;
            color: rgba(255, 255, 255, 0.65);
            font-weight: $font-weight-medium;
            display: block;
            margin-top: 2px;
          }
        }
      }
    }

    .nav-container {
      flex: 1;
      display: flex;
      justify-content: center;
      
      &.mobile-nav {
        position: fixed;
        top: $header-height;
        left: 0;
        width: 280px;
        height: calc(100vh - #{$header-height});
        background: rgba(0, 21, 41, 0.98);
        backdrop-filter: blur(20px);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        padding: $spacing-lg;
        z-index: $zindex-modal;
        transform: translateX(-100%);
        transition: transform $animation-duration-base $ease-out;
        
        &.show {
          transform: translateX(0);
        }
      }

      .main-menu {
        border: none;
        background: transparent;
        display: flex;
        justify-content: center;
        gap: $spacing-xs;
        
        :deep(.el-menu-item) {
          height: $header-height;
          line-height: $header-height;
          padding: 0 $spacing-lg;
          font-size: $font-size-base;
          font-weight: $font-weight-medium;
          color: rgba(255, 255, 255, 0.85);
          border: none;
          border-radius: $border-radius-lg;
          margin: 0 $spacing-xs;
          position: relative;
          overflow: hidden;
          transition: all $animation-duration-base $ease-out;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.1);
            opacity: 0;
            transition: opacity $animation-duration-base $ease-out;
          }

          &.is-active {
            color: $primary-color;
            background: rgba(24, 144, 255, 0.15);
            border: 1px solid rgba(24, 144, 255, 0.3);
            
            .menu-item-indicator {
              transform: scaleX(1);
              opacity: 1;
            }
            
            .el-icon {
              color: $primary-color;
              transform: scale(1.1);
            }
          }

          &:hover {
            color: $primary-hover;
            background: rgba(24, 144, 255, 0.1);
            
            &::before {
              opacity: 1;
            }

            .el-icon {
              color: $primary-hover;
              transform: translateY(-2px) scale(1.05);
            }
          }

          .el-icon {
            margin-right: $spacing-sm;
            font-size: 18px;
            transition: all $animation-duration-base $ease-out;
          }
          
          .menu-item-indicator {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: $primary-color;
            transform: scaleX(0);
            opacity: 0;
            transition: all $animation-duration-base $ease-out;
          }
        }
        
        // 移动端垂直菜单样式
        &.el-menu--vertical {
          .el-menu-item {
            height: 48px;
            line-height: 48px;
            margin: $spacing-xs 0;
            width: 100%;
          }
        }
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: $spacing-lg;
      
      .toolbar {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        
        .toolbar-btn {
          width: 36px;
          height: 36px;
          border-radius: $border-radius-lg;
          color: rgba(255, 255, 255, 0.85);
          font-size: 16px;
          transition: all $animation-duration-base $ease-out;
          
          &:hover {
            color: $primary-hover;
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
          }
        }
      }
      
      .user-dropdown {
        .user-info {
          display: flex;
          align-items: center;
          gap: $spacing-sm;
          padding: $spacing-sm $spacing-md;
          border-radius: $border-radius-lg;
          cursor: pointer;
          transition: all $animation-duration-base $ease-out;
          
          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          
          .user-avatar {
            background: $gradient-primary;
            color: white;
            box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
          }
          
          .username {
            color: rgba(255, 255, 255, 0.85);
            font-weight: $font-weight-medium;
            font-size: $font-size-base;
          }
          
          .dropdown-arrow {
            color: rgba(255, 255, 255, 0.65);
            font-size: 12px;
            transition: transform $animation-duration-base $ease-out;
          }
          
          &:hover .dropdown-arrow {
            transform: rotate(180deg);
          }
        }
      }
    }
    
    // 移动端样式调整
    @media (max-width: $screen-md) {
      padding: 0 $spacing-md;
      
      .header-left {
        min-width: auto;
        gap: $spacing-md;
        
        .logo {
          .logo-content {
            .logo-text {
              font-size: 20px;
            }
            
            .logo-subtitle {
              display: none;
            }
          }
        }
      }
      
      .nav-container {
        display: none;
        
        &.mobile-nav {
          display: block;
        }
      }
      
      .header-right {
        gap: $spacing-sm;
        
        .toolbar {
          gap: $spacing-xs;
        }
        
        .user-dropdown .user-info .username {
          display: none;
        }
      }
    }
  }

  .main-container {
    flex: 1;
    background: #f0f2f5;
    position: relative;
    overflow: hidden;
    
    .content-wrapper {
      height: 100%;
      padding: $spacing-xl;
      overflow-y: auto;
      
      // 美化滚动条
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3px;

        &:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }
      
      @media (max-width: $screen-md) {
        padding: $spacing-lg;
      }
      
      @media (max-width: $screen-sm) {
        padding: $spacing-md;
      }
    }
  }
}

// 路由过渡动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all $animation-duration-base $ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// Element Plus 组件样式覆盖
:deep(.el-dropdown-menu) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: $border-radius-lg;
  box-shadow: $shadow-3;
  
  .el-dropdown-menu__item {
    color: $text-primary;
    font-weight: $font-weight-medium;
    padding: $spacing-sm $spacing-lg;
    transition: all $animation-duration-fast $ease-out;
    
    &:hover {
      background: rgba(24, 144, 255, 0.1);
      color: $primary-color;
    }
    
    .el-icon {
      margin-right: $spacing-sm;
    }
  }
}

:deep(.el-badge) {
  .el-badge__content {
    background: $error-color;
    border: 2px solid rgba(255, 255, 255, 0.2);
    font-size: $font-size-xs;
    min-width: 18px;
    height: 18px;
    line-height: 14px;
  }
}
</style> 