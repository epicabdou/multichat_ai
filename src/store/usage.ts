/**
 * Tracks API usage and costs
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './auth';
import type { UsageTracking, UsageTrackingsState } from '@/types';

export const useUsageStore = defineStore('usage', () => {
  // State
  const usageTrackings = ref<UsageTracking[]>([]);
  const currentUsageTracking = ref<UsageTracking | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Auth store for user ID
  const authStore = useAuthStore();

  // Computed
  const sortedUsageTrackings = computed<UsageTracking[]>(() => {
    return [...usageTrackings.value].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });

  // Actions
  async function fetchUsageTrackings(): Promise<void> {
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('UsageTrackings')
        .select('*')
        .eq('user_id', authStore.user!.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      usageTrackings.value = data as UsageTracking[];
    } catch (err: any) {
      console.error('Error fetching usageTrackings:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUsageTracking(id: string): Promise<UsageTracking | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('UsageTrackings')
        .select('*')
        .eq('id', id)
        .eq('user_id', authStore.user!.id)
        .single();

      if (fetchError) throw fetchError;

      currentUsageTracking.value = data as UsageTracking;
      return currentUsageTracking.value;
    } catch (err: any) {
      console.error(`Error fetching usageTracking:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createUsageTracking(data: Partial<UsageTracking>): Promise<UsageTracking | null> {
    if (!authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const newData = {
        ...data,
        user_id: authStore.user!.id,
      };

      const { data: createdData, error: createError } = await supabase
        .from('UsageTrackings')
        .insert(newData)
        .select()
        .single();

      if (createError) throw createError;

      // Add to local array
      const typedData = createdData as UsageTracking;
      usageTrackings.value.push(typedData);
      currentUsageTracking.value = typedData;

      return typedData;
    } catch (err: any) {
      console.error(`Error creating usageTracking:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUsageTracking(id: string, data: Partial<UsageTracking>): Promise<UsageTracking | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data: updatedData, error: updateError } = await supabase
        .from('UsageTrackings')
        .update(data)
        .eq('id', id)
        .eq('user_id', authStore.user!.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update in local array
      const typedData = updatedData as UsageTracking;
      const index = usageTrackings.value.findIndex(item => item.id === id);
      if (index !== -1) {
        usageTrackings.value[index] = typedData;
      }

      if (currentUsageTracking.value?.id === id) {
        currentUsageTracking.value = typedData;
      }

      return typedData;
    } catch (err: any) {
      console.error(`Error updating usageTracking:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUsageTracking(id: string): Promise<boolean> {
    if (!id || !authStore.isAuthenticated) return false;

    isLoading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from('UsageTrackings')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.user!.id);

      if (deleteError) throw deleteError;

      // Remove from local array
      usageTrackings.value = usageTrackings.value.filter(item => item.id !== id);

      if (currentUsageTracking.value?.id === id) {
        currentUsageTracking.value = null;
      }

      return true;
    } catch (err: any) {
      console.error(`Error deleting usageTracking:`, err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Clear store data
  function clearStore(): void {
    usageTrackings.value = [];
    currentUsageTracking.value = null;
    error.value = null;
  }

  // Initialize by fetching data
  if (authStore.isAuthenticated) {
    fetchUsageTrackings();
  }

  return {
    // State
    usageTrackings,
    currentUsageTracking,
    isLoading,
    error,

    // Computed
    sortedUsageTrackings,

    // Actions
    fetchUsageTrackings,
    fetchUsageTracking,
    createUsageTracking,
    updateUsageTracking,
    deleteUsageTracking,
    clearStore
  };
});
