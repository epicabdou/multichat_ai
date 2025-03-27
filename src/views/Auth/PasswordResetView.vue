<template>
  <div class="password-reset-view">
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold mb-2 text-center">Reset Password</h2>
        <p class="text-center text-base-content/70 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <!-- Alert for errors -->
        <div v-if="error" class="alert alert-error mb-4">
          <span class="i-lucide-alert-circle h-5 w-5"></span>
          <span>{{ error }}</span>
        </div>

        <!-- Success message -->
        <div v-if="resetSuccess" class="alert alert-success mb-4">
          <span class="i-lucide-check-circle h-5 w-5"></span>
          <span>Password reset email sent! Please check your inbox.</span>
        </div>

        <!-- Reset form -->
        <form v-if="!resetSuccess" @submit.prevent="handlePasswordReset">
          <div class="form-control mb-6">
            <label class="label" for="email">
              <span class="label-text">Email</span>
            </label>
            <input
              type="email"
              id="email"
              v-model="email"
              class="input input-bordered w-full"
              required
              autocomplete="email"
              :disabled="isLoading"
              placeholder="your-email@example.com"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full mb-6"
            :class="{ 'btn-disabled': isLoading }"
          >
            <span v-if="isLoading" class="loading loading-spinner loading-sm mr-2"></span>
            Send Reset Link
          </button>
        </form>

        <div v-if="resetSuccess" class="text-center mb-6">
          <p class="mb-4">
            Didn't receive the email? Check your spam folder, or request a new link.
          </p>
          <button
            @click="handleResendResetLink"
            class="btn btn-outline btn-sm"
          >
            Resend Reset Link
          </button>
        </div>

        <!-- Back to login link -->
        <div class="text-center text-sm">
          <router-link to="/login" class="link">
            <span class="i-lucide-arrow-left h-4 w-4 mr-1"></span>
            Back to Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';

// Auth store
const authStore = useAuthStore();

// Form state
const email = ref<string>('');
const error = ref<string | null>(null);
const isLoading = ref<boolean>(false);
const resetSuccess = ref<boolean>(false);

// Handle password reset request
const handlePasswordReset = async (): Promise<void> => {
  if (!email.value.trim()) return;

  error.value = null;
  isLoading.value = true;

  try {
    await authStore.resetPassword(email.value);

    if (authStore.error) {
      error.value = authStore.error;
    } else {
      resetSuccess.value = true;
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to send reset link. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Handle resend reset link
const handleResendResetLink = async (): Promise<void> => {
  resetSuccess.value = false;
  await handlePasswordReset();
};
</script>

<style scoped>
.password-reset-view {
  max-width: 100%;
}
</style>