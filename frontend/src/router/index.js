import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// 布局组件
const MainLayout = () => import(/* webpackChunkName: "layout" */ '@/layouts/MainLayout.vue')

// 预加载函数
const prefetchComponent = (componentImport) => {
  const component = () => componentImport
  component.preload = componentImport
  return component
}

// 路由组件懒加载
const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/overview',
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: prefetchComponent(import(/* webpackChunkName: "overview" */ '@/views/SystemOverview.vue')),
        meta: {
          title: '系统概览',
          requiresAuth: true,
          keepAlive: true // 启用组件缓存
        }
      },
      {
        path: 'monitoring',
        name: 'Monitoring',
        component: prefetchComponent(import(/* webpackChunkName: "monitoring" */ '@/views/Monitoring.vue')),
        meta: {
          title: '智能检测',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: prefetchComponent(import(/* webpackChunkName: "analysis" */ '@/views/Analysis.vue')),
        meta: {
          title: '趋势分析',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'prediction',
        name: 'PredictionStudio',
        component: prefetchComponent(import(/* webpackChunkName: "prediction-studio" */ '@/views/PredictionStudio.vue')),
        meta: {
          title: '智能预测',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'warning-analysis',
        name: 'WarningAnalysis',
        component: prefetchComponent(import(/* webpackChunkName: "warning-analysis" */ '@/views/WarningAnalysis.vue')),
        meta: {
          title: '预警分析',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'evaluation',
        name: 'Evaluation',
        component: prefetchComponent(import(/* webpackChunkName: "evaluation" */ '@/views/QualityEvaluation.vue')),
        meta: {
          title: '质量评估',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: prefetchComponent(import(/* webpackChunkName: "profile" */ '@/views/Profile.vue')),
        meta: {
          title: '个人信息',
          requiresAuth: true
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: prefetchComponent(import(/* webpackChunkName: "settings" */ '@/views/Settings.vue')),
        meta: {
          title: '系统设置',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: prefetchComponent(import(/* webpackChunkName: "auth" */ '@/views/Login.vue')),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: prefetchComponent(import(/* webpackChunkName: "auth" */ '@/views/Register.vue')),
    meta: {
      title: '注册'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: prefetchComponent(import(/* webpackChunkName: "error" */ '@/views/404.vue')),
    meta: {
      title: '页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - 水土流失监测系统`

  // 检查是否需要登录权限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    if (!store.getters['auth/isAuthenticated']) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }

  // 预加载相关组件
  const components = to.matched
    .filter(route => route.components?.default?.preload)
    .map(route => route.components.default.preload())

  // 预加载可能的下一个路由组件
  const links = document.querySelectorAll('a[href^="/"]')
  const possibleRoutes = Array.from(links)
    .map(link => router.resolve(link.getAttribute('href')))
    .filter(route => route.matched.length > 0)
    .filter(route => !to.matched.includes(route.matched[0]))

  const preloadComponents = possibleRoutes
    .slice(0, 2) // 限制预加载数量
    .flatMap(route => 
      route.matched
        .filter(r => r.components?.default?.preload)
        .map(r => r.components.default.preload())
    )

  // 执行预加载
  Promise.all([...components, ...preloadComponents]).catch(() => {
    // 忽略预加载错误
  })
})

// 路由错误处理
router.onError((error) => {
  console.error('Router error:', error)
  // 可以在这里添加错误处理逻辑，比如显示错误通知
})

export default router 