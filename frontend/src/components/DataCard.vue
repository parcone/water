<!-- 数据卡片组件 -->
<template>
  <div class="data-card" :style="{ borderColor: color }">
    <div class="card-icon" :style="{ backgroundColor: color }">
      <el-icon><component :is="icon" /></el-icon>
    </div>
    <div class="card-content">
      <div class="card-title">{{ title }}</div>
      <div class="card-value">{{ value }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataCard',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    icon: {
      type: String,
      default: 'DataLine'
    },
    color: {
      type: String,
      default: '#1890ff'
    }
  }
}
</script>

<style lang="scss" scoped>
.data-card {
  background: rgba(0, 21, 41, 0.8);
  border-radius: 4px;
  padding: 20px;
  display: flex;
  align-items: center;
  border-left: 4px solid;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    
    .el-icon {
      font-size: 24px;
      color: white;
    }
  }

  .card-content {
    flex: 1;
    
    .card-title {
      color: #8c8c8c;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .card-value {
      color: #fff;
      font-size: 24px;
      font-weight: bold;
    }
  }
}
</style> 