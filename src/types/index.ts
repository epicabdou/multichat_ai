// User interfaces
export interface User {
  id: string;
  email: string;
  profile_picture_url?: string;
  display_name?: string;
  settings?: Record<string, any>;
  is_active: boolean;
  last_login?: string;
  role?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'plus' | 'premium';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  payment_status?: string;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  name: string;
  logo_url?: string;
  is_active: boolean;
  available_models: Record<string, any>;
  default_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  provider_id: string;
  encrypted_key: string;
  key_name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  usage_stats?: Record<string, any>;
  last_used?: string;
  Providers?: Provider;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  provider_id: string;
  model_id?: string;
  settings?: Record<string, any>;
  is_archived: boolean;
  Providers?: Provider;
}

export interface Message {
  id: string;
  chat_session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  parent_message_id?: string;
  sequence_number: number;
  metadata?: Record<string, any>;
  tokens_info?: Record<string, any>;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  api_key_id: string;
  chat_session_id: string;
  message_id?: string;
  tokens_used: number;
  created_at: string;
  cost: number;
  request_type: string;
}

export interface SavedPrompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
}

// Store state interfaces
export interface AuthState {
  user: User | null;
  userSubscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  chatSessions: ChatSession[];
  currentChatSession: ChatSession | null;
  messages: Message[];
  isLoading: boolean;
  isMessageLoading: boolean;
  error: string | null;
}

export interface ApiKeyState {
  apiKeys: ApiKey[];
  currentApiKey: ApiKey | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProviderState {
  providers: Provider[];
  currentProvider: Provider | null;
  isLoading: boolean;
  error: string | null;
}

export interface SubscriptionState {
  subscriptions: Subscription[];
  currentSubscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
}

export interface SavedPromptState {
  savedPrompts: SavedPrompt[];
  currentSavedPrompt: SavedPrompt | null;
  isLoading: boolean;
  error: string | null;
}

export interface UsageState {
  usageRecords: UsageTracking[];
  usageStats: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}
