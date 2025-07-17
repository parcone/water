<!-- Info.vue -->
<template>
  <div class="info-view">
    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <div class="stat-card primary">
        <div class="stat-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">v1.2</div>
          <div class="stat-label">系统版本</div>
        </div>
        <div class="stat-tag">
          <el-tag type="success" size="small">最新版本</el-tag>
        </div>
      </div>
      
      <div class="stat-card info">
        <div class="stat-icon">
          <el-icon><Timer /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">99.9%</div>
          <div class="stat-label">系统运行时间</div>
        </div>
        <div class="stat-tag">
          <el-tag type="info" size="small">稳定运行中</el-tag>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">
          <el-icon><Message /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">2</div>
          <div class="stat-label">未读公告</div>
        </div>
        <div class="stat-tag">
          <el-tag type="warning" size="small">需要关注</el-tag>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon">
          <el-icon><Service /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">24h</div>
          <div class="stat-label">在线支持</div>
        </div>
        <div class="stat-tag">
          <el-tag type="success" size="small">随时咨询</el-tag>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：系统介绍和更新日志 -->
      <div class="content-main">
        <!-- 系统介绍 -->
        <div class="intro-panel">
          <div class="panel-header">
            <h3>系统简介</h3>
            <el-button type="primary" size="small" :icon="Document">查看完整文档</el-button>
          </div>
          <div class="intro-content">
            <div class="intro-section">
              <h4>系统概述</h4>
              <p>本系统是一套先进的智能化土壤环境监测与分析平台，采用最新的物联网技术和数据分析算法，为农业生产和环境保护提供全方位的数据支持和决策建议。</p>
            </div>
            <div class="intro-section">
              <h4>核心功能</h4>
              <div class="feature-grid">
                <div class="feature-item">
                  <el-icon><Monitor /></el-icon>
                  <span>实时监测</span>
                </div>
                <div class="feature-item">
                  <el-icon><DataLine /></el-icon>
                  <span>数据分析</span>
                </div>
                <div class="feature-item">
                  <el-icon><Warning /></el-icon>
                  <span>预警提醒</span>
                </div>
                <div class="feature-item">
                  <el-icon><PieChart /></el-icon>
                  <span>统计报表</span>
                </div>
                <div class="feature-item">
                  <el-icon><Location /></el-icon>
                  <span>空间分析</span>
                </div>
                <div class="feature-item">
                  <el-icon><Connection /></el-icon>
                  <span>物联集成</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 更新日志 -->
        <div class="changelog-panel">
          <div class="panel-header">
            <h3>更新日志</h3>
            <el-button type="primary" size="small" :icon="More">查看更多</el-button>
          </div>
          <div class="timeline">
            <div class="timeline-item">
              <div class="time-tag">2024-07-11</div>
              <div class="version-tag">v1.2</div>
              <div class="update-content">
                <h5>系统升级</h5>
                <ul>
                  <li>新增智能分析模块，支持多维度数据分析</li>
                  <li>优化监测点管理功能，提升操作效率</li>
                  <li>改进数据可视化效果，新增多种图表类型</li>
                  <li>优化系统性能，提升响应速度</li>
                </ul>
              </div>
            </div>
            <div class="timeline-item">
              <div class="time-tag">2024-07-01</div>
              <div class="version-tag">v1.1</div>
              <div class="update-content">
                <h5>功能更新</h5>
                <ul>
                  <li>支持多格式数据导入导出</li>
                  <li>新增数据校验和清洗功能</li>
                  <li>优化用户界面，提升使用体验</li>
                  <li>修复已知问题，提升系统稳定性</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧边栏：公告和联系方式 -->
      <div class="content-side">
        <!-- 公告栏 -->
        <div class="notice-panel">
          <div class="panel-header">
            <h3>系统公告</h3>
            <el-button type="primary" size="small" :icon="Bell">全部已读</el-button>
          </div>
          <div class="notice-list">
            <div class="notice-item unread">
              <div class="notice-icon">
                <el-icon><InfoFilled /></el-icon>
              </div>
              <div class="notice-content">
                <div class="notice-title">系统升级通知</div>
                <div class="notice-text">系统将于本周日凌晨2:00-4:00进行例行维护升级，请提前做好相关准备。</div>
                <div class="notice-time">2024-07-15 10:30</div>
              </div>
            </div>
            <div class="notice-item unread">
              <div class="notice-icon warning">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="notice-content">
                <div class="notice-title">数据备份提醒</div>
                <div class="notice-text">请各位用户及时进行数据备份，以防数据丢失。</div>
                <div class="notice-time">2024-07-14 16:45</div>
              </div>
            </div>
            <div class="notice-item">
              <div class="notice-icon success">
                <el-icon><Success /></el-icon>
              </div>
              <div class="notice-content">
                <div class="notice-title">功能优化完成</div>
                <div class="notice-text">数据导出功能优化已完成，现已支持更多格式。</div>
                <div class="notice-time">2024-07-13 09:15</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 联系方式 -->
        <div class="contact-panel">
          <div class="panel-header">
            <h3>联系我们</h3>
          </div>
          <div class="contact-list">
            <div class="contact-item">
              <div class="contact-icon">
                <el-icon><Service /></el-icon>
              </div>
              <div class="contact-info">
                <div class="contact-label">技术支持</div>
                <div class="contact-value">support@soilmonitor.com</div>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">
                <el-icon><Phone /></el-icon>
              </div>
              <div class="contact-info">
                <div class="contact-label">服务热线</div>
                <div class="contact-value">400-123-4567</div>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="contact-info">
                <div class="contact-label">服务时间</div>
                <div class="contact-value">周一至周日 09:00-21:00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Monitor,
  Timer,
  Message,
  Service,
  Document,
  More,
  Bell,
  InfoFilled,
  Warning,
  Success,
  Phone,
  Clock,
  DataLine,
  PieChart,
  Location,
  Connection
} from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.info-view {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #001529 0%, #003366 100%);
  color: #fff;
}

