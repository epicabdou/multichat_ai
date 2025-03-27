/**
 * Auth Service
 * Handles user authentication and session management
 */
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

class AuthService {
  /**
   * Sign in with email and password
   * @param email - User email
   * @param password - User password
   * @returns Auth result
   */
  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  /**
   * Sign up with email and password
   * @param email - User email
   * @param password - User password
   * @returns Auth result
   */
  async signUp(email: string, password: string) {
    return supabase.auth.signUp({
      email,
      password
    });
  }

  /**
   * Sign out the current user
   * @returns Sign out result
   */
  async signOut() {
    return supabase.auth.signOut();
  }

  /**
   * Reset password with email
   * @param email - User email
   * @returns Reset result
   */
  async resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-reset`
    });
  }

  /**
   * Update password for authenticated user
   * @param newPassword - New password
   * @returns Update result
   */
  async updatePassword(newPassword: string) {
    return supabase.auth.updateUser({
      password: newPassword
    });
  }

  /**
   * Get the current session
   * @returns Current session
   */
  async getSession() {
    return supabase.auth.getSession();
  }

  /**
   * Get the current user
   * @returns Current user or null
   */
  async getUser(): Promise<User | null> {
    const { data } = await this.getSession();
    return data?.session?.user as unknown as User || null;
  }

  /**
   * Set up auth state change listener
   * @param callback - Callback function
   * @returns Unsubscribe function
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
export default authService;
