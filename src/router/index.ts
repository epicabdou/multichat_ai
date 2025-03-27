import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/app',
    name: 'app',
    component: () => import('@/views/AppView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/app/settings',
    name: 'settings',
    component: () => import('@/views/AppSettings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/authentication',
    name: 'authentication',
    component: () => import('@/views/AuthView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/confirm',
    name: 'confirm',
    component: () => import('@/views/ConfirmView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: () => import('@/views/ResetPasswordView.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Skip auth check for the confirmation page
  if (to.name === 'confirm') {
    return next()
  }

  // Get current user session
  const { data } = await supabase.auth.getSession()
  const isAuthenticated = !!data?.session

  // Redirect logic based on route meta requirements
  if (to.meta.requiresAuth && !isAuthenticated) {
    // If route requires auth and user is not authenticated
    return next({ name: 'authentication' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // If route requires guest and user is authenticated
    return next({ name: 'app' })
  }

  // Otherwise proceed as normal
  return next()
})

export default router