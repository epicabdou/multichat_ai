<template>
  <div class="verify-email-view">
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold mb-2 text-center">Verify Your Email</h2>

        <div v-if="isLoading" class="py-8 flex flex-col items-center justify-center">
          <div class="loading loading-spinner loading-lg mb-4"></div>
          <p class="text-center">Verifying your email...</p>
        </div>

        <div v-else-if="error" class="alert alert-error mb-6">
          <span class="i-lucide-alert-circle h-5 w-5"></span>
          <span>{{ error }}</span>

          <div class="mt-4 w-full">
            <button @click="handleResendVerification" class="btn btn-outline btn-sm w-full">
              Resend Verification Email
            </button>
          </div>
        </div>

        <div v-else-if="verificationSuccess" class="py-8">
          <div class="flex justify-center mb-4">
            <span class="i-lucide-check-circle h-20 w-20 text-success"></span>
          </div>
          <h3 class="text-xl font-bold text-center mb-2">Email Verified Successfully!</h3>
          <p class="text-center text-base-content/70 mb-6">
            Your email has been verified. You can now access all features of Goblix AI.
          </p>
          <button @click="redirectToDashboard" class="btn btn-primary w-full">
            Go to Dashboard
          </button>
        </div>

        <div v-else class="py-8">
          <div class="flex justify-center mb-4">
            <span class="i-lucide-mail h-16 w-16 text-primary"></span>
          </div>
          <h3 class="text-xl font-bold text-center mb-2">Check Your Email</h3>
          <p class="text-center text-base-content/70 mb-6">
            We've sent a verification link to <strong>{{ userEmail }}</strong>.<br>
            Click the link to complete your registration.
          </p>

          <div class="space-y-4">
            <div class="alert alert-info">
              <span class="i-lucide-info h-5 w-5"></span>
              <span>Check your spam or junk folder if you don't see the email in your inbox.</span>
            </div>

            <button @click="handleResendVerification" class="btn btn-outline w-full">
              Resend Verification Email
            </button>
          </div>
        </div>

        <!-- Back to login link -->
        <div class="text-center text-sm mt-4">
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

// Router and route
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// State
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);
const verificationSuccess = ref<boolean>(false);
const userEmail = ref<string>('');

// Verify email with token from URL
const verifyEmail = async (): Promise<void> => {
  const token = route.query.token as string;
  const type = route.query.type as string;

  if (!token || type !== 'email_confirmation') {
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    await authStore.verifyEmail(token);

    if (authStore.error) {
      error.value = authStore.error;
    } else {
      verificationSuccess.value = true;
    }
  } catch (err: any) {
    error.value = err.message || 'Email verification failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Resend verification email
const handleResendVerification = async (): Promise<void> => {
  if (!userEmail.value) return;

  isLoading.value = true;
  error.value = null;

  try {
    await authStore.resendVerificationEmail(userEmail.value);

    if (authStore.error) {
      error.value = authStore.error;
    } else {
      // Show confirmation message but don't change the view state
      alert('Verification email sent! Please check your inbox.');
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to resend verification email. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Redirect to dashboard
const redirectToDashboard = (): void => {
  router.push('/');
};

// On component mount, check for token and verify email
onMounted(() => {
  // Get user email from route or auth store
  userEmail.value = route.query.email as string || authStore.user?.email || '';

  // If there's a token in the URL, verify the email
  verifyEmail();
});
</script>

<style scoped>
.verify-email-view {
  max-width: 100%;
}
</style>