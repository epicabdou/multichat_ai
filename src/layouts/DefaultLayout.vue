<!-- layouts/DefaultLayout.vue -->
<template>
  <div class="default-layout">
    <header>
      <div>Default Header</div>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/app">Start</RouterLink>
      </nav>
    </header>

    <main>
      <slot></slot>
    </main>
    <footer>Default Footer</footer>
  </div>
</template>
<script setup lang="ts">
import {RouterLink} from "vue-router";
</script>