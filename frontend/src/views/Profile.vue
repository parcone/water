<template>
  <div class="profile-page">
    <base-panel title="个人信息">
      <el-form label-width="120px">
        <el-form-item label="用户名">
          <el-input v-model="userInfo.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userInfo.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userInfo.phone"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveProfile">保存更改</el-button>
        </el-form-item>
      </el-form>
    </base-panel>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data() {
    return {
      userInfo: {
        username: '',
        email: '',
        phone: ''
      }
    }
  },
  methods: {
    saveProfile() {
      // TODO: Implement profile save logic
      this.$message.success('个人信息已更新')
    }
  },
  mounted() {
    // TODO: Load user info from backend
    this.userInfo = {
      username: 'admin',
      email: 'admin@example.com',
      phone: '13800138000'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.profile-page {
  padding: $spacing-md;
}
</style> 