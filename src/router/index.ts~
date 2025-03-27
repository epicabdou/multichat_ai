import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store/auth';

// Import all view components
import LoginView from '@/views/Auth/LoginView.vue';
import RegisterView from '@/views/Auth/RegisterView.vue';
import PasswordResetView from '@/views/Auth/PasswordResetView.vue';
import VerifyEmailView from '@/views/Auth/VerifyEmailView.vue';
import DashboardView from '@/views/Dashboard/DashboardView.vue';
import ProfileSettingsView from '@/views/Dashboard/ProfileSettingsView.vue';
import ChatSessionsListView from '@/views/Chat/ChatSessionsListView.vue';
import ChatInterfaceView from '@/views/Chat/ChatInterfaceView.vue';
import NewChatView from '@/views/Chat/NewChatView.vue';
import ApiKeysManagementView from '@/views/ApiKeys/ApiKeysManagementView.vue';
import AddEditApiKeyView from '@/views/ApiKeys/AddEditApiKeyView.vue';
import SubscriptionManagementView from '@/views/Subscription/SubscriptionManagementView.vue';
import UpgradePlanView from '@/views/Subscription/UpgradePlanView.vue';
import SavedPromptsListView from '@/views/SavedPrompts/SavedPromptsListView.vue';
import CreateEditPromptView from '@/views/SavedPrompts/CreateEditPromptView.vue';
import AdminDashboardView from '@/views/Admin/AdminDashboardView.vue';
import UserManagementView from '@/views/Admin/UserManagementView.vue';
import ProviderManagementView from '@/views/Admin/ProviderManagementView.vue';
import UsageAnalyticsView from '@/views/Analytics/UsageAnalyticsView.vue';
import DetailedUsageLogsView from '@/views/Analytics/DetailedUsageLogsView.vue';
import HelpDocumentationView from '@/views/Misc/HelpDocumentationView.vue';
import NotificationCenterView from '@/views/Misc/NotificationCenterView.vue';
import NotFoundView from '@/views/Misc/NotFoundView.vue';
import ConfirmView from "@/views/Auth/ConfirmView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'LoginView',
    component: LoginView,
    meta: { requiresAuth: false, layout: 'AuthLayout' }
  },
  {
    path: '/register',
    name: 'RegisterView',
    component: RegisterView,
    meta: { requiresAuth: false, layout: 'AuthLayout' }
  },
  {
    path: '/password-reset',
    name: 'PasswordResetView',
    component: PasswordResetView,
    meta: { requiresAuth: false, layout: 'AuthLayout' }
  },
  {
    path: '/verify-email',
    name: 'VerifyEmailView',
    component: VerifyEmailView,
    meta: { requiresAuth: false, layout: 'AuthLayout' }
  },
  {
    path: '/confirm',
    name: 'ConfirmView',
    component: ConfirmView,
    meta: { requiresAuth: false, layout: 'AuthLayout' }
  },
  {
    path: '/',
    name: 'DashboardView',
    component: DashboardView,
    meta: { requiresAuth: true, layout: 'MainLayout' }
  },
  {
    path: '/profile',
    name: 'ProfileSettingsView',
    component: ProfileSettingsView,
    meta: { requiresAuth: true, layout: 'MainLayout' }
  },
  {
    path: '/chats',
    name: 'ChatSessionsListView',
    component: ChatSessionsListView,
    meta: { requiresAuth: true, layout: 'MainLayout' }
  },
  {
    path: '/chat/:id',
    name: 'ChatInterfaceView',
    component: ChatInterfaceView,
    meta: { requiresAuth: true, layout: 'ChatLayout' }
  },
  {
    path: '/chat/new',
    name: 'NewChatView',
    component: NewChatView,
    meta: { requiresAuth: true, layout: 'MainLayout' }
  },
  {
    path: '/api-keys',
    name: 'ApiKeysManagementView',
    component: ApiKeysManagementView,
    meta: { requiresAuth: true, layout: 'MainLayout' }
  },
  {
    path: '/api-keys/:id?',
    name: 'AddEditApiKeyView',
    component: AddEditApiKeyView,
    meta: { requiresAuth: true, layout: 'MainLayout' }
  },
  {
    path: '/subscription',
    name: 'SubscriptionManagementView',
    component: SubscriptionManagementView,
    meta: { requiresAuth: true, layout: 'MainLayout' }
  },
  {
    path: '/subscription/upgrade',
    name: 'UpgradePlanView',
    component: UpgradePlanView,
    meta: { requiresAuth: true, layout: 'MainLayout' }
  },
  {
    path: '/prompts',
    name: 'SavedPromptsListView',
    component: SavedPromptsListView,
    meta: { requiresAuth: true, minTier: 'plus', layout: 'MainLayout' }
  },
  {
    path: '/prompts/:id?',
    name: 'CreateEditPromptView',
    component: CreateEditPromptView,
    meta: { requiresAuth: true, minTier: 'plus', layout: 'MainLayout' }
  },
  {
    path: '/admin',
    name: 'AdminDashboardView',
    component: AdminDashboardView,
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'AdminLayout' }
  },
  {
    path: '/admin/users',
    name: 'UserManagementView',
    component: UserManagementView,
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'AdminLayout' }
  },
  {
    path: '/admin/providers',
    name: 'ProviderManagementView',
    component: ProviderManagementView,
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'AdminLayout' }
  },
  {
    path: '/analytics',
    name: 'UsageAnalyticsView',
    component: UsageAnalyticsView,
    meta: { requiresAuth: true, minTier: 'premium', layout: 'MainLayout' }
  },
  {
    path: '/analytics/logs',
    name: 'DetailedUsageLogsView',
    component: DetailedUsageLogsView,
    meta: { requiresAuth: true, minTier: 'premium', layout: 'MainLayout' }
  },
  {
    path: '/help',
    name: 'HelpDocumentationView',
    component: HelpDocumentationView,
    meta: { requiresAuth: false, layout: 'MainLayout' }
  },
  {
    path: '/notifications',
    name: 'NotificationCenterView',
    component: NotificationCenterView,
    meta: { requiresAuth: true, layout: 'MainLayout' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundView',
    component: NotFoundView,
    meta: { requiresAuth: false, layout: 'MainLayout' }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isLoggedIn = authStore.isAuthenticated;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const requiresTier = to.matched.some(record => record.meta.minTier);

  // Check if the route requires authentication
  if (requiresAuth && !isLoggedIn) {
    next('/login');
    return;
  }

  // Check if the route requires admin permissions
  if (requiresAdmin && !authStore.isAdmin) {
    next('/');
    return;
  }

  // Check if the route requires a specific subscription tier
  if (requiresTier && isLoggedIn) {
    const minTier = to.matched.find(record => record.meta.minTier)?.meta.minTier;
    const userTier = authStore.userSubscription?.tier || 'free';

    const tierValues: Record<string, number> = { 'free': 0, 'plus': 1, 'premium': 2 };
    if (tierValues[userTier] < tierValues[minTier as string]) {
      next('/subscription/upgrade');
      return;
    }
  }

  next();
});

export default router;