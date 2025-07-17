// 设备模块：提供示例数据和伪后端接口

const sampleDevices = Array.from({ length: 16 }, (_, i) => {
  const idx = i + 1;
  const types = ['温湿度', 'PH值', '视频监控', '数据网关'];
  const statuses = ['online', 'offline', 'error'];
  return {
    name: `设备-${idx}`,
    type: types[i % 4],
    status: statuses[i % 3],
    location: `田块${idx}`,
    lastUpdate: new Date().toLocaleString(),
    latestData: `${types[i % 4]} 数据`
  };
});

const state = () => ({
  devices: [...sampleDevices]
})

const mutations = {
  SET_DEVICES(state, devices) {
    state.devices = devices
  },
  DELETE_DEVICE(state, name) {
    state.devices = state.devices.filter(d => d.name !== name)
  }
}

const actions = {
  // 模拟获取设备列表
  fetchDevices({ state }) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([...state.devices])
      }, 500)
    })
  },

  // 模拟删除设备
  deleteDevice({ commit }, name) {
    return new Promise(resolve => {
      setTimeout(() => {
        commit('DELETE_DEVICE', name)
        resolve()
      }, 300)
    })
  },

  // 预测数据
  fetchPredictions() {
    // 生成随机预测数据
    return new Promise(resolve => {
      const data = {
        temperature: Array.from({ length: 24 }, (_, i) => 24 + Math.sin(i / 12 * Math.PI) * 2 + Math.random()),
        humidity: Array.from({ length: 24 }, () => 60 + Math.random() * 10),
        ph: Array.from({ length: 24 }, () => 6.5 + Math.random())
      }
      setTimeout(() => resolve(data), 300)
    })
  },

  // 历史数据
  fetchHistory() {
    return new Promise(resolve => setTimeout(() => resolve([]), 300))
  },

  fetchDeviceHistory() {
    return new Promise(resolve => setTimeout(() => resolve([]), 300))
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 