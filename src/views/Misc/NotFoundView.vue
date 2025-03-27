<template>
  <div class="not-found-view">
    <h1>{{ title }}</h1>
    <!-- Not Found View content goes here -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Component data
const title = ref<string>('Not Found View');

// Computed properties
const capitalizedTitle = computed<string>(() => {
  return title.value.toUpperCase();
});

// Methods
const someMethod = (): void => {
  console.log('Method called in NotFoundView');
};

// Lifecycle hooks
onMounted(() => {
  console.log('NotFoundView component mounted');
});
</script>

<style scoped>
.not-found-view {
  /* Component styles */
  padding: 1rem;
}
</style>
