<template>
  <div class="chat-layout">
    <!-- Top navigation bar -->
    <header class="chat-layout-header bg-base-100 shadow-sm border-b border-base-200">
      <div class="container mx-auto flex justify-between items-center px-4 py-2">
        <!-- Logo and app name -->
        <div class="flex items-center space-x-2">
          <router-link to="/" class="flex items-center">
            <img src="@/assets/logo.svg" alt="Goblix AI" class="h-8 w-8" />
            <span class="text-xl font-bold ml-2 hidden sm:inline">Goblix AI</span>
          </router-link>
        </div>

        <!-- Chat title and controls -->
        <div class="flex items-center">
          <h1 v-if="currentChatSession" class="text-lg font-medium truncate max-w-[150px] sm:max-w-[300px]">
            {{ currentChatSession.title || 'New Chat' }}
          </h1>
          <div v-else class="h-6 w-40 bg-base-300 animate-pulse rounded"></div>

          <div class="ml-2">
            <button @click="showChatOptions = !showChatOptions" class="btn btn-sm btn-ghost">
              <span class="i-lucide-more-vertical h-5 w-5"></span>
            </button>

            <div v-if="showChatOptions" class="absolute right-4 mt-2 w-56 bg-base-100 shadow-lg rounded-md z-10">
              <div class="p-1">
                <button @click="editChatTitle" class="flex w-full items-center px-3 py-2 text-sm rounded-md hover:bg-base-200">
                  <span class="i-lucide-edit-3 h-4 w-4 mr-2"></span> Edit Title
                </button>
                <button @click="clearChatHistory" class="flex w-full items-center px-3 py-2 text-sm rounded-md hover:bg-base-200">
                  <span class="i-lucide-trash h-4 w-4 mr-2"></span> Clear Chat
                </button>
                <button @click="exportChat" class="flex w-full items-center px-3 py-2 text-sm rounded-md hover:bg-base-200">
                  <span class="i-lucide-download h-4 w-4 mr-2"></span> Export Chat
                </button>
                <div class="border-t border-base-200 my-1"></div>
                <button @click="goToChatList" class="flex w-full items-center px-3 py-2 text-sm rounded-md hover:bg-base-200">
                  <span class="i-lucide-list h-4 w-4 mr-2"></span> All Chats
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- User profile and shortcuts -->
        <div class="flex items-center space-x-2">
          <!-- Provider selector -->
          <div class="dropdown dropdown-end hidden md:block">
            <button class="btn btn-sm btn-ghost">
              <img v-if="currentProvider?.logo_url" :src="currentProvider.logo_url" alt="Provider logo" class="h-5 w-5 mr-1" />
              <span class="mr-1">{{ currentProvider?.name || 'Select Provider' }}</span>
              <span class="i-lucide-chevron-down h-4 w-4"></span>
            </button>
            <div class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <div v-for="provider in availableProviders" :key="provider.id"
                   class="flex items-center p-2 hover:bg-base-200 rounded cursor-pointer"
                   @click="switchProvider(provider)">
                <img v-if="provider.logo_url" :src="provider.logo_url" alt="Provider logo" class="h-5 w-5 mr-2" />
                <span>{{ provider.name }}</span>
              </div>
            </div>
          </div>

          <!-- Settings button -->
          <button @click="showSettings = !showSettings" class="btn btn-sm btn-ghost">
            <span class="i-lucide-settings h-5 w-5"></span>
          </button>

          <!-- User avatar -->
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-circle avatar">
              <div class="w-8 rounded-full">
                <img :src="userProfilePic || 'https://ui-avatars.com/api/?name=' + userName" alt="User profile" />
              </div>
            </label>
            <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li><router-link to="/profile">Profile</router-link></li>
              <li><router-link to="/api-keys">API Keys</router-link></li>
              <li><a @click="logout">Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <div class="chat-layout-body flex h-[calc(100vh-64px)]">
      <!-- Sidebar - Chat history -->
      <aside :class="['chat-sidebar bg-base-200 border-r border-base-300 overflow-y-auto transition-all',
                  sidebarOpen ? 'w-72' : 'w-0 md:w-20']">
        <div class="p-4 flex justify-between items-center">
          <h2 :class="['font-medium truncate transition-opacity', sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden']">
            Chat History
          </h2>
          <button @click="toggleSidebar" class="btn btn-sm btn-ghost">
            <span :class="[sidebarOpen ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open', 'h-5 w-5']"></span>
          </button>
        </div>

        <div class="px-2">
          <router-link to="/chat/new" class="btn btn-primary btn-sm w-full mb-4">
            <span class="i-lucide-plus h-4 w-4 mr-2"></span>
            <span :class="[sidebarOpen ? 'block' : 'hidden md:hidden']">New Chat</span>
          </router-link>
        </div>

        <!-- Chat list -->
        <div class="chat-history-list space-y-1 px-2 pb-4">
          <router-link v-for="chat in chatSessions" :key="chat.id"
                      :to="`/chat/${chat.id}`"
                      :class="[
                        'flex items-center p-2 rounded-md',
                        currentChatId === chat.id ? 'bg-primary/10 text-primary' : 'hover:bg-base-300'
                      ]">
            <span class="i-lucide-message-circle h-5 w-5 flex-shrink-0"></span>
            <span v-if="sidebarOpen" class="ml-3 text-sm truncate">{{ chat.title || 'Untitled Chat' }}</span>
          </router-link>
        </div>
      </aside>

      <!-- Main chat area -->
      <main class="chat-main flex-1 flex flex-col bg-base-100 relative">
        <!-- Settings panel (overlay when active) -->
        <div v-if="showSettings" class="absolute inset-0 bg-base-100 z-10 overflow-auto">
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">Chat Settings</h2>
              <button @click="showSettings = false" class="btn btn-sm btn-ghost">
                <span class="i-lucide-x h-5 w-5"></span>
              </button>
            </div>

            <div class="space-y-4">
              <!-- Provider settings -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">AI Provider</span>
                </label>
                <select v-model="selectedModel" class="select select-bordered w-full">
                  <option v-for="model in availableModels" :key="model.id" :value="model.id">
                    {{ model.name }}
                  </option>
                </select>
              </div>

              <!-- Advanced settings -->
              <div class="space-y-3">
                <h3 class="font-medium">Generation Settings</h3>

                <!-- Temperature -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Temperature</span>
                    <span class="label-text-alt">{{ settings.temperature }}</span>
                  </label>
                  <input type="range" v-model="settings.temperature" min="0" max="1" step="0.1" class="range range-sm" />
                  <div class="flex justify-between text-xs px-1">
                    <span>More Focused</span>
                    <span>More Creative</span>
                  </div>
                </div>

                <!-- Max length -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Max Response Length</span>
                    <span class="label-text-alt">{{ settings.maxTokens }} tokens</span>
                  </label>
                  <input type="range" v-model="settings.maxTokens" :min="256" :max="4096" step="256" class="range range-sm" />
                </div>

                <!-- Top P -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Top P</span>
                    <span class="label-text-alt">{{ settings.topP }}</span>
                  </label>
                  <input type="range" v-model="settings.topP" min="0" max="1" step="0.05" class="range range-sm" />
                </div>
              </div>

              <!-- Save settings button -->
              <div class="flex justify-end">
                <button @click="saveSettings" class="btn btn-primary">Save Settings</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Router view for chat content -->
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
import { useProviderStore } from '@/store/providers';
import type { ChatSession, Provider } from '@/types';

