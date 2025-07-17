// 系统状态常量
export const SYSTEM_STATUS = {
  NORMAL: 'normal',
  WARNING: 'warning',
  ERROR: 'error'
}

// 数据质量等级
export const QUALITY_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor'
}

// 监控类型
export const MONITOR_TYPES = {
  REAL_TIME: 'realTime',
  HISTORICAL: 'historical',
  PREDICTIVE: 'predictive'
}

// 图表颜色配置
export const CHART_COLORS = {
  primary: '#409EFF',
  success: '#67C23A',
  warning: '#E6A23C',
  danger: '#F56C6C',
  info: '#909399'
}

// 分页配置
export const PAGINATION_CONFIG = {
  pageSize: 10,
  pageSizes: [10, 20, 50, 100]
}

// 时间格式
export const DATE_FORMATS = {
  date: 'YYYY-MM-DD',
  datetime: 'YYYY-MM-DD HH:mm:ss',
  time: 'HH:mm:ss'
}

// API 响应码
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
} 