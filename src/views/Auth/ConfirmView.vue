<template>
  <div class="confirm-view">
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold mb-2 text-center">Complete Your Registration</h2>

        <div v-if="isLoading" class="py-8 flex flex-col items-center justify-center">
          <div class="loading loading-spinner loading-lg mb-4"></div>
          <p class="text-center">Processing your request...</p>
        </div>

        <div v-else-if="error" class="alert alert-error mb-6">
          <span class="i-lucide-alert-circle h-5 w-5"></span>
          <span>{{ error }}</span>
        </div>

        <div v-else-if="confirmSuccess" class="py-8">
          <div class="flex justify-center mb-4">
            <span class="i-lucide-check-circle h-20 w-20 text-success"></span>
          </div>
          <h3 class="text-xl font-bold text-center mb-2">Registration Complete!</h3>
          <p class="text-center text-base-content/70 mb-6">
            Your account is now active and ready to use.
          </p>
          <button @click="redirectToDashboard" class="btn btn-primary w-full">
            Go to Dashboard
          </button>
        </div>

        <div v-else-if="showSetPassword" class="py-4">
          <p class="text-center text-base-content/70 mb-4">
            Welcome! You've signed up with {{ authProvider }}.
            Please set a password for your account to complete your registration.
          </p>

          <form @submit.prevent="handleSetPassword">
            <div class="form-control mb-3">
              <label class="label" for="password">
                <span class="label-text">Password</span>
              </label>
              <input
                type="password"
                id="password"
                v-model="password"
                class="input input-bordered w-full"
                required
                minlength="8"
                autocomplete="new-password"
                :disabled="isLoading"
              />
              <label class="label">
                <span class="label-text-alt text-base-content/70">Must be at least 8 characters</span>
              </label>
            </div>

            <div class="form-control mb-6">
              <label class="label" for="confirmPassword">
                <span class="label-text">Confirm Password</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                class="input input-bordered w-full"
                required
                autocomplete="new-password"
                :disabled="isLoading"
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full"
              :class="{ 'btn-disabled': isLoading || !passwordsValid }"
            >
              <span v-if="isLoading" class="loading loading-spinner loading-sm mr-2"></span>
              Set Password & Continue
            </button>
          </form>
        </div>

        <div v-else class="py-8">
          <div class="flex justify-center mb-4">
            <span class="i-lucide-user-check h-16 w-16 text-primary"></span>
          </div>
          <h3 class="text-xl font-bold text-center mb-2">Confirming Your Account</h3>
          <p class="text-center text-base-content/70 mb-6">
            Please wait while we activate your account and set up your profile.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

// Router and route
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// State
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);
const confirmSuccess = ref<boolean>(false);
const showSetPassword = ref<boolean>(false);
const authProvider = ref<string>('');
const password = ref<string>('');
const confirmPassword = ref<string>('');

// Computed properties
const passwordsValid = computed<boolean>(() => {
  return password.value.length >= 8 && password.value === confirmPassword.value;
});

// Confirm user account with token from URL
const confirmAccount = async (): Promise<void> => {
  const token = route.query.token as string;
  const type = route.query.type as string;

  if (!token) {
    error.value = 'Invalid confirmation link. Please try again or contact support.';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    if (type === 'recovery') {
      // Password reset confirmation
      showSetPassword.value = true;
      isLoading.value = false;
      return;
    }

    // Standard email confirmation
    await authStore.confirmAccount(token);

    if (authStore.error) {
      error.value = authStore.error;
    } else {
      confirmSuccess.value = true;
    }
  } catch (err: any) {
    error.value = err.message || 'Account confirmation failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Handle setting password for OAuth users or password reset
const handleSetPassword = async (): Promise<void> => {
  if (!passwordsValid.value) {
    error.value = 'Passwords do not match or are too short.';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    // If it's a recovery token, use resetPasswordWithToken
    if (route.query.type === 'recovery') {
      await authStore.resetPasswordWithToken(
        route.query.token as string,
        password.value
      );
    } else {
      // For OAuth users setting initial password
      await authStore.updatePassword(password.value);
    }

    if (authStore.error) {
      error.value = authStore.error;
    } else {
      confirmSuccess.value = true;
      showSetPassword.value = false;
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to set password. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Redirect to dashboard
const redirectToDashboard = (): void => {
  router.push('/');
};

// Check if user is coming from OAuth registration
const checkOAuthRegistration = (): void => {
  const provider = route.query.provider as string;

  if (provider) {
    showSetPassword.value = true;
    authProvider.value = provider.charAt(0).toUpperCase() + provider.slice(1);
  }
};

// On component mount
onMounted(() => {
  // Check if this is an OAuth registration that needs password setup
  checkOAuthRegistration();

  // If there's a token in the URL, confirm the account
  if (route.query.token) {
    confirmAccount();
  }
});
</script>

<style scoped>
.confirm-view {
  max-width: 100%;
}
</style>