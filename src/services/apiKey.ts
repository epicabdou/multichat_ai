/**
 * API Key Service
 * Manages API keys for different providers
 */
import supabaseService from './supabase';
import encryptionService from './encryption';
import type { ApiKey } from '@/types';

class ApiKeyService {
  /**
   * Get all API keys for a user
   * @param userId - User ID
   * @returns List of API keys
   */
  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    try {
      const { data, error } = await supabaseService.select(
        'ApiKeys', 
        '*, Providers(id, name, logo_url)', 
        { user_id: userId }
      );

      if (error) throw error;

      return data as ApiKey[] || [];
    } catch (error) {
      console.error('Error getting user API keys:', error);
      throw error;
    }
  }

  /**
   * Get API key by ID
   * @param keyId - API key ID
   * @returns API key
   */
  async getApiKey(keyId: string): Promise<ApiKey> {
    try {
      const { data, error } = await supabaseService.getById(
        'ApiKeys', 
        keyId,
        '*, Providers(id, name, logo_url)'
      );

      if (error) throw error;

      return data as ApiKey;
    } catch (error) {
      console.error('Error getting API key:', error);
      throw error;
    }
  }

  /**
   * Add a new API key
   * @param apiKeyData - API key data
   * @returns Created API key
   */
  async addApiKey(apiKeyData: {
    userId: string;
    providerId: string;
    key: string;
    keyName: string;
  }): Promise<ApiKey> {
    try {
      // Encrypt the API key
      const encryptedKey = await encryptionService.encrypt(apiKeyData.key);

      const newApiKey = {
        user_id: apiKeyData.userId,
        provider_id: apiKeyData.providerId,
        encrypted_key: encryptedKey,
        key_name: apiKeyData.keyName,
        is_active: true
      };

      const { data, error } = await supabaseService.insert('ApiKeys', newApiKey);

      if (error) throw error;

      return data as ApiKey;
    } catch (error) {
      console.error('Error adding API key:', error);
      throw error;
    }
  }

  /**
   * Update an API key
   * @param keyId - API key ID
   * @param apiKeyData - API key data
   * @returns Updated API key
   */
  async updateApiKey(keyId: string, apiKeyData: Partial<ApiKey & { key?: string }>): Promise<ApiKey> {
    try {
      const updateData = { ...apiKeyData };

      // If the key is updated, encrypt it
      if (apiKeyData.key) {
        updateData.encrypted_key = await encryptionService.encrypt(apiKeyData.key);
        delete updateData.key;
      }

      const { data, error } = await supabaseService.update(
        'ApiKeys', 
        updateData, 
        { id: keyId }
      );

      if (error) throw error;

      return data as ApiKey;
    } catch (error) {
      console.error('Error updating API key:', error);
      throw error;
    }
  }

  /**
   * Delete an API key
   * @param keyId - API key ID
   * @returns Success status
   */
  async deleteApiKey(keyId: string): Promise<boolean> {
    try {
      const { error } = await supabaseService.delete('ApiKeys', { id: keyId });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  }

  /**
   * Check if an API key is valid
   * @param keyId - API key ID
   * @returns Validity status
   */
  async verifyApiKey(keyId: string): Promise<boolean> {
    try {
      const apiKey = await this.getApiKey(keyId);

      if (!apiKey || !apiKey.encrypted_key) {
        return false;
      }

      // Decrypt the API key
      const decryptedKey = await encryptionService.decrypt(apiKey.encrypted_key);

      // Make a request to a mock API endpoint to verify the key
      // In a real application, this would be an actual API endpoint validation
      const response = await fetch('/api/verify-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: apiKey.Providers?.name,
          key: decryptedKey
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error verifying API key:', error);
      return false;
    }
  }
}

export const apiKeyService = new ApiKeyService();
export default apiKeyService;
