/**
 * Chat Service
 * Handles interactions with AI providers and chat functionality
 */
import supabaseService from './supabase';
import apiKeyService from './apiKey';
import type { ChatSession, Message } from '@/types';

interface SendMessageResponse {
  response: string;
  tokens_used: number;
  cost: number;
}

class ChatService {
  /**
   * Send a message to an AI provider using the edge function
   * @param message - User message
   * @param chatSessionId - Chat session ID
   * @param settings - Chat settings (temperature, etc.)
   * @returns AI response
   */
  async sendMessage(message: string, chatSessionId: string, settings: Record<string, any> = {}): Promise<string> {
    if (!chatSessionId) {
      throw new Error('Chat session ID is required');
    }

    try {
      // Get the chat session details
      const { data: chatSession, error: chatError } = await supabaseService.getById('ChatSessions', chatSessionId);

      if (chatError) throw chatError;

      // Get the provider and API key
      const { data: apiKeys, error: keyError } = await supabaseService.select('ApiKeys', '*', {
        user_id: chatSession.user_id,
        provider_id: chatSession.provider_id,
        is_active: true
      });

      if (keyError) throw keyError;

      if (!apiKeys || apiKeys.length === 0) {
        throw new Error('No active API key found for this provider');
      }

      // Use the first active API key
      const apiKey = apiKeys[0];

      // Get provider information
      const { data: provider, error: providerError } = await supabaseService.getById('Providers', chatSession.provider_id);

      if (providerError) throw providerError;

      // Call the edge function to send the message
      const { data: sessionData } = await supabaseService.supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({
          message,
          chat_session_id: chatSessionId,
          encrypted_key: apiKey.encrypted_key,
          provider: provider.name,
          model_id: chatSession.model_id,
          settings: {
            ...chatSession.settings,
            ...settings
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error from provider API: ${errorData.error || response.statusText}`);
      }

      const result: SendMessageResponse = await response.json();

      // Update API key usage statistics
      await apiKeyService.updateUsageStats(apiKey.id, {
        last_used: new Date().toISOString(),
        [`usage_${new Date().toISOString().split('T')[0]}`]: result.tokens_used,
        total_tokens: (apiKey.usage_stats?.total_tokens || 0) + result.tokens_used,
        total_cost: (apiKey.usage_stats?.total_cost || 0) + result.cost
      });

      return result.response;
    } catch (error) {
      console.error('Error sending message to provider:', error);
      throw error;
    }
  }

  /**
   * Create a new chat session
   * @param userId - User ID
   * @param providerId - Provider ID
   * @param title - Session title
   * @param settings - Chat settings
   * @returns Created chat session
   */
  async createChatSession(
    userId: string,
    providerId: string,
    title?: string,
    settings?: Record<string, any>
  ): Promise<ChatSession> {
    try {
      // Verify that the user has an active API key for this provider
      const { data: apiKeys, error: keyError } = await supabaseService.select('ApiKeys', '*', {
        user_id: userId,
        provider_id: providerId,
        is_active: true
      });

      if (keyError) throw keyError;

      if (!apiKeys || apiKeys.length === 0) {
        throw new Error('No active API key found for this provider. Please add an API key first.');
      }

      // Get provider information to get default model
      const { data: provider, error: providerError } = await supabaseService.getById('Providers', providerId);

      if (providerError) throw providerError;

      // Default model is the first one in available_models, if any
      const defaultModel = provider.available_models &&
      Array.isArray(provider.available_models) &&
      provider.available_models.length > 0 ?
        provider.available_models[0].id : undefined;

      // Create the chat session
      const chatSessionData = {
        user_id: userId,
        provider_id: providerId,
        title: title || `Chat with ${provider.name} - ${new Date().toLocaleString()}`,
        model_id: defaultModel,
        settings: settings || provider.default_settings || {},
        last_message_at: new Date().toISOString(),
        is_archived: false
      };

      const { data, error } = await supabaseService.insert('ChatSessions', chatSessionData);

      if (error) throw error;

      return data as ChatSession;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  /**
   * Get all chat sessions for a user
   * @param userId - User ID
   * @param includeArchived - Whether to include archived chats
   * @returns List of chat sessions
   */
  async getChatSessions(userId: string, includeArchived: boolean = false): Promise<ChatSession[]> {
    try {
      let query = supabaseService.select('ChatSessions', '*, Providers(name, logo_url)', {
        user_id: userId
      });

      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }

      const { data, error } = await query.order('last_message_at', { ascending: false });

      if (error) throw error;

      return data as ChatSession[];
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      throw error;
    }
  }

  /**
   * Get messages for a chat session
   * @param chatSessionId - Chat session ID
   * @param limit - Maximum number of messages
   * @param offset - Offset for pagination
   * @returns List of messages
   */
  async getMessages(chatSessionId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    try {
      const { data, error } = await supabaseService.select('Messages', '*', {
        chat_session_id: chatSessionId
      })
        .order('sequence_number', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data as Message[];
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Archive a chat session
   * @param chatSessionId - Chat session ID
   * @returns Updated chat session
   */
  async archiveChatSession(chatSessionId: string): Promise<ChatSession> {
    try {
      const { data, error } = await supabaseService.update('ChatSessions', {
        is_archived: true
      }, { id: chatSessionId });

      if (error) throw error;

      return data as ChatSession;
    } catch (error) {
      console.error('Error archiving chat session:', error);
      throw error;
    }
  }

  /**
   * Delete a chat session and all of its messages
   * @param chatSessionId - Chat session ID
   * @returns Success status
   */
  async deleteChatSession(chatSessionId: string): Promise<boolean> {
    try {
      // First delete all messages
      const { error: messagesError } = await supabaseService.delete('Messages', {
        chat_session_id: chatSessionId
      });

      if (messagesError) throw messagesError;

      // Then delete the chat session
      const { error } = await supabaseService.delete('ChatSessions', {
        id: chatSessionId
      });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
  }

  /**
   * Get available models for a provider
   * @param providerId - Provider ID
   * @returns List of available models
   */
  async getAvailableModels(providerId: string): Promise<Record<string, any>[]> {
    try {
      const { data, error } = await supabaseService.getById('Providers', providerId);

      if (error) throw error;

      return data.available_models || [];
    } catch (error) {
      console.error('Error getting available models:', error);
      return [];
    }
  }
}

export const chatService = new ChatService();
export default chatService;