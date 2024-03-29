import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'enter',
    component: () => import('../views/EnterView.vue')
  },
  {
    path: '/make',
    name: 'make',
    component: () => import('../views/MakeView.vue')
  },
  {
    path: '/analysis',
    name: 'analysis',
    component: () => import('../views/AnalysisView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
