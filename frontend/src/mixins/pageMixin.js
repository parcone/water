import { ref } from 'vue'

export default {
  data() {
    return {
      pageTitle: '',
      pageDescription: '',
      breadcrumbs: [],
      isLoading: false,
      error: null
    }
  },

  computed: {
    hasError() {
      return !!this.error
    }
  },

  methods: {
    /**
     * 设置页面标题
     * @param {string} title - 页面标题
     */
    setPageTitle(title) {
      this.pageTitle = title
      document.title = `${title} - 水土流失监测系统`
    },

    /**
     * 设置页面描述
     * @param {string} description - 页面描述
     */
    setPageDescription(description) {
      this.pageDescription = description
    },

    /**
     * 设置面包屑
     * @param {Array} breadcrumbs - 面包屑数组
     */
    setBreadcrumbs(breadcrumbs) {
      this.breadcrumbs = breadcrumbs
    },

    /**
     * 显示加载状态
     */
    showLoading() {
      this.isLoading = true
      this.error = null
    },

    /**
     * 隐藏加载状态
     */
    hideLoading() {
      this.isLoading = false
    },

    /**
     * 设置错误信息
     * @param {Error|string} error - 错误对象或错误信息
     */
    setError(error) {
      this.error = error instanceof Error ? error.message : error
      this.isLoading = false
    },

    /**
     * 清除错误信息
     */
    clearError() {
      this.error = null
    },

    /**
     * 异步操作包装器
     * @param {Function} operation - 异步操作函数
     * @param {Object} options - 配置选项
     * @returns {Promise}
     */
    async withLoading(operation, { showError = true } = {}) {
      this.showLoading()
      try {
        const result = await operation()
        return result
      } catch (error) {
        if (showError) {
          this.setError(error)
        }
        throw error
      } finally {
        this.hideLoading()
      }
    }
  },

  /**
   * 页面布局模板
   */
  template: `
    <div class="page-container">
      <div v-if="breadcrumbs.length > 0" class="page-breadcrumbs mb-md">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" :to="item.to">
            {{ item.text }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="page-header mb-lg">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p v-if="pageDescription" class="page-description">{{ pageDescription }}</p>
      </div>

      <el-alert
        v-if="hasError"
        type="error"
        :title="error"
        show-icon
        class="mb-lg"
        @close="clearError"
      />

      <div v-loading="isLoading" class="page-content">
        <slot />
      </div>
    </div>
  `,

  /**
   * 页面样式
   */
  style: `
    <style lang="scss" scoped>
    .page-container {
      padding: $spacing-md;
      min-height: 100%;
      background: $background-base;

      @include respond-to(sm) {
        padding: $spacing-sm;
      }
    }

    .page-header {
      .page-title {
        font-size: $heading-2-size;
        font-weight: 600;
        color: $text-primary;
        margin: 0;
        line-height: 1.4;

        @include respond-to(sm) {
          font-size: $heading-3-size;
        }
      }

      .page-description {
        margin: $spacing-sm 0 0;
        color: $text-secondary;
        font-size: $font-size-base;
        line-height: 1.6;
      }
    }

    .page-content {
      position: relative;
      min-height: 200px;
    }
    </style>
  `
} 