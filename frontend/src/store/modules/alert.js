const state = () => ({
  alerts: []
})

const mutations = {
  MARK_READ(state, id) {
    const alert = state.alerts.find(a => a.id === id)
    if (alert) alert.unread = false
  }
}

const actions = {
  markAsRead({ commit }, id) {
    return new Promise(resolve => {
      setTimeout(() => {
        commit('MARK_READ', id)
        resolve()
      }, 200)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 