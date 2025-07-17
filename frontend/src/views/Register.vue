<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <h2 class="card-title">Register</h2>
      </template>

      <el-form
        ref="registerForm"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="Username" prop="username">
          <el-input
            v-model="form.username"
            prefix-icon="User"
            placeholder="Choose a username"
          />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input
            v-model="form.email"
            prefix-icon="Message"
            placeholder="Enter your email"
          />
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            prefix-icon="Lock"
            placeholder="Choose a password"
            show-password
          />
        </el-form-item>

        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            prefix-icon="Lock"
            placeholder="Confirm your password"
            show-password
          />
        </el-form-item>

        <div class="form-actions">
          <el-button type="primary" native-type="submit" :loading="loading">
            Register
          </el-button>
          <el-link type="primary" @click="$router.push('/login')">
            Already have an account? Login
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
  name: 'Register',
  setup() {
    const store = useStore()
    const router = useRouter()
    const registerForm = ref(null)
    const loading = ref(false)

    const form = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('Please enter your password'))
      } else {
        if (form.confirmPassword !== '') {
          registerForm.value?.validateField('confirmPassword')
        }
        callback()
      }
    }

    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('Please confirm your password'))
      } else if (value !== form.password) {
        callback(new Error('Passwords do not match'))
      } else {
        callback()
      }
    }

    const rules = {
      username: [
        { required: true, message: 'Please enter your username', trigger: 'blur' },
        { min: 3, message: 'Username must be at least 3 characters', trigger: 'blur' }
      ],
      email: [
        { required: true, message: 'Please enter your email', trigger: 'blur' },
        { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
      ],
      password: [
        { required: true, validator: validatePass, trigger: 'blur' },
        { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, validator: validatePass2, trigger: 'blur' }
      ]
    }

    const handleSubmit = async () => {
      if (!registerForm.value) return

      try {
        await registerForm.value.validate()
        loading.value = true

        const { confirmPassword, ...userData } = form
        await store.dispatch('auth/register', userData)
        ElMessage.success('Registration successful')
        router.push('/')
      } catch (error) {
        ElMessage.error(error.response?.data?.message || 'Registration failed')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      rules,
      loading,
      registerForm,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.register-card {
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