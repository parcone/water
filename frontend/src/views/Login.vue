<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="card-title">Login</h2>
      </template>

      <el-form
        ref="loginForm"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="Username" prop="username">
          <el-input
            v-model="form.username"
            prefix-icon="User"
            placeholder="Enter your username"
          />
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            prefix-icon="Lock"
            placeholder="Enter your password"
            show-password
          />
        </el-form-item>

        <div class="form-actions">
          <el-button type="primary" native-type="submit" :loading="loading">
            Login
          </el-button>
          <el-link type="primary" @click="$router.push('/register')">
            Don't have an account? Register
          </el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()
    const loginForm = ref(null)
    const loading = ref(false)

    const form = reactive({
      username: '',
      password: ''
    })

    const rules = {
      username: [
        { required: true, message: 'Please enter your username', trigger: 'blur' }
      ],
      password: [
        { required: true, message: 'Please enter your password', trigger: 'blur' }
      ]
    }

    const handleSubmit = async () => {
      if (!loginForm.value) return

      try {
        await loginForm.value.validate()
        loading.value = true

        await store.dispatch('auth/login', form)
        ElMessage.success('Login successful')
        router.push('/')
      } catch (error) {
        ElMessage.error(error.response?.data?.message || 'Login failed')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      rules,
      loading,
      loginForm,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.login-card {
  width: 100%;
  max-width: 400px;
  margin: 20px;
}

.card-title {
  margin: 0;
  text-align: center;
  color: #303133;
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 24px;

  .el-button {
    width: 100%;
  }
}
</style> 