// Router and stores
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();
const providerStore = useProviderStore();

// Reactive state
const sidebarOpen = ref<boolean>(true);
const showChatOptions = ref<boolean>(false);
const showSettings = ref<boolean>(false);
const selectedProvider = ref<string>('');
const selectedModel = ref<string>('');
const settings = ref({
  temperature: 0.7,
  maxTokens: 1024,
  topP: 0.9
});

// Computed values
const userName = computed<string>(() => {
  return authStore.user?.display_name || authStore.user?.email?.split('@')[0] || 'User';
});

const userProfilePic = computed<string | undefined>(() => {
  return authStore.user?.profile_picture_url;
});

const chatSessions = computed(() => {
  return chatStore.sortedChatSessions;
});

const currentChatSession = computed<ChatSession | null>(() => {
  return chatStore.currentChatSession;
});

const currentChatId = computed<string | null>(() => {
  return route.params.id as string || null;
});

const availableProviders = computed(() => {
  return providerStore.providers;
});

const currentProvider = computed<Provider | null>(() => {
  if (!currentChatSession.value?.provider_id) return null;
  return providerStore.providers.find(p => p.id === currentChatSession.value?.provider_id) || null;
});

const availableModels = computed(() => {
  if (!selectedProvider.value) return [];
  const provider = providerStore.providers.find(p => p.id === selectedProvider.value);
  return provider?.available_models || [];
});

