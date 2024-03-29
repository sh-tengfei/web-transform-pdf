import { createRouter, createWebHashHistory } from 'vue-router'
<<<<<<< HEAD
=======
import HomeView from '../views/Home.vue'
>>>>>>> refs/remotes/origin/master

const routes = [
  {
    path: '/',
    name: 'enter',
    component: () => import('../views/EnterView.vue')
  },
<<<<<<< HEAD
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
=======
>>>>>>> refs/remotes/origin/master
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
