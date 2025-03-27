/**
 * Manages user notifications and alerts
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './auth';
import type { Notification, NotificationsState } from '@/types';

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([]);
  const currentNotification = ref<Notification | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Auth store for user ID
  const authStore = useAuthStore();

  // Computed
  const sortedNotifications = computed<Notification[]>(() => {
    return [...notifications.value].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });

  // Actions
  async function fetchNotifications(): Promise<void> {
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('Notifications')
        .select('*')
        .eq('user_id', authStore.user!.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      notifications.value = data as Notification[];
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchNotification(id: string): Promise<Notification | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('Notifications')
        .select('*')
        .eq('id', id)
        .eq('user_id', authStore.user!.id)
        .single();

      if (fetchError) throw fetchError;

      currentNotification.value = data as Notification;
      return currentNotification.value;
    } catch (err: any) {
      console.error(`Error fetching notification:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createNotification(data: Partial<Notification>): Promise<Notification | null> {
    if (!authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const newData = {
        ...data,
        user_id: authStore.user!.id,
      };

      const { data: createdData, error: createError } = await supabase
        .from('Notifications')
        .insert(newData)
        .select()
        .single();

      if (createError) throw createError;

      // Add to local array
      const typedData = createdData as Notification;
      notifications.value.push(typedData);
      currentNotification.value = typedData;

      return typedData;
    } catch (err: any) {
      console.error(`Error creating notification:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateNotification(id: string, data: Partial<Notification>): Promise<Notification | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data: updatedData, error: updateError } = await supabase
        .from('Notifications')
        .update(data)
        .eq('id', id)
        .eq('user_id', authStore.user!.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update in local array
      const typedData = updatedData as Notification;
      const index = notifications.value.findIndex(item => item.id === id);
      if (index !== -1) {
        notifications.value[index] = typedData;
      }

      if (currentNotification.value?.id === id) {
        currentNotification.value = typedData;
      }

      return typedData;
    } catch (err: any) {
      console.error(`Error updating notification:`, err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteNotification(id: string): Promise<boolean> {
    if (!id || !authStore.isAuthenticated) return false;

    isLoading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from('Notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.user!.id);

      if (deleteError) throw deleteError;

      // Remove from local array
      notifications.value = notifications.value.filter(item => item.id !== id);

      if (currentNotification.value?.id === id) {
        currentNotification.value = null;
      }

      return true;
    } catch (err: any) {
      console.error(`Error deleting notification:`, err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Clear store data
  function clearStore(): void {
    notifications.value = [];
    currentNotification.value = null;
    error.value = null;
  }

  // Initialize by fetching data
  if (authStore.isAuthenticated) {
    fetchNotifications();
  }

  return {
    // State
    notifications,
    currentNotification,
    isLoading,
    error,

    // Computed
    sortedNotifications,

    // Actions
    fetchNotifications,
    fetchNotification,
    createNotification,
    updateNotification,
    deleteNotification,
    clearStore
  };
});