// Methods
const toggleSidebar = (): void => {
  sidebarOpen.value = !sidebarOpen.value;
};

const goToChatList = (): void => {
  router.push('/chats');
  showChatOptions.value = false;
};

const editChatTitle = async (): Promise<void> => {
  if (!currentChatSession.value) return;

  const newTitle = prompt('Enter new chat title:', currentChatSession.value.title);
  if (newTitle !== null) {
    await chatStore.updateChatSession(currentChatSession.value.id, { title: newTitle });
  }

  showChatOptions.value = false;
};

const clearChatHistory = async (): Promise<void> => {
  if (!currentChatSession.value) return;

  const confirm = window.confirm('Are you sure you want to clear all messages in this chat?');
  if (confirm) {
    // In a real app, this would call an API to delete messages but keep the chat session
    // For now, we'll just clear the messages array
    chatStore.messages = [];
  }

  showChatOptions.value = false;
};

const exportChat = (): void => {
  if (!currentChatSession.value) return;

  // Create a text representation of the chat
  const chatTitle = currentChatSession.value.title || 'Untitled Chat';
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${chatTitle.replace(/\s+/g, '_')}_${timestamp}.txt`;

  let content = `# ${chatTitle}\n`;
  content += `Exported on: ${new Date().toLocaleString()}\n\n`;

  chatStore.messages.forEach(msg => {
    content += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
  });

  // Create and download file
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  showChatOptions.value = false;
};

const switchProvider = (provider: Provider): void => {
  if (!currentChatSession.value) return;

  selectedProvider.value = provider.id;
  // In a real app, would switch the provider for the current chat
};

const saveSettings = async (): Promise<void> => {
  if (!currentChatSession.value) return;

  await chatStore.updateChatSession(currentChatSession.value.id, {
    provider_id: selectedProvider.value,
    model_id: selectedModel.value,
    settings: settings.value
  });

  showSettings.value = false;
};

const logout = async (): Promise<void> => {
  await authStore.logout();
  router.push('/login');
};

// Initialize and watchers
onMounted(async () => {
  // Load chat sessions if not already loaded
  if (chatStore.chatSessions.length === 0) {
    await chatStore.fetchChatSessions();
  }

  // Load providers if not already loaded
  if (providerStore.providers.length === 0) {
    await providerStore.fetchProviders();
  }

  // Load current chat
  if (currentChatId.value) {
    await chatStore.fetchChatSession(currentChatId.value);

    // Set initial settings from current chat
    if (currentChatSession.value) {
      selectedProvider.value = currentChatSession.value.provider_id;
      selectedModel.value = currentChatSession.value.model_id || '';

      if (currentChatSession.value.settings) {
        settings.value = {
          ...settings.value,
          ...currentChatSession.value.settings
        };
      }
    }
  }

  // Adjust sidebar for mobile
  if (window.innerWidth < 768) {
    sidebarOpen.value = false;
  }
});

// Watch for route changes to load the correct chat
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await chatStore.fetchChatSession(newId as string);
    }
  }
);
</script>

<style scoped>
.chat-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-layout-body {
  flex: 1;
  overflow: hidden;
}

/* Mobile sidebar animation */
@media (max-width: 768px) {
  .chat-sidebar {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 20;
  }
}
</style>