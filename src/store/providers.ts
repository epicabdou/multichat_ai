/**
 * Manages available AI providers
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './auth';
import type { Provider, ProvidersState } from '@/types';

export const useProviderStore = defineStore('providers', () => {
  // State
  const providers = ref<Provider[]>([]);
  const currentProvider = ref<Provider | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Auth store for user ID
  const authStore = useAuthStore();

  // Computed
  const sortedProviders = computed<Provider[]>(() => {
    return [...providers.value].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });

  // Actions
  async function fetchProviders(): Promise<void> {
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('Providers')
        .select('*')
        
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      providers.value = data as Provider[];
    } catch (err: any) {
      console.error('Error fetching providers:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchProvider(id: string): Promise<Provider | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('Providers')
        .select('*')
        .eq('id', id)
        
        .single();

      if (fetchError) throw fetchError;

      currentProvider.value = data as Provider;
      return currentProvider.value;
    } catch (err: any) {
      console.error(`Error fetching provider:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createProvider(data: Partial<Provider>): Promise<Provider | null> {
    if (!authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const newData = {
        ...data,
        user_id: authStore.user!.id,
      };

      const { data: createdData, error: createError } = await supabase
        .from('Providers')
        .insert(newData)
        .select()
        .single();

      if (createError) throw createError;

      // Add to local array
      const typedData = createdData as Provider;
      providers.value.push(typedData);
      currentProvider.value = typedData;

      return typedData;
    } catch (err: any) {
      console.error(`Error creating provider:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProvider(id: string, data: Partial<Provider>): Promise<Provider | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data: updatedData, error: updateError } = await supabase
        .from('Providers')
        .update(data)
        .eq('id', id)
        
        .select()
        .single();

      if (updateError) throw updateError;

      // Update in local array
      const typedData = updatedData as Provider;
      const index = providers.value.findIndex(item => item.id === id);
      if (index !== -1) {
        providers.value[index] = typedData;
      }

      if (currentProvider.value?.id === id) {
        currentProvider.value = typedData;
      }

      return typedData;
    } catch (err: any) {
      console.error(`Error updating provider:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteProvider(id: string): Promise<boolean> {
    if (!id || !authStore.isAuthenticated) return false;

    isLoading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from('Providers')
        .delete()
        .eq('id', id)
        ;

      if (deleteError) throw deleteError;

      // Remove from local array
      providers.value = providers.value.filter(item => item.id !== id);

      if (currentProvider.value?.id === id) {
        currentProvider.value = null;
      }

      return true;
    } catch (err: any) {
      console.error(`Error deleting provider:`, err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Clear store data
  function clearStore(): void {
    providers.value = [];
    currentProvider.value = null;
    error.value = null;
  }

  // Initialize by fetching data
  if (authStore.isAuthenticated) {
    fetchProviders();
  }

  return {
    // State
    providers,
    currentProvider,
    isLoading,
    error,

    // Computed
    sortedProviders,

    // Actions
    fetchProviders,
    fetchProvider,
    createProvider,
    updateProvider,
    deleteProvider,
    clearStore
  };
});
