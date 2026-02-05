<script lang="ts">
    import {
        Settings,
        Trash2,
        Plus,
        Info,
        ChevronRight,
        ChevronDown,
        Wand2,
    } from "lucide-svelte";
    import { PLUGIN_TEMPLATES } from "$lib/utils/pluginTemplates";

    let { pluginsJson = $bindable(), language = "json" } = $props();

    // Internal state parsed from JSON
    let plugins = $state<Record<string, any>>({});
    let expandedPlugin = $state<string | null>(null);

    // Sync from JSON string to object
    $effect(() => {
        try {
            const parsed = JSON.parse(pluginsJson);
            if (JSON.stringify(parsed) !== JSON.stringify(plugins)) {
                plugins = parsed;
            }
        } catch (e) {
            // Keep existing plugins if JSON is invalid during typing
        }
    });

    // Sync from object back to JSON string
    function updateJson() {
        pluginsJson = JSON.stringify(plugins, null, 2);
    }

    function togglePlugin(name: string) {
        if (plugins[name]) {
            delete plugins[name];
        } else {
            plugins[name] = (PLUGIN_TEMPLATES as any)[name] || {};
        }
        updateJson();
    }

    function removePlugin(name: string) {
        delete plugins[name];
        updateJson();
        if (expandedPlugin === name) expandedPlugin = null;
    }

    // Helper to get common plugins not yet added
    const commonPlugins = [
        "proxy-rewrite",
        "response-rewrite",
        "key-auth",
        "cors",
        "limit-count",
        "prometheus",
    ];
    let availablePlugins = $derived(commonPlugins.filter((p) => !plugins[p]));
</script>

