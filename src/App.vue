<!-- src/App.vue -->
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { useAuthStore } from './stores/auth';
import { RouterView } from 'vue-router'

// Initialize the auth store when the app loads
const authStore = useAuthStore();

// Clean up auth subscriptions when component is unmounted
onBeforeUnmount(() => {
  authStore.cleanup();
});
</script>

<template>
  <RouterView />
</template>