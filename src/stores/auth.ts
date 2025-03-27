// src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref<User | null>(null);
    const session = ref<Session | null>(null);
    const loading = ref(true);
    const userSubscription = ref<any>(null);

    // Getters
    const isAuthenticated = computed(() => !!user.value);
    const userEmail = computed(() => user.value?.email || '');
    const userId = computed(() => user.value?.id || '');

    // Actions

    /**
     * Initialize the auth store by checking for existing session
     */
    const initialize = async () => {
        loading.value = true;

        try {
            // Get the current session
            const { data } = await supabase.auth.getSession();

            if (data.session) {
                session.value = data.session;
                user.value = data.session.user;
            }

            // Setup listener for auth state changes
            userSubscription.value = supabase.auth.onAuthStateChange((event, newSession) => {
                console.log('Auth state changed:', event);
                session.value = newSession;
                user.value = newSession?.user || null;

                if (event === 'SIGNED_OUT') {
                    user.value = null;
                    session.value = null;
                }
            });

        } catch (error) {
            console.error('Error initializing auth store:', error);
        } finally {
            loading.value = false;
        }
    };

    /**
     * Sign out the current user
     */
    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // Clear the user and session (they will also be cleared by the auth state listener)
            user.value = null;
            session.value = null;

        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    /**
     * Clean up subscriptions when no longer needed
     */
    const cleanup = () => {
        if (userSubscription.value) {
            userSubscription.value.unsubscribe();
        }
    };

    // Initialize auth on store creation
    initialize();

    return {
        // State
        user,
        session,
        loading,

        // Getters
        isAuthenticated,
        userEmail,
        userId,

        // Actions
        initialize,
        signOut,
        cleanup,
    };
});