<div class="space-y-4">
    <!-- Active Plugins -->
    <div class="space-y-2">
        {#each Object.keys(plugins) as name}
            <div
                class="bg-base-100 rounded-xl border border-base-300 overflow-hidden shadow-sm transition-all {expandedPlugin ===
                name
                    ? 'ring-1 ring-primary'
                    : ''}"
            >
                <div
                    class="flex items-center justify-between p-3 bg-base-100/50"
                >
                    <button
                        onclick={() =>
                            (expandedPlugin =
                                expandedPlugin === name ? null : name)}
                        class="flex items-center gap-2.5 flex-1 text-left"
                    >
                        <div
                            class="p-1.5 bg-primary/10 rounded-lg text-primary"
                        >
                            <Settings class="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <h3
                                class="text-[10px] font-black uppercase tracking-widest"
                            >
                                {name}
                            </h3>
                        </div>
                        {#if expandedPlugin === name}
                            <ChevronDown class="w-3 h-3 opacity-20 ml-auto" />
                        {:else}
                            <ChevronRight class="w-3 h-3 opacity-20 ml-auto" />
                        {/if}
                    </button>
                    <button
                        onclick={() => removePlugin(name)}
                        class="p-1.5 hover:bg-error/10 hover:text-error rounded-lg transition-colors ml-2 opacity-30 hover:opacity-100"
                        title="Deactivate Plugin"
                    >
                        <Trash2 class="w-3.5 h-3.5" />
                    </button>
                </div>

                {#if expandedPlugin === name}
                    <div
                        class="p-4 bg-base-200/30 border-t border-base-300 space-y-4"
                    >
                        <!-- Plugin Specific Forms -->
                        {#if name === "proxy-rewrite"}
                            <div class="grid grid-cols-1 gap-4">
                                <div class="space-y-1">
                                    <label
                                        for="{name}-uri"
                                        class="label-minimal"
                                        >Target URI Path</label
                                    >
                                    <input
                                        id="{name}-uri"
                                        type="text"
                                        bind:value={plugins[name].uri}
                                        oninput={updateJson}
                                        placeholder="/new-path"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                                <div class="space-y-1">
                                    <label
                                        for="{name}-host"
                                        class="label-minimal">Target Host</label
                                    >
                                    <input
                                        id="{name}-host"
                                        type="text"
                                        bind:value={plugins[name].host}
                                        oninput={updateJson}
                                        placeholder="backend.prod"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                            </div>
                        {:else if name === "response-rewrite"}
                            <div class="grid grid-cols-1 gap-4">
                                <div class="space-y-1">
                                    <label
                                        for="{name}-status"
                                        class="label-minimal"
                                        >Override Status Code</label
                                    >
                                    <input
                                        id="{name}-status"
                                        type="number"
                                        bind:value={plugins[name].status_code}
                                        oninput={updateJson}
                                        placeholder="e.g. 403"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                                <div class="space-y-1">
                                    <label
                                        for="{name}-body"
                                        class="label-minimal"
                                        >Response Body (Text/JSON)</label
                                    >
                                    <textarea
                                        id="{name}-body"
                                        bind:value={plugins[name].body}
                                        oninput={updateJson}
                                        placeholder={'{"message": "Forbidden"}'}
                                        class="input-minimal bg-base-100 h-20 py-2"
                                    ></textarea>
                                </div>
                            </div>
                        {:else if name === "limit-count"}
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1">
                                    <label
                                        for="{name}-count"
                                        class="label-minimal"
                                        >Request Limit</label
                                    >
                                    <input
                                        id="{name}-count"
                                        type="number"
                                        bind:value={plugins[name].count}
                                        oninput={updateJson}
                                        placeholder="100"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                                <div class="space-y-1">
                                    <label
                                        for="{name}-window"
                                        class="label-minimal"
                                        >Time Window (sec)</label
                                    >
                                    <input
                                        id="{name}-window"
                                        type="number"
                                        bind:value={plugins[name].time_window}
                                        oninput={updateJson}
                                        placeholder="60"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                            </div>
                        {:else if name === "cors"}
                            <div class="space-y-4">
                                <div class="space-y-1">
                                    <label
                                        for="{name}-origin"
                                        class="label-minimal"
                                        >Allow Origins</label
                                    >
                                    <input
                                        id="{name}-origin"
                                        type="text"
                                        bind:value={plugins[name].allow_origins}
                                        oninput={updateJson}
                                        placeholder="*"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                                <div class="space-y-1">
                                    <label
                                        for="{name}-methods"
                                        class="label-minimal"
                                        >Allow Methods</label
                                    >
                                    <input
                                        id="{name}-methods"
                                        type="text"
                                        bind:value={plugins[name].allow_methods}
                                        oninput={updateJson}
                                        placeholder="GET,POST,PUT"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                            </div>
                        {:else}
                            <div
                                class="p-8 flex flex-col items-center justify-center opacity-30 text-center"
                            >
                                <Wand2 class="w-8 h-8 mb-2" />
                                <p
                                    class="text-[10px] font-black uppercase tracking-widest"
                                >
                                    Advanced Config
                                </p>
                                <p
                                    class="text-[8px] uppercase tracking-widest max-w-[200px] mt-1 italic"
                                >
                                    Use the code editor on the right for this
                                    specific plugin's detailed settings.
                                </p>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    <div class="pt-4 mt-2 border-t border-base-300/30">
        <p
            class="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 mb-3 px-1"
        >
            Library
        </p>
        <div class="flex flex-wrap gap-1.5 px-0.5">
            {#each availablePlugins as p}
                <button
                    onclick={() => togglePlugin(p)}
                    class="group flex items-center gap-1.5 h-7 px-3 rounded-lg bg-base-200/50 hover:bg-primary/10 border border-base-300/50 hover:border-primary/30 transition-all"
                >
                    <Plus
                        class="w-2.5 h-2.5 opacity-30 group-hover:text-primary group-hover:opacity-100"
                    />
                    <span
                        class="text-[9px] font-bold uppercase tracking-widest opacity-60 group-hover:text-primary group-hover:opacity-100"
                        >{p}</span
                    >
                </button>
            {/each}
            <button
                class="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-base-200/20 border border-dashed border-base-300/50 text-[9px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100 transition-all italic"
            >
                More...
            </button>
        </div>
    </div>
</div>
