/**
 * Chat Service
 * Handles interactions with AI providers and chat functionality
 */
import supabaseService from './supabase';
import encryptionService from './encryption';
import type { ChatSession, Message } from '@/types';

interface SendMessageResponse {
  response: string;
  tokens_used: number;
  cost: number;
}

class ChatService {
  /**
   * Send a message to an AI provider
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

      // Decrypt the API key
      const decryptedKey = await encryptionService.decrypt(apiKey.encrypted_key);

      // Call the edge function to send the message to the provider
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          chat_session_id: chatSessionId,
          api_key: decryptedKey,
          provider: chatSession.Providers?.name,
          model_id: chatSession.model_id,
          settings: {
            ...chatSession.settings,
            ...settings
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Error from provider API: ${response.statusText}`);
      }

      const result: SendMessageResponse = await response.json();

      // Track usage
      await this.trackUsage(chatSessionId, apiKey.id, result.tokens_used, result.cost);

      return result.response;
    } catch (error) {
      console.error('Error sending message to provider:', error);
      throw error;
    }
  }

  /**
   * Track API usage
   * @param chatSessionId - Chat session ID
   * @param apiKeyId - API key ID
   * @param tokensUsed - Number of tokens used
   * @param cost - Cost of the request
   * @returns Tracking result
   */
  async trackUsage(chatSessionId: string, apiKeyId: string, tokensUsed: number, cost: number) {
    try {
      const { data: messageData } = await supabaseService.select('Messages', '*', {
        chat_session_id: chatSessionId
      });

      const lastMessage = messageData[messageData.length - 1];

      const usageData = {
        chat_session_id: chatSessionId,
        api_key_id: apiKeyId,
        message_id: lastMessage?.id,
        tokens_used: tokensUsed,
        cost: cost,
        request_type: 'chat',
      };

      await supabaseService.insert('UsageTracking', usageData, false);
    } catch (error) {
      console.error('Error tracking usage:', error);
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
