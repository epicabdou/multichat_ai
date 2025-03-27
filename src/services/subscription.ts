/**
 * Subscription Service
 * Manages user subscriptions and tier-based features
 */
import supabaseService from './supabase';
import type { Subscription } from '@/types';

interface TierLimits {
  apiKeys: number;
  chatSessions: number;
  messagesPerSession: number;
  savedPrompts: number;
}

type SubscriptionTier = 'free' | 'plus' | 'premium';

class SubscriptionService {
  /**
   * Get the current subscription for a user
   * @param userId - User ID
   * @returns Active subscription
   */
  async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabaseService.select(
        'Subscriptions', 
        '*', 
        { 
          user_id: userId,
          is_active: true
        }
      );

      if (error) throw error;

      // Return the most recent active subscription
      if (data && data.length > 0) {
        const sortedData = data.sort((a: any, b: any) => 
          new Date(b.end_date || '9999-12-31').getTime() - 
          new Date(a.end_date || '9999-12-31').getTime()
        );
        return sortedData[0] as Subscription;
      }

      return null;
    } catch (error) {
      console.error('Error getting current subscription:', error);
      throw error;
    }
  }

  /**
   * Check if a user has access to a feature based on their subscription tier
   * @param userId - User ID
   * @param requiredTier - Minimum required tier (free, plus, premium)
   * @returns Whether the user has access
   */
  async checkTierAccess(userId: string, requiredTier: SubscriptionTier): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription(userId);

      if (!subscription) {
        return requiredTier === 'free';
      }

      const tierValues: Record<SubscriptionTier, number> = {
        'free': 0,
        'plus': 1,
        'premium': 2
      };

      return tierValues[subscription.tier] >= tierValues[requiredTier];
    } catch (error) {
      console.error('Error checking tier access:', error);
      return false;
    }
  }

  /**
   * Get subscription tier limits
   * @param tier - Subscription tier
   * @returns Tier limits
   */
  getTierLimits(tier: SubscriptionTier): TierLimits {
    const limits: Record<SubscriptionTier, TierLimits> = {
      'free': {
        apiKeys: 1,
        chatSessions: 5,
        messagesPerSession: 50,
        savedPrompts: 0
      },
      'plus': {
        apiKeys: 3,
        chatSessions: 20,
        messagesPerSession: 200,
        savedPrompts: 10
      },
      'premium': {
        apiKeys: 10,
        chatSessions: 100,
        messagesPerSession: 1000,
        savedPrompts: 50
      }
    };

    return limits[tier] || limits['free'];
  }

  /**
   * Update a subscription
   * @param subscriptionId - Subscription ID
   * @param data - Updated subscription data
   * @returns Updated subscription
   */
  async updateSubscription(subscriptionId: string, data: Partial<Subscription>): Promise<Subscription> {
    try {
      const { data: updatedData, error } = await supabaseService.update(
        'Subscriptions',
        data,
        { id: subscriptionId }
      );

      if (error) throw error;

      return updatedData as Subscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Create a new subscription
   * @param subscriptionData - Subscription data
   * @returns Created subscription
   */
  async createSubscription(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    try {
      // Deactivate any current active subscriptions
      const { error: updateError } = await supabaseService.update(
        'Subscriptions',
        { is_active: false },
        { 
          user_id: subscriptionData.user_id,
          is_active: true
        }
      );

      if (updateError) throw updateError;

      // Create the new subscription
      const { data, error } = await supabaseService.insert(
        'Subscriptions',
        {
          ...subscriptionData,
          is_active: true,
          start_date: new Date().toISOString()
        }
      );

      if (error) throw error;

      return data as Subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
