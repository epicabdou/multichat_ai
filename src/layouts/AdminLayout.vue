<template>
  <div class="admin-layout">
    <!-- Top navigation bar -->
    <header class="admin-layout-header bg-base-100 shadow-sm border-b border-base-200">
      <div class="container mx-auto flex justify-between items-center px-4 py-2">
        <!-- Logo and admin indicator -->
        <div class="flex items-center space-x-4">
          <router-link to="/" class="flex items-center">
            <img src="@/assets/logo.svg" alt="Goblix AI" class="h-8 w-8" />
            <span class="text-xl font-bold ml-2">Goblix AI</span>
          </router-link>
          <div class="badge badge-primary">Admin</div>
        </div>

        <!-- Return to app and user profile -->
        <div class="flex items-center space-x-4">
          <router-link to="/" class="btn btn-sm btn-ghost">
            <span class="i-lucide-arrow-left h-4 w-4 mr-1"></span>
            Back to App
          </router-link>

          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-circle avatar">
              <div class="w-8 rounded-full">
                <img :src="userProfilePic || 'https://ui-avatars.com/api/?name=' + userName" alt="User profile" />
              </div>
            </label>
            <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li><router-link to="/profile">Profile</router-link></li>
              <li><a @click="logout">Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <div class="admin-layout-body flex flex-col md:flex-row h-[calc(100vh-64px)]">
      <!-- Sidebar navigation -->
      <aside class="admin-sidebar w-full md:w-64 bg-base-200 md:border-r border-base-300 md:h-full overflow-y-auto">
        <div class="p-4">
          <h2 class="text-lg font-bold text-base-content mb-4">Admin Panel</h2>

          <nav class="space-y-1">
            <router-link to="/admin" exact-active-class="bg-primary/10 text-primary font-medium"
                        class="flex items-center px-3 py-2 rounded-md text-base-content hover:bg-base-300">
              <span class="i-lucide-layout-dashboard h-5 w-5 mr-3"></span>
              Dashboard
            </router-link>

            <router-link to="/admin/users" exact-active-class="bg-primary/10 text-primary font-medium"
                        class="flex items-center px-3 py-2 rounded-md text-base-content hover:bg-base-300">
              <span class="i-lucide-users h-5 w-5 mr-3"></span>
              User Management
            </router-link>

            <router-link to="/admin/providers" exact-active-class="bg-primary/10 text-primary font-medium"
                        class="flex items-center px-3 py-2 rounded-md text-base-content hover:bg-base-300">
              <span class="i-lucide-plug h-5 w-5 mr-3"></span>
              Provider Management
            </router-link>

            <div class="pt-4 pb-2">
              <div class="border-t border-base-300"></div>
            </div>

            <h3 class="px-3 text-xs font-medium uppercase tracking-wider opacity-70">System</h3>

            <a href="#" class="flex items-center px-3 py-2 rounded-md text-base-content hover:bg-base-300">
              <span class="i-lucide-settings h-5 w-5 mr-3"></span>
              System Settings
            </a>

            <a href="#" class="flex items-center px-3 py-2 rounded-md text-base-content hover:bg-base-300">
              <span class="i-lucide-file-text h-5 w-5 mr-3"></span>
              Logs
            </a>

            <a href="#" class="flex items-center px-3 py-2 rounded-md text-base-content hover:bg-base-300">
              <span class="i-lucide-database h-5 w-5 mr-3"></span>
              Database
            </a>
          </nav>
        </div>
      </aside>

      <!-- Main content area -->
      <main class="admin-main flex-1 overflow-auto p-4 md:p-6 bg-base-100">
        <div class="container mx-auto">
          <!-- Admin content via router view -->
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

// Router and stores
const router = useRouter();
const authStore = useAuthStore();

// Computed values
const userName = computed<string>(() => {
  return authStore.user?.display_name || authStore.user?.email?.split('@')[0] || 'User';
});

const userProfilePic = computed<string | undefined>(() => {
  return authStore.user?.profile_picture_url;
});

// Methods
const logout = async (): Promise<void> => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Mobile sidebar */
@media (max-width: 768px) {
  .admin-sidebar {
    border-bottom: 1px solid;
    /*@apply border-base-300;*/
  }
}
</style>