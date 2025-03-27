<!-- src/components/UserProfileMenu.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  User,
  Settings,
  CreditCard,
  Key,
  LogOut
} from 'lucide-vue-next';
import LogoutButton from './LogoutButton.vue';

const router = useRouter();
const authStore = useAuthStore();

const userInitials = computed(() => {
  const email = authStore.userEmail;
  if (!email) return '?';

  // Get first letter of email
  return email.charAt(0).toUpperCase();
});

const navigate = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="dropdown dropdown-end">
    <!-- Avatar button -->
    <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar placeholder">
      <div class="bg-neutral text-neutral-content rounded-full w-10">
        <span>{{ userInitials }}</span>
      </div>
    </div>

    <!-- Dropdown menu -->
    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
      <li class="menu-title px-4 py-2">
        <span class="text-xs opacity-60">Signed in as</span>
        <span class="font-medium text-sm truncate">{{ authStore.userEmail }}</span>
      </li>
      <div class="divider my-0"></div>

      <li>
        <a @click="navigate('/app/profile')">
          <User size="18" />
          Profile
        </a>
      </li>

      <li>
        <a @click="navigate('/app/settings')">
          <Settings size="18" />
          Settings
        </a>
      </li>

      <li>
        <a @click="navigate('/app/subscription')">
          <CreditCard size="18" />
          Subscription
        </a>
      </li>

      <li>
        <a @click="navigate('/app/api-keys')">
          <Key size="18" />
          API Keys
        </a>
      </li>

      <div class="divider my-0"></div>

      <li>
        <LogoutButton variant="text" size="sm" class="w-full" />
      </li>
    </ul>
  </div>
</template>