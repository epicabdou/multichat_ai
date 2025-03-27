<template>
  <div class="auth-layout">
    <div class="flex min-h-screen">
      <!-- Left side - Auth form container -->
      <div class="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12">
        <div class="w-full max-w-md">
          <!-- Logo -->
          <div class="flex justify-center mb-8">
            <div class="flex items-center space-x-2">
              <img src="@/assets/logo.svg" alt="Goblix AI" class="h-10 w-10" />
              <span class="text-2xl font-bold">Goblix AI</span>
            </div>
          </div>

          <!-- Auth content (login, register, etc) -->
          <slot />

          <!-- Footer links -->
          <div class="mt-8 pt-6 border-t border-base-300 text-center text-sm text-base-content/70">
            <div class="flex justify-center space-x-4">
              <a href="#" class="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" class="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" class="hover:text-primary transition-colors">Help</a>
            </div>
            <div class="mt-4">
              © {{ currentYear }} Goblix AI. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Image/Illustration (hidden on mobile) -->
      <div class="hidden md:flex md:w-1/2 bg-primary/10 justify-center items-center relative">
        <div class="p-12 max-w-md">
          <h2 class="text-3xl font-bold mb-4">Your Gateway to AI Conversations</h2>
          <p class="mb-6">
            Connect with multiple AI providers through a single interface. Manage your conversations efficiently while maintaining full control over your data and API keys.
          </p>

          <!-- Features -->
          <div class="space-y-4">
            <div class="flex items-start space-x-3">
              <div class="bg-primary/20 p-2 rounded-full">
                <span class="i-lucide-message-square text-primary h-5 w-5"></span>
              </div>
              <div>
                <h3 class="font-medium">Multi-Provider Support</h3>
                <p class="text-sm opacity-75">Use multiple AI providers like OpenAI, Claude, DeepSeek, and more.</p>
              </div>
            </div>

            <div class="flex items-start space-x-3">
              <div class="bg-primary/20 p-2 rounded-full">
                <span class="i-lucide-key text-primary h-5 w-5"></span>
              </div>
              <div>
                <h3 class="font-medium">Secure Key Management</h3>
                <p class="text-sm opacity-75">Your API keys are securely encrypted and stored with end-to-end protection.</p>
              </div>
            </div>

            <div class="flex items-start space-x-3">
              <div class="bg-primary/20 p-2 rounded-full">
                <span class="i-lucide-bar-chart text-primary h-5 w-5"></span>
              </div>
              <div>
                <h3 class="font-medium">Cost Optimization</h3>
                <p class="text-sm opacity-75">Track your usage and optimize costs across all AI providers.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Background decorative elements -->
        <div class="absolute inset-0 overflow-hidden opacity-20">
          <div class="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/30"></div>
          <div class="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-primary/30"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Computed properties
const currentYear = computed(() => {
  return new Date().getFullYear();
});
</script>

<style scoped>
.auth-layout {
  /*@apply bg-base-100;*/
  min-height: 100vh;
}
</style>