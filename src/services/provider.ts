/**
 * Provider Service
 * Manages AI providers and their models
 */
import supabaseService from './supabase';
import type { Provider } from '@/types';

class ProviderService {
  /**
   * Get all available providers
   * @returns List of providers
   */
  async getAllProviders(): Promise<Provider[]> {
    try {
      const { data, error } = await supabaseService.select(
        'Providers', 
        '*',
        { is_active: true }
      );

      if (error) throw error;

      return data as Provider[] || [];
    } catch (error) {
      console.error('Error getting providers:', error);
      throw error;
    }
  }

  /**
   * Get a provider by ID
   * @param providerId - Provider ID
   * @returns Provider data
   */
  async getProvider(providerId: string): Promise<Provider> {
    try {
      const { data, error } = await supabaseService.getById(
        'Providers',
        providerId
      );

      if (error) throw error;

      return data as Provider;
    } catch (error) {
      console.error('Error getting provider:', error);
      throw error;
    }
  }

  /**
   * Get available models for a provider
   * @param providerId - Provider ID
   * @returns List of models
   */
  async getProviderModels(providerId: string): Promise<any[]> {
    try {
      const provider = await this.getProvider(providerId);

      return provider?.available_models || [];
    } catch (error) {
      console.error('Error getting provider models:', error);
      throw error;
    }
  }

  /**
   * Get default settings for a provider
   * @param providerId - Provider ID
   * @returns Default settings
   */
  async getProviderDefaultSettings(providerId: string): Promise<Record<string, any>> {
    try {
      const provider = await this.getProvider(providerId);

      return provider?.default_settings || {};
    } catch (error) {
      console.error('Error getting provider default settings:', error);
      throw error;
    }
  }
}

export const providerService = new ProviderService();
export default providerService;
