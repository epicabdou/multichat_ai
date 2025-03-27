/**
 * Manages user subscription status
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './auth';
import type { Subscription, SubscriptionsState } from '@/types';

export const useSubscriptionStore = defineStore('subscription', () => {
  // State
  const subscriptions = ref<Subscription[]>([]);
  const currentSubscription = ref<Subscription | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Auth store for user ID
  const authStore = useAuthStore();

  // Computed
  const sortedSubscriptions = computed<Subscription[]>(() => {
    return [...subscriptions.value].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });

  // Actions
  async function fetchSubscriptions(): Promise<void> {
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('Subscriptions')
        .select('*')
        .eq('user_id', authStore.user!.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      subscriptions.value = data as Subscription[];
    } catch (err: any) {
      console.error('Error fetching subscriptions:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSubscription(id: string): Promise<Subscription | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('Subscriptions')
        .select('*')
        .eq('id', id)
        .eq('user_id', authStore.user!.id)
        .single();

      if (fetchError) throw fetchError;

      currentSubscription.value = data as Subscription;
      return currentSubscription.value;
    } catch (err: any) {
      console.error(`Error fetching subscription:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createSubscription(data: Partial<Subscription>): Promise<Subscription | null> {
    if (!authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const newData = {
        ...data,
        user_id: authStore.user!.id,
      };

      const { data: createdData, error: createError } = await supabase
        .from('Subscriptions')
        .insert(newData)
        .select()
        .single();

      if (createError) throw createError;

      // Add to local array
      const typedData = createdData as Subscription;
      subscriptions.value.push(typedData);
      currentSubscription.value = typedData;

      return typedData;
    } catch (err: any) {
      console.error(`Error creating subscription:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data: updatedData, error: updateError } = await supabase
        .from('Subscriptions')
        .update(data)
        .eq('id', id)
        .eq('user_id', authStore.user!.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update in local array
      const typedData = updatedData as Subscription;
      const index = subscriptions.value.findIndex(item => item.id === id);
      if (index !== -1) {
        subscriptions.value[index] = typedData;
      }

      if (currentSubscription.value?.id === id) {
        currentSubscription.value = typedData;
      }

      return typedData;
    } catch (err: any) {
      console.error(`Error updating subscription:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteSubscription(id: string): Promise<boolean> {
    if (!id || !authStore.isAuthenticated) return false;

    isLoading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from('Subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.user!.id);

      if (deleteError) throw deleteError;

      // Remove from local array
      subscriptions.value = subscriptions.value.filter(item => item.id !== id);

      if (currentSubscription.value?.id === id) {
        currentSubscription.value = null;
      }

      return true;
    } catch (err: any) {
      console.error(`Error deleting subscription:`, err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Clear store data
  function clearStore(): void {
    subscriptions.value = [];
    currentSubscription.value = null;
    error.value = null;
  }

  // Initialize by fetching data
  if (authStore.isAuthenticated) {
    fetchSubscriptions();
  }

  return {
    // State
    subscriptions,
    currentSubscription,
    isLoading,
    error,

    // Computed
    sortedSubscriptions,

    // Actions
    fetchSubscriptions,
    fetchSubscription,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    clearStore
  };
});
