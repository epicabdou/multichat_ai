<!-- src/views/AuthView.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'vue-router';
import {
  AlertCircle,
  CheckCircle,
  Github,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  X
} from 'lucide-vue-next';

const router = useRouter();
const isLogin = ref(true);
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const formTitle = computed(() => isLogin.value ? 'Sign in to Goblix' : 'Create your account');
const submitButtonText = computed(() => isLogin.value ? 'Sign in' : 'Create account');
const toggleText = computed(() => isLogin.value ? 'Need an account? Sign up' : 'Already have an account? Sign in');

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value;
  errorMessage.value = '';
  successMessage.value = '';
};

const validateForm = () => {
  errorMessage.value = '';

  if (!email.value) {
    errorMessage.value = 'Email is required';
    return false;
  }

  if (!password.value) {
    errorMessage.value = 'Password is required';
    return false;
  }

  if (!isLogin.value && password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match';
    return false;
  }

  if (!isLogin.value && password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters';
    return false;
  }

  return true;
};

const handleEmailAuth = async () => {
  if (!validateForm()) return;

  loading.value = true;

  try {
    if (isLogin.value) {
      // Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });

      if (error) throw error;

      router.push('/app');
    } else {
      // Sign up
      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      });

      if (error) throw error;

      successMessage.value = 'Registration successful! Please check your email for confirmation.';
      isLogin.value = true;
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An error occurred during authentication';
  } finally {
    loading.value = false;
  }
};

const handleSocialAuth = async (provider: 'google' | 'github') => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/confirm`,
      },
    });

    if (error) throw error;

  } catch (error: any) {
    errorMessage.value = error.message || `Error signing in with ${provider}`;
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary">Goblix<span class="text-secondary">AI</span></h1>
        <p class="text-base-content/70 mt-2">Access multiple AI providers in one place</p>
      </div>

      <!-- Auth Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl font-bold text-center mx-auto mb-4">{{ formTitle }}</h2>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="alert alert-error mb-4">
            <AlertCircle class="stroke-current shrink-0 h-6 w-6" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Success Alert -->
          <div v-if="successMessage" class="alert alert-success mb-4">
            <CheckCircle class="stroke-current shrink-0 h-6 w-6" />
            <span>{{ successMessage }}</span>
          </div>

          <!-- Social Auth Buttons -->
          <div class="flex flex-col gap-3 mb-4">
            <button
                @click="handleSocialAuth('google')"
                class="btn btn-outline"
                :disabled="loading"
            >
              <Mail class="h-5 w-5 mr-2" />
              Continue with Google
            </button>

            <button
                @click="handleSocialAuth('github')"
                class="btn btn-outline"
                :disabled="loading"
            >
              <Github class="h-5 w-5 mr-2" />
              Continue with GitHub
            </button>
          </div>

          <!-- Divider -->
          <div class="divider">OR</div>

          <!-- Email Auth Form -->
          <form @submit.prevent="handleEmailAuth">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/50">
                  <Mail size="18" />
                </span>
                <input
                    v-model="email"
                    type="email"
                    placeholder="your@email.com"
                    class="input input-bordered w-full pl-10"
                    :disabled="loading"
                    required
                />
              </div>
            </div>

            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">Password</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/50">
                  <Lock size="18" />
                </span>
                <input
                    v-model="password"
                    type="password"
                    placeholder="••••••••"
                    class="input input-bordered w-full pl-10"
                    :disabled="loading"
                    required
                />
              </div>
            </div>

            <div v-if="!isLogin" class="form-control mt-4">
              <label class="label">
                <span class="label-text">Confirm Password</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/50">
                  <Lock size="18" />
                </span>
                <input
                    v-model="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    class="input input-bordered w-full pl-10"
                    :disabled="loading"
                    required
                />
              </div>
            </div>

            <div v-if="isLogin" class="mt-2 text-right">
              <a href="#" class="link link-primary text-sm">Forgot password?</a>
            </div>

            <div class="form-control mt-6">
              <button
                  type="submit"
                  class="btn btn-primary"
                  :class="{ 'loading': loading }"
                  :disabled="loading"
              >
                {{ submitButtonText }}
              </button>
            </div>
          </form>

          <!-- Toggle Login/Register -->
          <div class="text-center mt-4">
            <button @click="toggleAuthMode" class="link link-hover text-sm">
              {{ toggleText }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6 text-sm text-base-content/70">
        <p>By signing in, you agree to our <a href="#" class="link link-hover">Terms of Service</a> and <a href="#" class="link link-hover">Privacy Policy</a></p>
      </div>
    </div>
  </div>
</template>