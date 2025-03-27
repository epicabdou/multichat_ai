<!-- src/components/LogoutButton.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { LogOut } from 'lucide-vue-next';

const props = defineProps({
  variant: {
    type: String,
    default: 'default', // 'default', 'icon', 'text'
  },
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
  },
  redirect: {
    type: String,
    default: '/'
  }
});

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const error = ref('');

const handleLogout = async () => {
  loading.value = true;
  error.value = '';

  try {
    await authStore.signOut();
    router.push(props.redirect);
  } catch (err: any) {
    error.value = err.message || 'Failed to log out';
    console.error('Logout error:', err);
  } finally {
    loading.value = false;
  }
};

// Compute button classes based on props
import { computed } from 'vue';

const buttonClass = computed(() => {
  const classes = ['btn'];

  // Size variant
  if (props.size === 'sm') classes.push('btn-sm');
  if (props.size === 'lg') classes.push('btn-lg');

  // Style variant
  if (props.variant === 'default') classes.push('btn-error');
  if (props.variant === 'icon') classes.push('btn-ghost btn-circle');
  if (props.variant === 'text') classes.push('btn-ghost');

  return classes.join(' ');
});
</script>

<template>
  <div>
    <!-- Default button (with text and icon) -->
    <button
        v-if="variant === 'default'"
        :class="buttonClass"
        @click="handleLogout"
        :disabled="loading"
    >
      <LogOut v-if="!loading" class="h-5 w-5 mr-2" />
      <span v-if="loading" class="loading loading-spinner loading-xs mr-2"></span>
      <span>Log out</span>
    </button>

    <!-- Icon-only button -->
    <button
        v-else-if="variant === 'icon'"
        :class="buttonClass"
        @click="handleLogout"
        :disabled="loading"
        title="Log out"
    >
      <LogOut v-if="!loading" class="h-5 w-5" />
      <span v-else class="loading loading-spinner loading-xs"></span>
    </button>

    <!-- Text-only button -->
    <button
        v-else-if="variant === 'text'"
        :class="buttonClass"
        @click="handleLogout"
        :disabled="loading"
    >
      <span v-if="loading" class="loading loading-spinner loading-xs mr-2"></span>
      <span>Log out</span>
    </button>

    <!-- Error message (if logout fails) -->
    <div v-if="error" class="text-error text-sm mt-1">{{ error }}</div>
  </div>
</template>