/* 顶部统计卡片样式 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.08);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    font-size: 24px;
  }

  .stat-content {
    flex: 1;

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      line-height: 1.2;
      background: linear-gradient(120deg, #fff, #b7b7b7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stat-label {
      font-size: 14px;
      color: #8c8c8c;
      margin-top: 4px;
    }
  }

  &.primary .stat-icon {
    background: rgba(24, 144, 255, 0.1);
    color: #1890ff;
  }

  &.info .stat-icon {
    background: rgba(144, 147, 153, 0.1);
    color: #909399;
  }

  &.warning .stat-icon {
    background: rgba(250, 173, 20, 0.1);
    color: #faad14;
  }

  &.success .stat-icon {
    background: rgba(82, 196, 26, 0.1);
    color: #52c41a;
  }
}

/* 主要内容区域样式 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  height: calc(100vh - 180px);
}

.content-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 面板通用样式 */
.intro-panel,
.changelog-panel,
.notice-panel,
.contact-panel {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
  }
}

/* 系统介绍样式 */
.intro-content {
  .intro-section {
    margin-bottom: 24px;

    h4 {
      font-size: 16px;
      margin: 0 0 12px;
      color: #b7b7b7;
    }

    p {
      margin: 0;
      line-height: 1.6;
      color: #8c8c8c;
    }
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.feature-item {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.08);
  }

  .el-icon {
    font-size: 24px;
    color: #1890ff;
  }

  span {
    font-size: 14px;
    color: #b7b7b7;
  }
}

/* 更新日志样式 */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.timeline-item {
  position: relative;
  padding-left: 24px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(24, 144, 255, 0.2);
  }

  &::after {
    content: '';
    position: absolute;
    left: -4px;
    top: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #1890ff;
  }

  .time-tag {
    font-size: 12px;
    color: #8c8c8c;
    margin-bottom: 4px;
  }

  .version-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    background: rgba(24, 144, 255, 0.1);
    color: #1890ff;
    font-size: 12px;
    margin-bottom: 8px;
  }

  .update-content {
    h5 {
      margin: 0 0 8px;
      font-size: 14px;
      color: #fff;
    }

    ul {
      margin: 0;
      padding-left: 16px;
      
      li {
        color: #8c8c8c;
        margin-bottom: 4px;
        font-size: 13px;
      }
    }
  }
}

/* 公告列表样式 */
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice-item {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  gap: 16px;

  .notice-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(24, 144, 255, 0.1);
    color: #1890ff;

    &.warning {
      background: rgba(250, 173, 20, 0.1);
      color: #faad14;
    }

    &.success {
      background: rgba(82, 196, 26, 0.1);
      color: #52c41a;
    }
  }

  .notice-content {
    flex: 1;

    .notice-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .notice-text {
      font-size: 13px;
      color: #8c8c8c;
      margin-bottom: 8px;
    }

    .notice-time {
      font-size: 12px;
      color: #666;
    }
  }

  &.unread {
    border-left: 2px solid #1890ff;
  }
}

/* 联系方式样式 */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;

  .contact-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(24, 144, 255, 0.1);
    color: #1890ff;
    font-size: 20px;
  }

  .contact-info {
    flex: 1;

    .contact-label {
      font-size: 12px;
      color: #8c8c8c;
      margin-bottom: 4px;
    }

    .contact-value {
      font-size: 14px;
      font-weight: 500;
    }
  }
}
</style> 