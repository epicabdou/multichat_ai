<!-- src/views/ConfirmView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const success = ref(false);
const errorMessage = ref('');
const actionMessage = ref('Confirming your account...');

// Handle both OAuth and email confirmation processes
onMounted(async () => {
  try {
    // First check if this is a hash-based OAuth redirect
    const { data: authData, error: authError } = await supabase.auth.getSession();

    // If we have a hash fragment but no session yet, try to set the session from the URL
    if (window.location.hash && !authData?.session) {
      const { data, error } = await supabase.auth.getSessionFromUrl();

      if (error) {
        throw error;
      }

      if (data?.session) {
        success.value = true;
        actionMessage.value = 'Authentication successful!';

        // Redirect to app after short delay
        setTimeout(() => {
          router.push('/app');
        }, 1500);
        return;
      }
    } else if (authData?.session) {
      // User is already authenticated, send them to the app
      success.value = true;
      actionMessage.value = 'You are already signed in!';

      setTimeout(() => {
        router.push('/app');
      }, 1500);
      return;
    }

    // Check if this is an email confirmation with token and type params
    const token = route.query.token as string;
    const type = route.query.type as string;

    if (token && type) {
      if (type === 'signup') {
        const { error } = await supabase.auth.verifyOtp({
          token,
          type: 'signup',
        });

        if (error) {
          throw error;
        }

        success.value = true;
        actionMessage.value = 'Email confirmed successfully!';

        // Redirect to login after confirmation
        setTimeout(() => {
          router.push('/authentication');
        }, 2000);
      } else if (type === 'recovery') {
        // For password recovery flow
        success.value = true;
        actionMessage.value = 'You can now reset your password';

        // Redirect to password reset page
        setTimeout(() => {
          router.push({
            path: '/reset-password',
            query: { token }
          });
        }, 1500);
      } else {
        throw new Error('Unsupported confirmation type');
      }
    } else {
      // No token or type - could be a direct visit to the page
      throw new Error('Invalid confirmation link or direct page visit');
    }
  } catch (error: any) {
    success.value = false;
    errorMessage.value = error.message || 'An error occurred during confirmation';

    console.error('Confirmation error:', error);
  } finally {
    loading.value = false;
  }
});

const goToLogin = () => {
  router.push('/authentication');
};

const goToApp = () => {
  router.push('/app');
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
        <div class="card-body items-center text-center">
          <!-- Loading State -->
          <div v-if="loading" class="py-8">
            <Loader2 class="h-16 w-16 animate-spin mx-auto text-primary mb-4" />
            <h2 class="text-2xl font-semibold mb-2">Processing</h2>
            <p class="text-base-content/70">{{ actionMessage }}</p>
          </div>

          <!-- Success State -->
          <div v-else-if="success" class="py-8">
            <CheckCircle class="h-16 w-16 mx-auto text-success mb-4" />
            <h2 class="text-2xl font-semibold mb-2">Success!</h2>
            <p class="text-base-content/70 mb-6">{{ actionMessage }}</p>

            <button
                @click="goToApp"
                class="btn btn-primary"
            >
              Go to Dashboard
              <ArrowRight class="ml-2 h-5 w-5" />
            </button>
          </div>

          <!-- Error State -->
          <div v-else class="py-8">
            <XCircle class="h-16 w-16 mx-auto text-error mb-4" />
            <h2 class="text-2xl font-semibold mb-2">Oops!</h2>
            <p class="text-base-content/70 mb-6">{{ errorMessage }}</p>

            <button
                @click="goToLogin"
                class="btn btn-primary"
            >
              Return to Login
              <ArrowRight class="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>