<template>
  <div class="login-view">
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold mb-6 text-center">Log In</h2>

        <!-- Alert for errors -->
        <div v-if="error" class="alert alert-error mb-4">
          <span class="i-lucide-alert-circle h-5 w-5"></span>
          <span>{{ error }}</span>
        </div>

        <!-- Email login form -->
        <form @submit.prevent="handleEmailLogin">
          <div class="form-control mb-3">
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
            />
          </div>

          <div class="form-control mb-4">
            <label class="label" for="password">
              <span class="label-text">Password</span>
            </label>
            <input
              type="password"
              id="password"
              v-model="password"
              class="input input-bordered w-full"
              required
              autocomplete="current-password"
              :disabled="isLoading"
            />
            <label class="label">
              <router-link to="/password-reset" class="label-text-alt link link-hover">
                Forgot password?
              </router-link>
            </label>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full mb-6"
            :class="{ 'btn-disabled': isLoading }"
          >
            <span v-if="isLoading" class="loading loading-spinner loading-sm mr-2"></span>
            Log In
          </button>
        </form>

        <!-- Divider -->
        <div class="divider text-base-content/60 text-sm">OR</div>

        <!-- Social login buttons -->
        <div class="space-y-3 mb-4">
          <button
            @click="handleGoogleLogin"
            class="btn btn-outline w-full"
            :disabled="isLoading"
          >
            <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Continue with Google
          </button>

          <button
            @click="handleGithubLogin"
            class="btn btn-outline w-full"
            :disabled="isLoading"
          >
            <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <!-- Register link -->
        <div class="text-center text-sm">
          Don't have an account?
          <router-link to="/register" class="link link-primary">
            Register now
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

// Router and auth store
const router = useRouter();
const authStore = useAuthStore();

// Form state
const email = ref<string>('');
const password = ref<string>('');
const error = ref<string | null>(null);
const isLoading = ref<boolean>(false);

// Email login
const handleEmailLogin = async (): Promise<void> => {
  error.value = null;
  isLoading.value = true;

  try {
    await authStore.login(email.value, password.value);

    if (authStore.error) {
      error.value = authStore.error;
    } else {
      // Redirect to dashboard on successful login
      router.push('/');
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to log in. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Google login
const handleGoogleLogin = async (): Promise<void> => {
  error.value = null;
  isLoading.value = true;

  try {
    await authStore.loginWithGoogle();

    if (authStore.error) {
      error.value = authStore.error;
    } else {
      // Redirect to dashboard on successful login
      router.push('/');
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to log in with Google. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// GitHub login
const handleGithubLogin = async (): Promise<void> => {
  error.value = null;
  isLoading.value = true;

  try {
    await authStore.loginWithGithub();

    if (authStore.error) {
      error.value = authStore.error;
    } else {
      // Redirect to dashboard on successful login
      router.push('/');
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to log in with GitHub. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-view {
  max-width: 100%;
}
</style>