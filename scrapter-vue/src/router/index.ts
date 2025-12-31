import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import AppView from '../views/AppView.vue'
import UserGuideView from '../views/UserGuideView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView
    },
    {
      path: '/app',
      name: 'app',
      component: AppView
    },
    {
      path: '/user-guide',
      name: 'user-guide',
      component: UserGuideView
    }
  ]
})

export default router

