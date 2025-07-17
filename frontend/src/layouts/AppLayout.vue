<!-- AppLayout.vue -->
<template>
  <div class="app-layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <router-link to="/" class="logo">
          星地一体化智能土壤环境分析监测系统
        </router-link>
        <nav class="main-nav">
          <router-link to="/system">系统首页</router-link>
          <router-link to="/monitoring">智能物联</router-link>
          <router-link to="/analysis">智能监测</router-link>
        </nav>
      </div>
      <div class="header-right">
        <router-link to="/quality">质量评价</router-link>
        <router-link to="/timeline">图片时间轴</router-link>
        <router-link to="/info">信息概述</router-link>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AppLayout'
}
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #001529;
  color: #fff;
}

.header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #002140;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  .header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .logo {
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    text-decoration: none;
  }

  a {
    color: #fff;
    text-decoration: none;
    padding: 0 15px;
    font-size: 14px;

    &:hover {
      color: #1890ff;
    }

    &.router-link-active {
      color: #1890ff;
    }
  }
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style> 