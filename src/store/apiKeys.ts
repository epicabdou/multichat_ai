/**
 * Manages user API keys for different providers
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './auth';
import type { ApiKey, ApiKeiesState } from '@/types';

export const useApiKeysStore = defineStore('apiKeys', () => {
  // State
  const apiKeies = ref<ApiKey[]>([]);
  const currentApiKey = ref<ApiKey | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Auth store for user ID
  const authStore = useAuthStore();

  // Computed
  const sortedApiKeies = computed<ApiKey[]>(() => {
    return [...apiKeies.value].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });

  // Actions
  async function fetchApiKeies(): Promise<void> {
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('ApiKeies')
        .select('*, Providers(*)')
        .eq('user_id', authStore.user!.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      apiKeies.value = data as ApiKey[];
    } catch (err: any) {
      console.error('Error fetching apiKeies:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchApiKey(id: string): Promise<ApiKey | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('ApiKeies')
        .select('*, Providers(*)')
        .eq('id', id)
        .eq('user_id', authStore.user!.id)
        .single();

      if (fetchError) throw fetchError;

      currentApiKey.value = data as ApiKey;
      return currentApiKey.value;
    } catch (err: any) {
      console.error(`Error fetching apiKey:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createApiKey(data: Partial<ApiKey>): Promise<ApiKey | null> {
    if (!authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const newData = {
        ...data,
        user_id: authStore.user!.id,
      };

      const { data: createdData, error: createError } = await supabase
        .from('ApiKeies')
        .insert(newData)
        .select()
        .single();

      if (createError) throw createError;

      // Add to local array
      const typedData = createdData as ApiKey;
      apiKeies.value.push(typedData);
      currentApiKey.value = typedData;

      return typedData;
    } catch (err: any) {
      console.error(`Error creating apiKey:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateApiKey(id: string, data: Partial<ApiKey>): Promise<ApiKey | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data: updatedData, error: updateError } = await supabase
        .from('ApiKeies')
        .update(data)
        .eq('id', id)
        .eq('user_id', authStore.user!.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update in local array
      const typedData = updatedData as ApiKey;
      const index = apiKeies.value.findIndex(item => item.id === id);
      if (index !== -1) {
        apiKeies.value[index] = typedData;
      }

      if (currentApiKey.value?.id === id) {
        currentApiKey.value = typedData;
      }

      return typedData;
    } catch (err: any) {
      console.error(`Error updating apiKey:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteApiKey(id: string): Promise<boolean> {
    if (!id || !authStore.isAuthenticated) return false;

    isLoading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from('ApiKeies')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.user!.id);

      if (deleteError) throw deleteError;

      // Remove from local array
      apiKeies.value = apiKeies.value.filter(item => item.id !== id);

      if (currentApiKey.value?.id === id) {
        currentApiKey.value = null;
      }

      return true;
    } catch (err: any) {
      console.error(`Error deleting apiKey:`, err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Clear store data
  function clearStore(): void {
    apiKeies.value = [];
    currentApiKey.value = null;
    error.value = null;
  }

  // Initialize by fetching data
  if (authStore.isAuthenticated) {
    fetchApiKeies();
  }

  return {
    // State
    apiKeies,
    currentApiKey,
    isLoading,
    error,

    // Computed
    sortedApiKeies,

    // Actions
    fetchApiKeies,
    fetchApiKey,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    clearStore
  };
});
