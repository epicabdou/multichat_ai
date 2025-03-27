/**
 * Usage Service
 * Tracks API usage and costs
 */
import supabaseService from './supabase';
import type { UsageTracking } from '@/types';

interface UsageStatistics {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  byProvider: Record<string, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

interface PaginationParams {
  page: number;
  limit: number;
}

class UsageService {
  /**
   * Track usage for an API request
   * @param usageData - Usage data to track
   * @returns Tracking result
   */
  async trackUsage(usageData: Partial<UsageTracking>): Promise<UsageTracking | null> {
    try {
      const { data, error } = await supabaseService.insert(
        'UsageTracking',
        {
          ...usageData,
          created_at: new Date().toISOString()
        },
        false
      );

      if (error) throw error;

      return data as UsageTracking;
    } catch (error) {
      console.error('Error tracking usage:', error);
      // Don't throw the error, just log it
      // This is to prevent API calls from failing if usage tracking fails
      return null;
    }
  }

  /**
   * Get usage statistics for a user
   * @param userId - User ID
   * @param filters - Additional filters (timeframe, etc.)
   * @returns Usage statistics
   */
  async getUserUsageStats(userId: string, filters: Record<string, any> = {}): Promise<UsageStatistics> {
    try {
      // Get all usage records for the user
      const { data, error } = await supabaseService.select(
        'UsageTracking',
        '*',
        { user_id: userId, ...filters }
      );

      if (error) throw error;

      // Calculate statistics
      const stats: UsageStatistics = {
        totalRequests: data.length,
        totalTokens: data.reduce((sum, record) => sum + (record.tokens_used || 0), 0),
        totalCost: data.reduce((sum, record) => sum + (record.cost || 0), 0),
        byProvider: {}
      };

      // Group by provider
      if (data.length > 0) {
        // Get all api keys
        const { data: apiKeys, error: apiKeyError } = await supabaseService.select(
          'ApiKeys',
          'id, provider_id, Providers(name)',
          { user_id: userId }
        );

        if (apiKeyError) throw apiKeyError;

        // Create a map of api key id to provider name
        const apiKeyToProvider: Record<string, string> = {};
        apiKeys.forEach((key: any) => {
          apiKeyToProvider[key.id] = key.Providers?.name || 'Unknown';
        });

        // Group usage by provider
        data.forEach((record: any) => {
          const providerName = apiKeyToProvider[record.api_key_id] || 'Unknown';

          if (!stats.byProvider[providerName]) {
            stats.byProvider[providerName] = {
              requests: 0,
              tokens: 0,
              cost: 0
            };
          }

          stats.byProvider[providerName].requests++;
          stats.byProvider[providerName].tokens += record.tokens_used || 0;
          stats.byProvider[providerName].cost += record.cost || 0;
        });
      }

      return stats;
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw error;
    }
  }

  /**
   * Get detailed usage logs for a user
   * @param userId - User ID
   * @param pagination - Pagination parameters
   * @returns Usage logs
   */
  async getUserUsageLogs(userId: string, pagination: PaginationParams = { page: 0, limit: 20 }): Promise<UsageTracking[]> {
    try {
      const { data, error } = await supabaseService.select(
        'UsageTracking',
        '*, ApiKeys(key_name, Providers(name)), ChatSessions(title), Messages(content)',
        { user_id: userId }
      );

      if (error) throw error;

      // Sort by created_at descending
      const sorted = data.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Apply pagination
      const start = pagination.page * pagination.limit;
      const end = start + pagination.limit;

      return sorted.slice(start, end) as UsageTracking[];
    } catch (error) {
      console.error('Error getting usage logs:', error);
      throw error;
    }
  }
}

export const usageService = new UsageService();
export default usageService;
