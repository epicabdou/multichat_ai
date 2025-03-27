<template>
  <div class="register-view">
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold mb-6 text-center">Create Account</h2>

        <!-- Alert for errors -->
        <div v-if="error" class="alert alert-error mb-4">
          <span class="i-lucide-alert-circle h-5 w-5"></span>
          <span>{{ error }}</span>
        </div>

        <!-- Success message for verification -->
        <div v-if="registrationSuccess" class="alert alert-success mb-4">
          <span class="i-lucide-check-circle h-5 w-5"></span>
          <span>Registration successful! Please check your email to verify your account.</span>
        </div>

        <!-- Email registration form -->
        <form v-if="!registrationSuccess" @submit.prevent="handleEmailRegister">
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

          <div class="form-control mb-4">
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

          <div class="form-control mb-4">
            <label class="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                v-model="acceptTerms"
                class="checkbox checkbox-sm"
                required
                :disabled="isLoading"
              />
              <span class="label-text">
                I agree to the
                <a href="#" class="link link-primary">Terms of Service</a>
                and
                <a href="#" class="link link-primary">Privacy Policy</a>
              </span>
            </label>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full mb-6"
            :class="{ 'btn-disabled': isLoading || !formValid }"
          >
            <span v-if="isLoading" class="loading loading-spinner loading-sm mr-2"></span>
            Create Account
          </button>
        </form>

        <!-- Divider -->
        <div v-if="!registrationSuccess" class="divider text-base-content/60 text-sm">OR</div>

        <!-- Social registration buttons -->
        <div v-if="!registrationSuccess" class="space-y-3 mb-4">
          <button
            @click="handleGoogleRegister"
            class="btn btn-outline w-full"
            :disabled="isLoading"
          >
            <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Sign up with Google
          </button>

          <button
            @click="handleGithubRegister"
            class="btn btn-outline w-full"
            :disabled="isLoading"
          >
            <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Sign up with GitHub
          </button>
        </div>

        <!-- Login link -->
        <div class="text-center text-sm">
          Already have an account?
          <router-link to="/login" class="link link-primary">
            Log in
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

// Router and auth store
const router = useRouter();
const authStore = useAuthStore();

// Form state
const email = ref<string>('');
const password = ref<string>('');
const confirmPassword = ref<string>('');
const acceptTerms = ref<boolean>(false);
const error = ref<string | null>(null);
const isLoading = ref<boolean>(false);
const registrationSuccess = ref<boolean>(false);

// Computed properties
const formValid = computed<boolean>(() => {
  return (
    email.value.trim() !== '' &&
    password.value.length >= 8 &&
    password.value === confirmPassword.value &&
    acceptTerms.value
  );
});

// Email registration
const handleEmailRegister = async (): Promise<void> => {
  if (!formValid.value) return;

  error.value = null;
  isLoading.value = true;

  try {
    // Validate passwords match
    if (password.value !== confirmPassword.value) {
      error.value = 'Passwords do not match';
      return;
    }

    const result = await authStore.register(email.value, password.value);

    if (authStore.error) {
      error.value = authStore.error;
    } else {
      registrationSuccess.value = true;

      // If no email verification is required, redirect to dashboard
      if (result?.user) {
        router.push('/');
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Google registration
const handleGoogleRegister = async (): Promise<void> => {
  error.value = null;
  isLoading.value = true;

  try {
    await authStore.loginWithGoogle();

    if (authStore.error) {
      error.value = authStore.error;
    } else {
      // Redirect to dashboard on successful login/register with Google
      router.push('/');
    }
  } catch (err: any) {
    error.value = err.message || 'Registration with Google failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// GitHub registration
const handleGithubRegister = async (): Promise<void> => {
  error.value = null;
  isLoading.value = true;

  try {
    await authStore.loginWithGithub();

    if (authStore.error) {
      error.value = authStore.error;
    } else {
      // Redirect to dashboard on successful login/register with GitHub
      router.push('/');
    }
  } catch (err: any) {
    error.value = err.message || 'Registration with GitHub failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-view {
  max-width: 100%;
}
</style>