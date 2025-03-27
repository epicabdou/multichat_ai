<!-- layouts/AppLayout.vue -->
<template>
  <div class="app-layout">
    <aside>App Sidebar</aside>
    <div class="content">
      <header>
        <AppHeader />
        <nav>
          <RouterLink to="/app">Dashboard</RouterLink>
          <RouterLink to="/app/settings">About</RouterLink>
          <LogoutButton />
        </nav>
      </header>
      <main>
        <slot></slot>
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import {RouterLink} from "vue-router";
import LogoutButton from "@/components/LogoutButton.vue";
import AppHeader from "@/components/AppHeader.vue";
</script>