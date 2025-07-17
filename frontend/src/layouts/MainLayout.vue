<!-- 主布局组件 -->
<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-left">
        <div class="logo">
          <h1 class="logo-text">智能先知</h1>
        </div>
        <div class="subtitle">多变量土湿预测监测系统</div>
      </div>
      <div class="nav-container">
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          class="main-menu"
          background-color="transparent"
          text-color="rgba(255, 255, 255, 0.85)"
          active-text-color="#40a9ff"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/overview">
            <el-icon><Monitor /></el-icon>
            <span>实时监测</span>
          </el-menu-item>
          <el-menu-item index="/monitoring">
            <el-icon><VideoCamera /></el-icon>
            <span>智能预测</span>
          </el-menu-item>
          <el-menu-item index="/analysis">
            <el-icon><DataLine /></el-icon>
            <span>趋势分析</span>
          </el-menu-item>
          <el-menu-item index="/warning-analysis">
            <el-icon><Warning /></el-icon>
            <span>预警分析</span>
          </el-menu-item>
          <el-menu-item index="/evaluation">
            <el-icon><TrendCharts /></el-icon>
            <span>预警评估</span>
          </el-menu-item>
        </el-menu>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-container">
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
      <!-- 移除全局图片时间轴 -->
      <!-- timeline-container 已删除 -->
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// 省略未使用的 useStore 引入
import {
  Monitor,
  VideoCamera,
  DataLine,
  Warning,
  TrendCharts
} from '@element-plus/icons-vue'
// 移除 PhotoTimeline 和 ArrowDown 相关引用

export default {
  name: 'MainLayout',
  components: {
    Monitor,
    VideoCamera,
    DataLine,
    Warning,
    TrendCharts
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const activeMenu = computed(() => route.path)

    const handleMenuSelect = (index) => {
      router.push(index)
    }

    return {
      activeMenu,
      handleMenuSelect
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
  background: linear-gradient(180deg, #001529 0%, #002140 100%);
  overflow: hidden;

  .header {
    height: 64px; // Increased height for better visibility
    background: rgba(0, 21, 41, 0.95);
    backdrop-filter: blur(10px); // Add blur effect for modern look
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: $zindex-fixed;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 240px;

      .logo {
        .logo-text {
          font-size: 22px;
          font-weight: 600;
          color: #fff;
          margin: 0;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      }

      .subtitle {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.75);
        font-weight: 500;
        letter-spacing: 0.3px;
      }
    }

    .nav-container {
      flex: 1;
      display: flex;
      justify-content: center;

      .main-menu {
        border: none;
        display: flex;
        background: transparent;
        justify-content: center;
        gap: 4px; // Add gap between menu items

        :deep(.el-menu-item) {
          height: 64px;
          line-height: 64px;
          padding: 0 24px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.85);
          border-bottom: 3px solid transparent;
          transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
          border-radius: 4px 4px 0 0;
          margin: 0 2px;

          &.is-active {
            color: #40a9ff;
            background: rgba(24, 144, 255, 0.15);
            border-bottom-color: #40a9ff;
            font-weight: 500;

            .el-icon {
              color: #40a9ff;
              transform: scale(1.1);
            }
          }

          &:hover {
            color: #40a9ff;
            background: rgba(24, 144, 255, 0.1);

            .el-icon {
              color: #40a9ff;
              transform: translateY(-2px);
            }
          }

          .el-icon {
            margin-right: 8px;
            font-size: 18px;
            color: rgba(255, 255, 255, 0.85);
            transition: all 0.3s;
          }

          &:last-child {
            padding: 0 16px;
            margin-left: 8px;
            background: rgba(255, 255, 255, 0.04);
            border-radius: 4px;
            height: 40px;
            line-height: 40px;
            margin-top: 12px;

            &:hover {
              background: rgba(255, 255, 255, 0.08);
            }

            .el-icon {
              margin-right: 0;
            }
          }
        }
      }
    }
  }

  .main-container {
    flex: 1;
    margin-top: 64px;
    background: #001529;
    position: relative;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 64px);
    overflow: hidden;

    .content {
      flex: 1;
      padding: 24px;
      height: calc(100% - 300px);
      overflow-y: auto;
      position: relative;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }
    }

    // timeline-container 相关样式已无需保留
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 