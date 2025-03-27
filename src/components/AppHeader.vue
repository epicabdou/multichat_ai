<!-- src/components/AppHeader.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Menu, X, MessageSquarePlus } from 'lucide-vue-next';
import UserProfileMenu from './UserProfileMenu.vue';
import LogoutButton from './LogoutButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);

const navigate = (path: string) => {
  router.push(path);
  mobileMenuOpen.value = false;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};
</script>

<template>
  <header class="bg-base-100 shadow-md">
    <div class="container mx-auto px-4">
      <div class="navbar min-h-16">
        <!-- Logo -->
        <div class="navbar-start">
          <a @click="navigate('/')" class="cursor-pointer flex items-center">
            <h1 class="text-2xl font-bold text-primary">Goblix<span class="text-secondary">AI</span></h1>
          </a>
        </div>

        <!-- Desktop Navigation -->
        <div class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal px-1 gap-2">
            <li><a @click="navigate('/')">Home</a></li>
            <li><a @click="navigate('/about')">About</a></li>
            <li v-if="isAuthenticated"><a @click="navigate('/app')">Dashboard</a></li>
          </ul>
        </div>

        <!-- Right side actions -->
        <div class="navbar-end gap-2">
          <!-- New Chat button (if authenticated) -->
          <button
              v-if="isAuthenticated"
              @click="navigate('/app/new-chat')"
              class="btn btn-primary btn-sm hidden md:flex"
          >
            <MessageSquarePlus size="18" />
            <span class="ml-1">New Chat</span>
          </button>

          <!-- User menu (if authenticated) -->
          <UserProfileMenu v-if="isAuthenticated" />

          <!-- Login/Register buttons (if not authenticated) -->
          <template v-else>
            <button
                @click="navigate('/authentication')"
                class="btn btn-ghost btn-sm hidden md:inline-flex"
            >
              Sign in
            </button>
            <button
                @click="navigate('/authentication')"
                class="btn btn-primary btn-sm hidden md:inline-flex"
            >
              Get started
            </button>
          </template>

          <!-- Mobile menu toggle -->
          <button class="btn btn-ghost btn-circle lg:hidden" @click="toggleMobileMenu">
            <Menu v-if="!mobileMenuOpen" size="24" />
            <X v-else size="24" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <div v-if="mobileMenuOpen" class="lg:hidden py-4 px-2">
        <ul class="menu menu-vertical w-full gap-2">
          <li><a @click="navigate('/')">Home</a></li>
          <li><a @click="navigate('/about')">About</a></li>
          <li v-if="isAuthenticated"><a @click="navigate('/app')">Dashboard</a></li>

          <!-- Mobile New Chat button (if authenticated) -->
          <li v-if="isAuthenticated">
            <a @click="navigate('/app/new-chat')" class="btn btn-primary justify-start">
              <MessageSquarePlus size="18" />
              <span class="ml-2">New Chat</span>
            </a>
          </li>

          <!-- Mobile Auth buttons (if not authenticated) -->
          <template v-if="!isAuthenticated">
            <li>
              <a @click="navigate('/authentication')" class="mt-2">
                Sign in
              </a>
            </li>
            <li>
              <a @click="navigate('/authentication')" class="btn btn-primary justify-start mt-2">
                Get started
              </a>
            </li>
          </template>

          <!-- Mobile Logout (if authenticated) -->
          <li v-if="isAuthenticated" class="mt-2">
            <LogoutButton variant="text" />
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>