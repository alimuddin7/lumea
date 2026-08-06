<script lang="ts">
  import { onMount } from "svelte";
  import { Bot, Key, Link as LinkIcon, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-svelte";
  import Dialog from "./Dialog.svelte";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  import Badge from "./Badge.svelte";
  import { aiStore, DEFAULT_AI_MODELS, testAIConnection, type AIConfig } from "$lib/stores/aiStore";

  interface Props {
    open?: boolean;
    onClose?: () => void;
  }

  let { open = $bindable(false), onClose }: Props = $props();

  let provider = $state<AIConfig["provider"]>($aiStore.provider || "openai");
  let apiKey = $state($aiStore.apiKey || "");
  let endpointUrl = $state($aiStore.endpointUrl || "https://api.openai.com/v1");
  let selectedModel = $state($aiStore.selectedModel || "gpt-4o-mini");
  let customModelName = $state("");

  let testing = $state(false);
  let testResult = $state<{ success: boolean; message: string } | null>(null);
  let showApiKey = $state(false);

  const defaultEndpoints = {
    openai: "https://api.openai.com/v1",
    gemini: "https://generativelanguage.googleapis.com/v1beta",
    anthropic: "https://api.anthropic.com/v1",
    custom: "https://api.deepseek.com/v1"
  };

  onMount(() => {
    aiStore.init();
  });

  $effect(() => {
    if ($aiStore) {
      provider = $aiStore.provider || "openai";
      apiKey = $aiStore.apiKey || "";
      endpointUrl = $aiStore.endpointUrl || defaultEndpoints[provider];
      selectedModel = $aiStore.selectedModel || "gpt-4o-mini";
    }
  });

  function handleProviderChange(newProvider: AIConfig["provider"]) {
    provider = newProvider;
    endpointUrl = defaultEndpoints[newProvider];
    const available = DEFAULT_AI_MODELS.filter(m => m.provider === newProvider);
    if (available.length > 0) {
      selectedModel = available[0].id;
    } else {
      selectedModel = "custom-model";
    }
  }

  async function handleTestConnection() {
    testing = true;
    testResult = null;
    const res = await testAIConnection({
      provider,
      apiKey,
      endpointUrl,
      selectedModel
    });
    testResult = res;
    testing = false;
  }

  function handleSave() {
    const finalModel = selectedModel === "custom-model" ? customModelName : selectedModel;
    aiStore.save({
      provider,
      apiKey: apiKey.trim(),
      endpointUrl: endpointUrl.trim(),
      selectedModel: finalModel
    });
    open = false;
    onClose?.();
  }

  const currentModels = $derived(DEFAULT_AI_MODELS.filter(m => m.provider === provider));
</script>

<Dialog
  bind:open
  title="Setup Integrasi AI Manager"
  description="Konfigurasikan API Key, Link Endpoint Provider, dan Pilih Model AI untuk mengotomatisasi pembuatan rute & optimasi APISIX."
  {onClose}
>
  <div class="space-y-4 py-2 text-xs font-sans">
    <!-- Provider Selection Tabs -->
    <div class="space-y-1.5">
      <span class="text-xs font-bold text-foreground block">AI Provider</span>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onclick={() => handleProviderChange("openai")}
          class="flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all {provider === 'openai' ? 'border-rose-600 bg-rose-600/10 text-rose-600 shadow-xs' : 'border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground'}"
        >
          <span>OpenAI</span>
        </button>

        <button
          type="button"
          onclick={() => handleProviderChange("gemini")}
          class="flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all {provider === 'gemini' ? 'border-rose-600 bg-rose-600/10 text-rose-600 shadow-xs' : 'border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground'}"
        >
          <span>Google Gemini</span>
        </button>

        <button
          type="button"
          onclick={() => handleProviderChange("anthropic")}
          class="flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all {provider === 'anthropic' ? 'border-rose-600 bg-rose-600/10 text-rose-600 shadow-xs' : 'border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground'}"
        >
          <span>Anthropic</span>
        </button>

        <button
          type="button"
          onclick={() => handleProviderChange("custom")}
          class="flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all {provider === 'custom' ? 'border-rose-600 bg-rose-600/10 text-rose-600 shadow-xs' : 'border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground'}"
        >
          <span>DeepSeek / Custom</span>
        </button>
      </div>
    </div>

    <!-- API Key Input -->
    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <label for="aiApiKey" class="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Key class="w-3.5 h-3.5 text-rose-600" />
          <span>API Key</span>
        </label>
        <button
          type="button"
          onclick={() => showApiKey = !showApiKey}
          class="text-[11px] text-muted-foreground hover:text-foreground underline font-medium"
        >
          {showApiKey ? "Sembunyikan" : "Tampilkan"}
        </button>
      </div>
      <Input
        id="aiApiKey"
        type={showApiKey ? "text" : "password"}
        bind:value={apiKey}
        placeholder={provider === "gemini" ? "AIzaSy..." : "sk-..."}
        class="h-9 text-xs"
      />
    </div>

    <!-- Endpoint URL Input -->
    <div class="space-y-1.5">
      <label for="aiEndpoint" class="text-xs font-bold text-foreground flex items-center gap-1.5">
        <LinkIcon class="w-3.5 h-3.5 text-rose-600" />
        <span>Provider Endpoint URL Link</span>
      </label>
      <Input
        id="aiEndpoint"
        type="text"
        bind:value={endpointUrl}
        placeholder="https://api.openai.com/v1"
        class="h-9 text-xs font-mono"
      />
    </div>

    <!-- Dynamic Model Selection -->
    <div class="space-y-1.5">
      <label for="aiModelSelect" class="text-xs font-bold text-foreground flex items-center gap-1.5">
        <Bot class="w-3.5 h-3.5 text-rose-600" />
        <span>Pilihan Model AI (Model Selector)</span>
      </label>
      <select
        id="aiModelSelect"
        bind:value={selectedModel}
        class="flex h-9 w-full rounded-xl border border-input bg-background text-foreground px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {#each currentModels as m}
          <option value={m.id}>{m.name} — {m.description}</option>
        {/each}
        {#if provider === "custom"}
          {#each DEFAULT_AI_MODELS.filter(m => m.provider === 'custom') as cm}
            <option value={cm.id}>{cm.name} ({cm.id})</option>
          {/each}
        {/if}
        <option value="custom-model">+ Tambah Custom Model ID</option>
      </select>
    </div>

    {#if selectedModel === "custom-model"}
      <div class="space-y-1.5 animate-in fade-in-50">
        <label for="customModelName" class="text-xs font-bold text-foreground">Custom Model Identifier</label>
        <Input
          id="customModelName"
          type="text"
          bind:value={customModelName}
          placeholder="e.g. llama-3.3-70b"
          class="h-9 text-xs"
        />
      </div>
    {/if}

    <!-- Test Connectivity Result -->
    {#if testResult}
      <div class="p-3 rounded-xl border text-xs flex items-start gap-2.5 {testResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-semibold' : 'bg-rose-500/10 border-rose-500/30 text-rose-500 font-semibold'}">
        {#if testResult.success}
          <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        {:else}
          <AlertCircle class="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        {/if}
        <div class="flex-1 leading-relaxed">
          {testResult.message}
        </div>
      </div>
    {/if}
  </div>

  {#snippet footer()}
    <div class="flex items-center justify-between w-full gap-2 font-sans">
      <Button
        variant="outline"
        size="sm"
        onclick={handleTestConnection}
        disabled={testing || !apiKey}
        class="gap-1.5 font-bold"
      >
        {#if testing}
          <Loader2 class="w-3.5 h-3.5 animate-spin" />
          <span>Testing Connection...</span>
        {:else}
          <Sparkles class="w-3.5 h-3.5 text-amber-500" />
          <span>Test Connectivity</span>
        {/if}
      </Button>

      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" onclick={() => open = false} class="font-bold">
          Batal
        </Button>
        <Button variant="default" size="sm" onclick={handleSave} disabled={!apiKey} class="font-bold">
          Simpan AI Config
        </Button>
      </div>
    </div>
  {/snippet}
</Dialog>
