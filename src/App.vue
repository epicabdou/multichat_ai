<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <component :is="getLayout(route)" v-if="getLayout(route)">
        <component :is="Component" />
      </component>
      <component :is="Component" v-else />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouteLocationNormalizedLoaded } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import ChatLayout from '@/layouts/ChatLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';

// Create a map of layout components
const layouts = {
  MainLayout,
  AuthLayout,
  ChatLayout,
  AdminLayout,
};

// Function to get the appropriate layout component based on route meta
const getLayout = (route: RouteLocationNormalizedLoaded) => {
  if (route.meta.layout) {
    return layouts[route.meta.layout as keyof typeof layouts];
  }
  return null;
};
</script>

<style>
/* Global styles */
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  height: 100%;
}

#app {
  height: 100%;
}
</style>
