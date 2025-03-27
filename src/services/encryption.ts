/**
 * Encryption Service
 * Handles encryption and decryption of sensitive data using Supabase Edge Functions
 */
import { supabase } from '@/lib/supabase';

class EncryptionService {
  /**
   * Encrypt a string using the Edge Function
   * @param text - Text to encrypt
   * @returns Encrypted text
   */
  async encrypt(text: string): Promise<string> {
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication required for encryption');
      }

      // Call the Edge Function with the session token for authentication
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/encrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          operation: 'encrypt',
          text
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Encryption failed: ${errorData.error || response.statusText}`);
      }

      const { result } = await response.json();
      return result;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt a string using the Edge Function
   * @param encryptedText - Text to decrypt
   * @returns Decrypted text
   */
  async decrypt(encryptedText: string): Promise<string> {
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication required for decryption');
      }

      // Call the Edge Function with the session token for authentication
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/encrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          operation: 'decrypt',
          text: encryptedText
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Decryption failed: ${errorData.error || response.statusText}`);
      }

      const { result } = await response.json();
      return result;
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Verify if an API key is properly formatted
   * @param text - API key to verify
   * @returns True if the API key format is valid
   */
  verifyKeyFormat(text: string): boolean {
    // Implement format verification for common API key patterns
    // For example, OpenAI API keys start with "sk-" and have a specific length
    // Claude API keys have their own format
    // This is a simple example, consider expanding for each provider type

    if (!text || text.length < 8) {
      return false;
    }

    // Check OpenAI format (starts with "sk-")
    if (text.startsWith('sk-') && text.length > 20) {
      return true;
    }

    // Check Claude format (for example, a certain length with alphanumeric characters)
    if (/^[a-zA-Z0-9]{32,}$/.test(text)) {
      return true;
    }

    // Add checks for other providers as needed

    // Default case - non-empty string passes basic validation
    return true;
  }
}

export const encryptionService = new EncryptionService();
export default encryptionService;