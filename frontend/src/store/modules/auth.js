import request from '@/utils/request'

const state = {
  token: 'mock-token', // 模拟的 token
  user: { username: 'admin', role: 'ADMIN' } // 模拟的用户信息
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
  },
  SET_USER(state, user) {
    state.user = user
  },
  CLEAR_AUTH(state) {
    state.token = 'mock-token'
    state.user = { username: 'admin', role: 'ADMIN' }
  }
}

const actions = {
  async login({ commit }, credentials) {
    try {
      // 直接返回模拟数据，不发送请求
      const mockData = {
        token: 'mock-token',
        user: { username: 'admin', role: 'ADMIN' }
      }
      commit('SET_TOKEN', mockData.token)
      commit('SET_USER', mockData.user)
      return mockData
    } catch (error) {
      throw error
    }
  },

  async register({ commit }, userData) {
    try {
      // 直接返回模拟数据，不发送请求
      const mockData = {
        token: 'mock-token',
        user: { username: userData.username || 'admin', role: 'USER' }
      }
      commit('SET_TOKEN', mockData.token)
      commit('SET_USER', mockData.user)
      return mockData
    } catch (error) {
      throw error
    }
  },

  async getUserInfo({ commit }) {
    try {
      // 直接返回模拟数据，不发送请求
      const mockData = { username: 'admin', role: 'ADMIN' }
      commit('SET_USER', mockData)
      return mockData
    } catch (error) {
      throw error
    }
  },

  logout({ commit }) {
    commit('CLEAR_AUTH')
  }
}

const getters = {
  isAuthenticated: state => true, // 始终返回已认证
  currentUser: state => state.user
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 