<template>
  <div class="api-keys-management-view">
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-2">API Keys Management</h1>
      <p class="text-base-content/70">
        Manage your API keys for different AI providers. Your keys are securely encrypted and stored in our database.
      </p>
    </div>

    <!-- Provider selection for adding a new key -->
    <div class="card bg-base-100 shadow-sm border border-base-200 mb-6">
      <div class="card-body">
        <h2 class="card-title text-lg">Add New API Key</h2>

        <form @submit.prevent="handleAddApiKey" class="space-y-4">
          <div class="form-control">
            <label class="label" for="provider">
              <span class="label-text">Select Provider</span>
            </label>
            <select
              id="provider"
              v-model="newKey.providerId"
              class="select select-bordered w-full"
              required
            >
              <option value="" disabled>Select a provider</option>
              <option
                v-for="provider in providers"
                :key="provider.id"
                :value="provider.id"
              >
                {{ provider.name }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label" for="key-name">
              <span class="label-text">Key Name (optional)</span>
            </label>
            <input
              id="key-name"
              v-model="newKey.keyName"
              type="text"
              class="input input-bordered w-full"
              placeholder="e.g. Personal OpenAI Key"
            />
          </div>

          <div class="form-control">
            <label class="label" for="api-key">
              <span class="label-text">API Key</span>
            </label>
            <div class="input-group">
              <input
                id="api-key"
                v-model="newKey.key"
                :type="showKey ? 'text' : 'password'"
                class="input input-bordered w-full"
                placeholder="Enter your API key"
                required
              />
              <button
                type="button"
                class="btn btn-square"
                @click="showKey = !showKey"
              >
                <span v-if="showKey" class="i-lucide-eye-off h-5 w-5"></span>
                <span v-else class="i-lucide-eye h-5 w-5"></span>
              </button>
            </div>
          </div>

          <div class="divider"></div>

          <div class="flex justify-end">
            <button
              type="submit"
              class="btn btn-primary"
              :class="{ 'loading': isAddingKey }"
              :disabled="isAddingKey || !isValidForm"
            >
              <span v-if="isAddingKey" class="loading loading-spinner loading-sm mr-2"></span>
              Add API Key
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Subscription tier info -->
    <div class="alert mb-6" :class="tierAlert.color">
      <span :class="tierAlert.icon"></span>
      <div>
        <h3 class="font-bold">{{ tierAlert.title }}</h3>
        <div class="text-sm">{{ tierAlert.message }}</div>
      </div>
    </div>

    <!-- API keys list -->
    <div class="space-y-4">
      <h2 class="text-xl font-bold">Your API Keys</h2>

      <div v-if="isLoading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <div v-else-if="apiKeys.length === 0" class="alert">
        <span class="i-lucide-info h-5 w-5"></span>
        <span>You don't have any API keys yet. Add your first key above.</span>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2">
        <div
          v-for="apiKey in apiKeys"
          :key="apiKey.id"
          class="card bg-base-100 shadow-sm border border-base-200"
        >
          <div class="card-body">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div v-if="apiKey.Providers?.logo_url" class="avatar">
                  <div class="w-8 h-8 rounded-md">
                    <img :src="apiKey.Providers.logo_url" :alt="apiKey.Providers?.name" />
                  </div>
                </div>
                <div>
                  <h3 class="font-bold">{{ apiKey.key_name || 'Unnamed Key' }}</h3>
                  <p class="text-sm text-base-content/70">{{ apiKey.Providers?.name }}</p>
                </div>
              </div>

              <div class="flex space-x-1">
                <div class="badge" :class="apiKey.is_active ? 'badge-success' : 'badge-error'">
                  {{ apiKey.is_active ? 'Active' : 'Inactive' }}
                </div>
              </div>
            </div>

            <div class="text-sm space-y-1">
              <div class="flex justify-between">
                <span>Added:</span>
                <span>{{ formatDate(apiKey.created_at) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Last used:</span>
                <span>{{ apiKey.last_used ? formatDate(apiKey.last_used) : 'Never' }}</span>
              </div>
              <div v-if="apiKey.usage_stats?.total_tokens" class="flex justify-between">
                <span>Total usage:</span>
                <span>{{ apiKey.usage_stats.total_tokens.toLocaleString() }} tokens</span>
              </div>
              <div v-if="apiKey.usage_stats?.total_cost" class="flex justify-between">
                <span>Total cost:</span>
                <span>${{ apiKey.usage_stats.total_cost.toFixed(2) }}</span>
              </div>
            </div>

            <div class="card-actions justify-end mt-4">
              <button
                @click="toggleApiKeyStatus(apiKey)"
                class="btn btn-sm"
              >
                {{ apiKey.is_active ? 'Deactivate' : 'Activate' }}
              </button>

              <button
                @click="verifyApiKey(apiKey)"
                class="btn btn-sm btn-primary"
                :class="{ 'loading': isVerifying === apiKey.id }"
                :disabled="isVerifying === apiKey.id"
              >
                Verify
              </button>

              <button
                @click="deleteApiKey(apiKey)"
                class="btn btn-sm btn-error"
                :disabled="isDeleting === apiKey.id"
              >
                <span v-if="isDeleting === apiKey.id" class="loading loading-spinner loading-xs"></span>
                <span v-else class="i-lucide-trash-2 h-4 w-4"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error alert -->
    <div v-if="error" class="alert alert-error mt-6">
      <span class="i-lucide-alert-circle h-5 w-5"></span>
      <span>{{ error }}</span>
    </div>

    <!-- Confirm delete modal -->
    <div class="modal" :class="{ 'modal-open': showDeleteModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Confirm Deletion</h3>
        <p class="py-4">
          Are you sure you want to delete this API key? This action cannot be undone.
        </p>
        <div class="modal-action">
          <button @click="showDeleteModal = false" class="btn">Cancel</button>
          <button
            @click="confirmDelete"
            class="btn btn-error"
            :class="{ 'loading': isDeleting }"
            :disabled="isDeleting"
          >
            Delete
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showDeleteModal = false"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useProviderStore } from '@/store/providers';
import { apiKeyService } from '@/services/apiKey';
import type { ApiKey, Provider } from '@/types';

// Component state
const apiKeys = ref<ApiKey[]>([]);
const providers = ref<Provider[]>([]);
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);
const showKey = ref<boolean>(false);

// Form state
const newKey = ref({
  providerId: '',
  keyName: '',
  key: ''
});
const isAddingKey = ref<boolean>(false);

// Delete modal state
const showDeleteModal = ref<boolean>(false);
const keyToDelete = ref<ApiKey | null>(null);
const isDeleting = ref<string | null>(null);
const isVerifying = ref<string | null>(null);

// Get auth store for user info
const authStore = useAuthStore();
const providerStore = useProviderStore();

// Computed properties
const isValidForm = computed<boolean>(() => {
  return !!newKey.value.providerId && !!newKey.value.key;
});

const tierAlert = computed(() => {
  const tier = authStore.userSubscription?.tier || 'free';
  let tierInfo = {
    title: '',
    message: '',
    color: '',
    icon: ''
  };

  switch(tier) {
    case 'premium':
      tierInfo = {
        title: 'Premium Tier',
        message: 'You can add unlimited API keys to your account.',
        color: 'alert-success',
        icon: 'i-lucide-crown h-5 w-5'
      };
      break;
    case 'plus':
      tierInfo = {
        title: 'Plus Tier',
        message: 'You can add up to 3 API keys to your account.',
        color: 'alert-info',
        icon: 'i-lucide-star h-5 w-5'
      };
      break;
    default: // free
      tierInfo = {
        title: 'Free Tier',
        message: 'You can add 1 API key to your account. Upgrade for more.',
        color: 'alert-warning',
        icon: 'i-lucide-alert-triangle h-5 w-5'
      };
  }

  return tierInfo;
});

// Methods
const fetchApiKeys = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    if (!authStore.user?.id) {
      throw new Error('User not authenticated');
    }

    const keys = await apiKeyService.getUserApiKeys(authStore.user.id);
    apiKeys.value = keys;
  } catch (err: any) {
    console.error('Error fetching API keys:', err);
    error.value = err.message || 'Failed to fetch API keys';
  } finally {
    isLoading.value = false;
  }
};

