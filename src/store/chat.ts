/**
 * Manages chat sessions and messages
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './auth';
import type { ChatSession, Message, ChatState } from '@/types';

export const useChatStore = defineStore('chat', () => {
  // State
  const chatSessions = ref<ChatSession[]>([]);
  const currentChatSession = ref<ChatSession | null>(null);
  const messages = ref<Message[]>([]);
  const isLoading = ref<boolean>(false);
  const isMessageLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Auth store for user ID
  const authStore = useAuthStore();

  // Computed
  const sortedChatSessions = computed<ChatSession[]>(() => {
    return [...chatSessions.value].sort((a, b) => 
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );
  });

  const sortedMessages = computed<Message[]>(() => {
    return [...messages.value].sort((a, b) => 
      a.sequence_number - b.sequence_number
    );
  });

  // Actions
  async function fetchChatSessions(): Promise<void> {
    if (!authStore.isAuthenticated) return;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('ChatSessions')
        .select('*, Providers(name, logo_url)')
        .eq('user_id', authStore.user!.id)
        .order('last_message_at', { ascending: false });

      if (fetchError) throw fetchError;

      chatSessions.value = data as ChatSession[];
    } catch (err: any) {
      console.error('Error fetching chat sessions:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchChatSession(id: string): Promise<ChatSession | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('ChatSessions')
        .select('*, Providers(name, logo_url)')
        .eq('id', id)
        .eq('user_id', authStore.user!.id)
        .single();

      if (fetchError) throw fetchError;

      currentChatSession.value = data as ChatSession;
      await fetchMessages(id);

      return currentChatSession.value;
    } catch (err: any) {
      console.error('Error fetching chat session:', err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMessages(chatSessionId: string): Promise<Message[]> {
    if (!chatSessionId) return [];

    isMessageLoading.value = true;

    try {
      const { data, error: fetchError } = await supabase
        .from('Messages')
        .select('*')
        .eq('chat_session_id', chatSessionId)
        .order('sequence_number', { ascending: true });

      if (fetchError) throw fetchError;

      messages.value = data as Message[];
      return messages.value;
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      error.value = err.message;
      return [];
    } finally {
      isMessageLoading.value = false;
    }
  }

  async function createChatSession(data: Partial<ChatSession>): Promise<ChatSession | null> {
    if (!authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const newData = {
        ...data,
        user_id: authStore.user!.id,
        title: data.title || 'New Chat',
        last_message_at: new Date().toISOString()
      };

      const { data: createdData, error: createError } = await supabase
        .from('ChatSessions')
        .insert(newData)
        .select('*, Providers(name, logo_url)')
        .single();

      if (createError) throw createError;

      // Add to local array
      const typedData = createdData as ChatSession;
      chatSessions.value.push(typedData);
      currentChatSession.value = typedData;
      messages.value = [];

      return typedData;
    } catch (err: any) {
      console.error('Error creating chat session:', err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function sendMessage(content: string, role: 'user' | 'assistant' | 'system' = 'user'): Promise<Message | null> {
    if (!currentChatSession.value?.id || !authStore.isAuthenticated) return null;

    isMessageLoading.value = true;
    error.value = null;

    try {
      // Get the next sequence number
      const nextSequence = messages.value.length > 0 
        ? Math.max(...messages.value.map(m => m.sequence_number)) + 1 
        : 1;

      const messageData = {
        chat_session_id: currentChatSession.value.id,
        content,
        role,
        sequence_number: nextSequence,
        parent_message_id: messages.value.length > 0 
          ? messages.value[messages.value.length - 1].id 
          : null
      };

      const { data: createdMessage, error: createError } = await supabase
        .from('Messages')
        .insert(messageData)
        .select()
        .single();

      if (createError) throw createError;

      // Add to local array
      const typedMessage = createdMessage as Message;
      messages.value.push(typedMessage);

      // Update chat session's last_message_at
      await updateChatSession(currentChatSession.value.id, {
        last_message_at: new Date().toISOString()
      });

      return typedMessage;
    } catch (err: any) {
      console.error('Error sending message:', err);
      error.value = err.message;
      return null;
    } finally {
      isMessageLoading.value = false;
    }
  }

  async function updateChatSession(id: string, data: Partial<ChatSession>): Promise<ChatSession | null> {
    if (!id || !authStore.isAuthenticated) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const { data: updatedData, error: updateError } = await supabase
        .from('ChatSessions')
        .update(data)
        .eq('id', id)
        .eq('user_id', authStore.user!.id)
        .select('*, Providers(name, logo_url)')
        .single();

      if (updateError) throw updateError;

      // Update in local array
      const typedData = updatedData as ChatSession;
      const index = chatSessions.value.findIndex(item => item.id === id);
      if (index !== -1) {
        chatSessions.value[index] = typedData;
      }

      if (currentChatSession.value?.id === id) {
        currentChatSession.value = typedData;
      }

      return typedData;
    } catch (err: any) {
      console.error('Error updating chat session:', err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteChatSession(id: string): Promise<boolean> {
    if (!id || !authStore.isAuthenticated) return false;

    isLoading.value = true;
    error.value = null;

    try {
      // First delete all messages
      const { error: messagesDeleteError } = await supabase
        .from('Messages')
        .delete()
        .eq('chat_session_id', id);

      if (messagesDeleteError) throw messagesDeleteError;

      // Then delete the chat session
      const { error: deleteError } = await supabase
        .from('ChatSessions')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.user!.id);

      if (deleteError) throw deleteError;

      // Remove from local array
      chatSessions.value = chatSessions.value.filter(item => item.id !== id);

      if (currentChatSession.value?.id === id) {
        currentChatSession.value = null;
        messages.value = [];
      }

      return true;
    } catch (err: any) {
      console.error('Error deleting chat session:', err);
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function archiveChatSession(id: string): Promise<ChatSession | null> {
    return updateChatSession(id, { is_archived: true });
  }

  async function unarchiveChatSession(id: string): Promise<ChatSession | null> {
    return updateChatSession(id, { is_archived: false });
  }

  // Clear store data
  function clearStore(): void {
    chatSessions.value = [];
    currentChatSession.value = null;
    messages.value = [];
    error.value = null;
  }

  // Initialize by fetching data
  if (authStore.isAuthenticated) {
    fetchChatSessions();
  }

  return {
    // State
    chatSessions,
    currentChatSession,
    messages,
    isLoading,
    isMessageLoading,
    error,

    // Computed
    sortedChatSessions,
    sortedMessages,

    // Actions
    fetchChatSessions,
    fetchChatSession,
    fetchMessages,
    createChatSession,
    sendMessage,
    updateChatSession,
    deleteChatSession,
    archiveChatSession,
    unarchiveChatSession,
    clearStore
  };
});
