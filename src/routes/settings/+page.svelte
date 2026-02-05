<script lang="ts">
    import { config } from "$lib/stores/config";
    import { ShieldCheck, Info, Save } from "lucide-svelte";
    import PageHeader from "$lib/components/ui/PageHeader.svelte";

    let baseUrl = $state($config.baseUrl);
    let apiKey = $state($config.apiKey);
    let saving = $state(false);

    async function saveSettings() {
        saving = true;
        // Simulate a small delay for better UX feedback
        await new Promise((resolve) => setTimeout(resolve, 500));
        config.set({ baseUrl, apiKey });
        saving = false;
    }
</script>

<div class="max-w-4xl mx-auto space-y-8 pb-10">
    <PageHeader
        title="Dashboard Settings"
        description="Configure your APISIX Admin API connection and security credentials."
        badge="Config"
        badgeType="info"
    />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
            <section class="section-card">
                <h2 class="section-title">
                    <div class="flex items-center gap-2">
                        <ShieldCheck class="w-4 h-4 text-primary opacity-50" />
                        Admin API Configuration
                    </div>
                </h2>

                <div class="space-y-4">
                    <div class="space-y-1.5">
                        <label for="baseUrl" class="label-minimal"
                            >Admin API Base URL</label
                        >
                        <input
                            id="baseUrl"
                            type="text"
                            bind:value={baseUrl}
                            placeholder="http://127.0.0.1:9180/apisix/admin"
                            class="input-minimal"
                        />
                        <div class="flex items-start gap-2 pt-1 opacity-40">
                            <Info class="w-3 h-3 mt-0.5" />
                            <p
                                class="text-[9px] font-bold uppercase tracking-wider"
                            >
                                Typically includes the /apisix/admin suffix.
                            </p>
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label for="apiKey" class="label-minimal"
                            >Admin API Key (X-API-KEY)</label
                        >
                        <input
                            id="apiKey"
                            type="password"
                            bind:value={apiKey}
                            placeholder="Enter your security token"
                            class="input-minimal"
                        />
                    </div>
                </div>

                <div class="pt-4 flex justify-end">
                    <button
                        onclick={saveSettings}
                        disabled={saving}
                        class="flex items-center gap-2 px-8 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-20 text-primary-content font-black rounded-xl transition-all shadow-lg shadow-primary/10 text-[10px] uppercase tracking-[0.2em]"
                    >
                        {#if saving}
                            <div
                                class="w-3 h-3 border-2 border-primary-content border-t-transparent rounded-full animate-spin"
                            ></div>
                            <span>Applying...</span>
                        {:else}
                            <Save class="w-3.5 h-3.5" />
                            <span>Save Configuration</span>
                        {/if}
                    </button>
                </div>
            </section>
        </div>

        <div class="space-y-6">
            <section
                class="bg-base-100 p-6 rounded-2xl border border-base-300 space-y-4 shadow-sm border-l-4 border-l-info"
            >
                <h3
                    class="text-[10px] font-black uppercase tracking-[0.2em] text-info"
                >
                    System Architecture
                </h3>
                <p class="text-[11px] font-bold leading-relaxed opacity-60">
                    These settings are stored securely in your browser's local
                    storage.
                </p>
                <div
                    class="p-3 bg-base-200/50 rounded-xl border border-base-300/30"
                >
                    <p class="text-[10px] font-bold leading-relaxed opacity-50">
                        The dashboard utilizes a server-side proxy to bridge
                        communication with the APISIX Admin API, preventing CORS
                        complications.
                    </p>
                </div>
            </section>
        </div>
    </div>
</div>
