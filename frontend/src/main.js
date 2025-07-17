import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/global.scss'
import './styles/theme.scss'

// 创建应用实例
const app = createApp(App)

// 注册全局组件
import BaseChart from '@/components/BaseChart.vue'
import BasePanel from '@/components/BasePanel.vue'
import BaseTable from '@/components/BaseTable.vue'
import StatCard from '@/components/StatCard.vue'

app.component('BaseChart', BaseChart)
app.component('BasePanel', BasePanel)
app.component('BaseTable', BaseTable)
app.component('StatCard', StatCard)

// 注册全局指令
app.directive('loading', {
  mounted(el, binding) {
    const loadingContainer = document.createElement('div')
    loadingContainer.className = 'loading-container'
    loadingContainer.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">${binding.value?.text || '加载中...'}</div>
    `
    el.style.position = 'relative'
    el.appendChild(loadingContainer)

    // 更新loading状态
    if (!binding.value || (typeof binding.value === 'object' && !binding.value.show)) {
      loadingContainer.style.display = 'none'
    }
  },
  updated(el, binding) {
    const loadingContainer = el.querySelector('.loading-container')
    if (loadingContainer) {
      loadingContainer.style.display = (!binding.value || (typeof binding.value === 'object' && !binding.value.show)) ? 'none' : ''
      const loadingText = loadingContainer.querySelector('.loading-text')
      if (loadingText && binding.value?.text) {
        loadingText.textContent = binding.value.text
      }
    }
  }
})

// 注册全局过滤器
app.config.globalProperties.$filters = {
  // 日期格式化
  formatDate(value, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!value) return ''
    const date = new Date(value)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  },

  // 数字格式化
  formatNumber(value, decimals = 2) {
    if (!value && value !== 0) return ''
    return Number(value).toFixed(decimals)
  },

  // 文件大小格式化
  formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return ''
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`
  }
}

// 注册全局属性
app.config.globalProperties.$theme = {
  // 切换主题
  toggle(theme = '') {
    const root = document.documentElement
    const currentTheme = root.getAttribute('data-theme') || ''
    const newTheme = theme || (currentTheme === 'dark' ? '' : 'dark')
    root.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    return newTheme
  },

  // 获取当前主题
  get() {
    return document.documentElement.getAttribute('data-theme') || ''
  }
}

// 初始化主题
const savedTheme = localStorage.getItem('theme')
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme)
}

// 使用插件
app.use(router)
app.use(store)
app.use(ElementPlus)

// 挂载应用
app.mount('#app') 