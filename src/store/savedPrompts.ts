/**
 * Manages user saved prompts (Plus and Premium tier)
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './auth';
import type { SavedPrompt, SavedPromptsState } from '@/types';

export const useSavedPromptsStore = defineStore('savedPrompts', () => {
  // State
  const savedPrompts = ref<SavedPrompt[]>([]);
  const currentSavedPrompt = ref<SavedPrompt | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Auth store for user ID
  const authStore = useAuthStore();

  // Computed
  const sortedSavedPrompts = computed<SavedPrompt[]>(() => {
    return [...savedPrompts.value].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });

  // Actions
  async function fetchSavedPrompts(): Promise<void> {
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('SavedPrompts')
        .select('*')
        .eq('user_id', authStore.user!.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      savedPrompts.value = data as SavedPrompt[];
    } catch (err: any) {
      console.error('Error fetching savedPrompts:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSavedPrompt(id: string): Promise<SavedPrompt | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('SavedPrompts')
        .select('*')
        .eq('id', id)
        .eq('user_id', authStore.user!.id)
        .single();

      if (fetchError) throw fetchError;

      currentSavedPrompt.value = data as SavedPrompt;
      return currentSavedPrompt.value;
    } catch (err: any) {
      console.error(`Error fetching savedPrompt:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createSavedPrompt(data: Partial<SavedPrompt>): Promise<SavedPrompt | null> {
    if (!authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const newData = {
        ...data,
        user_id: authStore.user!.id,
      };

      const { data: createdData, error: createError } = await supabase
        .from('SavedPrompts')
        .insert(newData)
        .select()
        .single();

      if (createError) throw createError;

      // Add to local array
      const typedData = createdData as SavedPrompt;
      savedPrompts.value.push(typedData);
      currentSavedPrompt.value = typedData;

      return typedData;
    } catch (err: any) {
      console.error(`Error creating savedPrompt:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateSavedPrompt(id: string, data: Partial<SavedPrompt>): Promise<SavedPrompt | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data: updatedData, error: updateError } = await supabase
        .from('SavedPrompts')
        .update(data)
        .eq('id', id)
        .eq('user_id', authStore.user!.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update in local array
      const typedData = updatedData as SavedPrompt;
      const index = savedPrompts.value.findIndex(item => item.id === id);
      if (index !== -1) {
        savedPrompts.value[index] = typedData;
      }

      if (currentSavedPrompt.value?.id === id) {
        currentSavedPrompt.value = typedData;
      }

      return typedData;
    } catch (err: any) {
      console.error(`Error updating savedPrompt:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteSavedPrompt(id: string): Promise<boolean> {
    if (!id || !authStore.isAuthenticated) return false;

    isLoading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from('SavedPrompts')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.user!.id);

      if (deleteError) throw deleteError;

      // Remove from local array
      savedPrompts.value = savedPrompts.value.filter(item => item.id !== id);

      if (currentSavedPrompt.value?.id === id) {
        currentSavedPrompt.value = null;
      }

      return true;
    } catch (err: any) {
      console.error(`Error deleting savedPrompt:`, err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Clear store data
  function clearStore(): void {
    savedPrompts.value = [];
    currentSavedPrompt.value = null;
    error.value = null;
  }

  // Initialize by fetching data
  if (authStore.isAuthenticated) {
    fetchSavedPrompts();
  }

  return {
    // State
    savedPrompts,
    currentSavedPrompt,
    isLoading,
    error,

    // Computed
    sortedSavedPrompts,

    // Actions
    fetchSavedPrompts,
    fetchSavedPrompt,
    createSavedPrompt,
    updateSavedPrompt,
    deleteSavedPrompt,
    clearStore
  };
});
