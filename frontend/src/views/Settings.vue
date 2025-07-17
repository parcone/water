<template>
  <div class="settings-page">
    <base-panel title="系统设置">
      <el-form label-width="120px">
        <el-form-item label="主题设置">
          <el-select v-model="settings.theme" @change="handleThemeChange">
            <el-option label="浅色主题" value="light"></el-option>
            <el-option label="深色主题" value="dark"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="语言设置">
          <el-select v-model="settings.language">
            <el-option label="简体中文" value="zh-CN"></el-option>
            <el-option label="English" value="en-US"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="通知设置">
          <el-switch v-model="settings.notifications"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
        </el-form-item>
      </el-form>
    </base-panel>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      settings: {
        theme: 'light',
        language: 'zh-CN',
        notifications: true
      }
    }
  },
  methods: {
    handleThemeChange(theme) {
      this.$theme.toggle(theme === 'dark' ? 'dark' : '')
    },
    saveSettings() {
      // TODO: Implement settings save logic
      this.$message.success('设置已保存')
    }
  },
  mounted() {
    // Initialize theme from current setting
    this.settings.theme = this.$theme.get() === 'dark' ? 'dark' : 'light'
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.settings-page {
  padding: $spacing-md;
}
</style> 