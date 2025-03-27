<!-- src/views/ResetPasswordView.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import { AlertCircle, CheckCircle, Lock, KeyRound, ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const resetComplete = ref(false);

// Get token from query params
const token = computed(() => route.query.token as string);

const validateForm = () => {
  errorMessage.value = '';

  if (!password.value) {
    errorMessage.value = 'Password is required';
    return false;
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters';
    return false;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match';
    return false;
  }

  return true;
};

const resetPassword = async () => {
  if (!validateForm()) return;

  loading.value = true;

  try {
    if (!token.value) {
      throw new Error('Password reset token is missing');
    }

    const { error } = await supabase.auth.verifyOtp({
      token: token.value,
      type: 'recovery',
      newPassword: password.value
    });

    if (error) throw error;

    successMessage.value = 'Your password has been reset successfully!';
    resetComplete.value = true;

  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to reset password';
    console.error('Password reset error:', error);
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  router.push('/authentication');
};
</script>

<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary">Goblix<span class="text-secondary">AI</span></h1>
      </div>

      <!-- Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl font-bold text-center mx-auto mb-4">Reset Your Password</h2>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="alert alert-error mb-4">
            <AlertCircle class="stroke-current shrink-0 h-6 w-6" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="alert alert-success mb-4">
            <CheckCircle class="stroke-current shrink-0 h-6 w-6" />
            <span>{{ successMessage }}</span>
          </div>

          <!-- Reset Password Form -->
          <div v-if="!resetComplete">
            <p class="mb-6 text-center">Please enter your new password below.</p>

            <form @submit.prevent="resetPassword">
              <div class="form-control mt-4">
                <label class="label">
                  <span class="label-text">New Password</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/50">
                    <Lock size="18" />
                  </span>
                  <input
                      v-model="password"
                      type="password"
                      placeholder="Enter new password"
                      class="input input-bordered w-full pl-10"
                      :disabled="loading"
                      required
                  />
                </div>
                <label class="label">
                  <span class="label-text-alt">Must be at least 8 characters</span>
                </label>
              </div>

              <div class="form-control mt-2">
                <label class="label">
                  <span class="label-text">Confirm New Password</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/50">
                    <KeyRound size="18" />
                  </span>
                  <input
                      v-model="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      class="input input-bordered w-full pl-10"
                      :disabled="loading"
                      required
                  />
                </div>
              </div>

              <div class="form-control mt-6">
                <button
                    type="submit"
                    class="btn btn-primary"
                    :class="{ 'loading': loading }"
                    :disabled="loading"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>

          <!-- After Reset Complete -->
          <div v-else class="text-center py-4">
            <CheckCircle class="h-16 w-16 mx-auto text-success mb-4" />
            <p class="mb-6">Your password has been reset successfully.</p>

            <button
                @click="goToLogin"
                class="btn btn-primary"
            >
              <ArrowLeft class="mr-2 h-5 w-5" />
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>