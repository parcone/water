import { createStore } from 'vuex'
import app from './modules/app'
import auth from './modules/auth'
import device from './modules/device'
import alert from './modules/alert'

export default createStore({
  modules: {
    app,
    auth,
    device,
    alert
  }
}) 