const fetchProviders = async () => {
  try {
    await providerStore.fetchProviders();
    providers.value = providerStore.providers;
  } catch (err: any) {
    console.error('Error fetching providers:', err);
    error.value = err.message || 'Failed to fetch providers';
  }
};

const handleAddApiKey = async () => {
  isAddingKey.value = true;
  error.value = null;

  try {
    if (!authStore.user?.id) {
      throw new Error('User not authenticated');
    }

    await apiKeyService.addApiKey({
      userId: authStore.user.id,
      providerId: newKey.value.providerId,
      key: newKey.value.key,
      keyName: newKey.value.keyName || `${getProviderName(newKey.value.providerId)} Key`
    });

    // Reset form
    newKey.value = {
      providerId: '',
      keyName: '',
      key: ''
    };

    // Refresh API keys
    await fetchApiKeys();
  } catch (err: any) {
    console.error('Error adding API key:', err);
    error.value = err.message || 'Failed to add API key';
  } finally {
    isAddingKey.value = false;
  }
};

const toggleApiKeyStatus = async (apiKey: ApiKey) => {
  try {
    await apiKeyService.updateApiKey(apiKey.id, {
      is_active: !apiKey.is_active
    });

    // Update local state
    const index = apiKeys.value.findIndex(key => key.id === apiKey.id);
    if (index !== -1) {
      apiKeys.value[index].is_active = !apiKey.is_active;
    }
  } catch (err: any) {
    console.error('Error toggling API key status:', err);
    error.value = err.message || 'Failed to update API key';
  }
};

const verifyApiKey = async (apiKey: ApiKey) => {
  isVerifying.value = apiKey.id;
  error.value = null;

  try {
    const isValid = await apiKeyService.verifyApiKey(apiKey.id);

    if (isValid) {
      alert('API key is valid!');
    } else {
      alert('API key is invalid. Please check and update the key.');
    }
  } catch (err: any) {
    console.error('Error verifying API key:', err);
    error.value = err.message || 'Failed to verify API key';
  } finally {
    isVerifying.value = null;
  }
};

const deleteApiKey = (apiKey: ApiKey) => {
  keyToDelete.value = apiKey;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!keyToDelete.value) return;

  isDeleting.value = keyToDelete.value.id;
  error.value = null;

  try {
    await apiKeyService.deleteApiKey(keyToDelete.value.id);

    // Remove from local state
    apiKeys.value = apiKeys.value.filter(key => key.id !== keyToDelete.value?.id);

    // Close the modal
    showDeleteModal.value = false;
    keyToDelete.value = null;
  } catch (err: any) {
    console.error('Error deleting API key:', err);
    error.value = err.message || 'Failed to delete API key';
  } finally {
    isDeleting.value = null;
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getProviderName = (providerId: string): string => {
  const provider = providers.value.find(p => p.id === providerId);
  return provider?.name || 'Provider';
};

// Lifecycle hooks
onMounted(async () => {
  await fetchProviders();
  await fetchApiKeys();
});

// Watch for auth changes
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      fetchApiKeys();
    } else {
      apiKeys.value = [];
    }
  }
);
</script>

<style scoped>
.api-keys-management-view {
  max-width: 1200px;
  margin: 0 auto;
}
</style>