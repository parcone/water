<template>
  <div id="app" :class="{ 'is-mobile': isMobile }">
    <router-view v-slot="{ Component }">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="$route.fullPath" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { throttle } from 'lodash-es'

export default {
  name: 'App',
  data() {
    return {
      isMobile: false
    }
  },
  computed: {
    ...mapState({
      cachedViews: state => state.app.cachedViews
    })
  },
  created() {
    // 初始化移动设备检测
    this.checkMobile()
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
    
    // 初始化主题
    const theme = localStorage.getItem('theme') || ''
    document.documentElement.setAttribute('data-theme', theme)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768
    },
    handleResize: throttle(function() {
      this.checkMobile()
    }, 200)
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/global.scss';
@import '@/styles/theme.scss';

#app {
  height: 100vh;
  overflow: hidden;

  &.is-mobile {
    .sidebar {
      position: fixed;
      z-index: $zindex-fixed;
      transform: translateX(-100%);
      transition: transform 0.3s ease;

      &.visible {
        transform: translateX(0);
      }
    }

    .main-content {
      margin-left: 0;
    }
  }
}

// 路由过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style> 