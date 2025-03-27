import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import type { User, Subscription } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const userSubscription = ref<Subscription | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Computed properties
  const isAuthenticated = computed<boolean>(() => !!user.value);
  const isAdmin = computed<boolean>(() => user.value?.role === 'app_admin');

  // Email & Password Authentication

  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      user.value = data.user as unknown as User;
      await fetchUserSubscription();
    } catch (err: any) {
      console.error('Login error:', err);
      error.value = err.message || 'Failed to log in. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  async function register(email: string, password: string): Promise<any> {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        }
      });

      if (authError) throw authError;

      return data;
    } catch (err: any) {
      console.error('Registration error:', err);
      error.value = err.message || 'Failed to register. Please try again.';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      user.value = null;
      userSubscription.value = null;
    } catch (err: any) {
      console.error('Logout error:', err);
      error.value = err.message || 'Failed to log out. Please try again.';
    }
  }

  // Social Authentication

  async function loginWithGoogle(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/confirm?provider=google`,
        }
      });

      if (authError) throw authError;

      // Note: The actual auth happens in the redirect flow,
      // so we don't update the user here
    } catch (err: any) {
      console.error('Google login error:', err);
      error.value = err.message || 'Failed to log in with Google. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  async function loginWithGithub(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/confirm?provider=github`,
        }
      });

      if (authError) throw authError;

      // Note: The actual auth happens in the redirect flow,
      // so we don't update the user here
    } catch (err: any) {
      console.error('GitHub login error:', err);
      error.value = err.message || 'Failed to log in with GitHub. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  // Password Reset

  async function resetPassword(email: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/confirm?type=recovery`,
      });

      if (resetError) throw resetError;
    } catch (err: any) {
      console.error('Password reset error:', err);
      error.value = err.message || 'Failed to send reset email. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Password update error:', err);
      error.value = err.message || 'Failed to reset password. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  async function updatePassword(newPassword: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Password update error:', err);
      error.value = err.message || 'Failed to update password. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  // Email Verification

  async function verifyEmail(token: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // For Supabase, email verification happens automatically with the link
      // This function is mainly for UI state management
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        user.value = data.session.user as unknown as User;
        await fetchUserSubscription();
      } else {
        throw new Error('Email verification failed or user is not logged in.');
      }
    } catch (err: any) {
      console.error('Email verification error:', err);
      error.value = err.message || 'Failed to verify email. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  async function resendVerificationEmail(email: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        }
      });

      if (resendError) throw resendError;
    } catch (err: any) {
      console.error('Resend verification error:', err);
      error.value = err.message || 'Failed to resend verification email. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  async function confirmAccount(token: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // For Supabase, account confirmation happens automatically
      // This function is mainly for UI state management
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        user.value = data.session.user as unknown as User;
        await fetchUserSubscription();
      } else {
        throw new Error('Account confirmation failed or user is not logged in.');
      }
    } catch (err: any) {
      console.error('Account confirmation error:', err);
      error.value = err.message || 'Failed to confirm account. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  // Subscription data

  async function fetchUserSubscription(): Promise<void> {
    if (!user.value) return;

    try {
      const { data, error: subError } = await supabase
        .from('Subscriptions')
        .select('*')
        .eq('user_id', user.value.id)
        .eq('is_active', true)
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

      if (subError) throw subError;

      userSubscription.value = data as Subscription;
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      // Don't set error.value, as this isn't a critical error for the user
    }
  }

  // Session management

  async function checkSession(): Promise<void> {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      user.value = data.session.user as unknown as User;
      await fetchUserSubscription();
    }
  }

  // Call checkSession when the store is first instantiated
  checkSession();

  // Set up auth change listener
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      user.value = session.user as unknown as User;
      fetchUserSubscription();
    } else if (event === 'SIGNED_OUT') {
      user.value = null;
      userSubscription.value = null;
    }
  });

  return {
    // State
    user,
    userSubscription,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    isAdmin,

    // Email & Password Auth
    login,
    register,
    logout,

    // Social Auth
    loginWithGoogle,
    loginWithGithub,

    // Password Management
    resetPassword,
    resetPasswordWithToken,
    updatePassword,

    // Email Verification
    verifyEmail,
    resendVerificationEmail,
    confirmAccount,

    // Other
    checkSession,
    fetchUserSubscription,
  };
});