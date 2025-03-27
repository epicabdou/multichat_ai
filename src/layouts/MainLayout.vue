<template>
  <div class="main-layout">
    <header class="main-layout-header">
      <nav class="bg-base-100 shadow-md p-4">
        <div class="container mx-auto flex justify-between items-center">
          <!-- Logo and app name -->
          <div class="flex items-center space-x-2">
            <img src="@/assets/logo.svg" alt="Goblix AI" class="h-8 w-8" />
            <span class="text-xl font-bold">Goblix AI</span>
          </div>

          <!-- Main navigation -->
          <div class="hidden md:flex items-center space-x-6">
            <router-link to="/" class="nav-link" active-class="text-primary font-medium">Dashboard</router-link>
            <router-link to="/chats" class="nav-link" active-class="text-primary font-medium">Chats</router-link>
            <router-link to="/api-keys" class="nav-link" active-class="text-primary font-medium">API Keys</router-link>
            <router-link to="/prompts" class="nav-link" active-class="text-primary font-medium">Saved Prompts</router-link>
            <router-link to="/analytics" class="nav-link" active-class="text-primary font-medium">Analytics</router-link>
          </div>

          <!-- User profile and notifications -->
          <div class="flex items-center space-x-4">
            <router-link to="/notifications" class="relative">
              <span class="i-lucide-bell h-6 w-6"></span>
              <span v-if="notificationCount > 0" class="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ notificationCount > 9 ? '9+' : notificationCount }}
              </span>
            </router-link>

            <div class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full">
                  <img :src="userProfilePic || 'https://ui-avatars.com/api/?name=' + userName" alt="User profile" />
                </div>
              </label>
              <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li>
                  <div class="p-2 text-sm">
                    <div class="font-medium">{{ userName }}</div>
                    <div class="text-xs opacity-70">{{ userEmail }}</div>
                    <div class="text-xs mt-1">
                      <span class="badge badge-sm" :class="tierBadgeClass">{{ userTier }}</span>
                    </div>
                  </div>
                </li>
                <li><router-link to="/profile">Profile Settings</router-link></li>
                <li><router-link to="/subscription">Subscription</router-link></li>
                <li v-if="isAdmin"><router-link to="/admin">Admin Panel</router-link></li>
                <li><router-link to="/help">Help & Support</router-link></li>
                <li><a @click="logout">Logout</a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <main class="main-layout-content container mx-auto px-4 py-6">
      <slot />
    </main>

    <footer class="main-layout-footer bg-base-200 p-6">
      <div class="container mx-auto">
        <div class="flex flex-col md:flex-row md:justify-between items-center">
          <div class="mb-4 md:mb-0">
            <div class="flex items-center space-x-2">
              <img src="@/assets/logo.svg" alt="Goblix AI" class="h-6 w-6" />
              <span class="font-medium">Goblix AI</span>
            </div>
            <p class="text-sm opacity-70 mt-1">© {{ currentYear }} Goblix AI. All rights reserved.</p>
          </div>
          <div class="flex space-x-6">
            <a href="#" class="text-sm hover:underline">Terms of Service</a>
            <a href="#" class="text-sm hover:underline">Privacy Policy</a>
            <a href="#" class="text-sm hover:underline">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

// Router
const router = useRouter();

// Auth store
const authStore = useAuthStore();

// Reactive state
const notificationCount = ref<number>(0);
const currentYear = new Date().getFullYear();

// Computed properties
const userName = computed<string>(() => {
  return authStore.user?.display_name || authStore.user?.email?.split('@')[0] || 'User';
});

const userEmail = computed<string>(() => {
  return authStore.user?.email || '';
});

const userProfilePic = computed<string | undefined>(() => {
  return authStore.user?.profile_picture_url;
});

const userTier = computed<string>(() => {
  return (authStore.userSubscription?.tier || 'free').toUpperCase();
});

const isAdmin = computed<boolean>(() => {
  return authStore.isAdmin;
});

const tierBadgeClass = computed<string>(() => {
  const tier = authStore.userSubscription?.tier || 'free';
  switch (tier) {
    case 'premium':
      return 'badge-primary';
    case 'plus':
      return 'badge-secondary';
    default:
      return 'badge-ghost';
  }
});

// Methods
const logout = async (): Promise<void> => {
  await authStore.logout();
  router.push('/login');
};

// Lifecycle hooks
onMounted(() => {
  // Example: Fetch notification count
  // This would typically be handled by a notification store or service
  notificationCount.value = 3;
});
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-layout-content {
  flex: 1;
}

.nav-link {
  /*@apply text-base-content hover:text-primary transition-colors duration-150;*/
}
</style>