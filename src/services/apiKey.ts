/**
 * API Key Service
 * Manages API keys for different providers with enhanced security
 */
import supabaseService from './supabase';
import encryptionService from './encryption';
import type { ApiKey, Provider } from '@/types';

interface ApiKeyWithDetails extends ApiKey {
  provider?: Provider;
}

class ApiKeyService {
  /**
   * Get all API keys for a user
   * @param userId - User ID
   * @returns List of API keys
   */
  async getUserApiKeys(userId: string): Promise<ApiKeyWithDetails[]> {
    try {
      const { data, error } = await supabaseService.select(
        'ApiKeys',
        '*, Providers(id, name, logo_url)',
        { user_id: userId }
      );

      if (error) throw error;

      return (data || []) as ApiKeyWithDetails[];
    } catch (error) {
      console.error('Error getting user API keys:', error);
      throw error;
    }
  }

  /**
   * Get an API key by ID
   * @param keyId - API key ID
   * @returns API key
   */
  async getApiKey(keyId: string): Promise<ApiKeyWithDetails> {
    try {
      const { data, error } = await supabaseService.getById(
        'ApiKeys',
        keyId,
        '*, Providers(id, name, logo_url)'
      );

      if (error) throw error;

      return data as ApiKeyWithDetails;
    } catch (error) {
      console.error('Error getting API key:', error);
      throw error;
    }
  }

  /**
   * Add a new API key with enhanced encryption
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
      // Verify the API key format
      if (!encryptionService.verifyKeyFormat(apiKeyData.key)) {
        throw new Error('Invalid API key format');
      }

      // Encrypt the API key using the Edge Function
      const encryptedKey = await encryptionService.encrypt(apiKeyData.key);

      const newApiKey = {
        user_id: apiKeyData.userId,
        provider_id: apiKeyData.providerId,
        encrypted_key: encryptedKey,
        key_name: apiKeyData.keyName || `${new Date().toISOString()} Key`,
        is_active: true,
        usage_stats: JSON.stringify({}),
        last_used: null
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
      const updateData: Record<string, any> = { ...apiKeyData };
      delete updateData.key; // Remove the raw key from the update data

      // If the key is updated, encrypt it
      if (apiKeyData.key) {
        // Verify the API key format
        if (!encryptionService.verifyKeyFormat(apiKeyData.key)) {
          throw new Error('Invalid API key format');
        }

        updateData.encrypted_key = await encryptionService.encrypt(apiKeyData.key);
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
   * Verify an API key with the provider
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

      // Use the Edge Function to verify the key with the provider
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Get auth token from current session
          'Authorization': `Bearer ${(await supabaseService.supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          provider: apiKey.provider?.name,
          key: decryptedKey
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error verifying API key:', error);
      return false;
    }
  }

  /**
   * Get a decrypted API key for use with provider APIs
   * This should ONLY be used within other edge functions
   * @param keyId - API key ID
   * @returns Decrypted API key
   */
  async getDecryptedKey(keyId: string): Promise<string> {
    try {
      const apiKey = await this.getApiKey(keyId);

      if (!apiKey || !apiKey.encrypted_key) {
        throw new Error('API key not found');
      }

      // Decrypt the API key
      return await encryptionService.decrypt(apiKey.encrypted_key);
    } catch (error) {
      console.error('Error getting decrypted API key:', error);
      throw error;
    }
  }

  /**
   * Update the usage statistics for an API key
   * @param keyId - API key ID
   * @param newStats - New usage statistics
   * @returns Updated API key
   */
  async updateUsageStats(keyId: string, newStats: Record<string, any>): Promise<ApiKey> {
    try {
      const apiKey = await this.getApiKey(keyId);

      // Merge existing stats with new stats
      const currentStats = apiKey.usage_stats || {};
      const mergedStats = { ...currentStats, ...newStats };

      // Update the API key
      return await this.updateApiKey(keyId, {
        usage_stats: mergedStats,
        last_used: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating API key usage stats:', error);
      throw error;
    }
  }
}

export const apiKeyService = new ApiKeyService();
export default apiKeyService;