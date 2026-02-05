<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import {
        Save,
        ArrowLeft,
        Info,
        LayoutTemplate,
        X,
        Users,
    } from "lucide-svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import Editor from "$lib/components/Editor.svelte";
    import {
        PLUGIN_TEMPLATES,
        type PluginName,
    } from "$lib/utils/pluginTemplates";

    const id = $derived(page.params.id);
    let loading = $state(true);
    let saving = $state(false);

    let group = $state<any>({
        id: "",
        plugins: {},
    });

    let pluginsJson = $state("{}");
    let showTemplateSelector = $state(false);

    $effect(() => {
        if (id) {
            fetchData();
        }
    });

    async function fetchData() {
        loading = id !== "new";
        try {
            if (id !== "new") {
                const data = await apiFetch(`consumer_groups/${id}`);
                group = data.value;
                pluginsJson = JSON.stringify(group.plugins || {}, null, 2);
            }
        } catch (err) {
            console.error("Failed to fetch consumer group:", err);
        } finally {
            loading = false;
        }
    }

    function applyTemplate(name: PluginName) {
        try {
            const currentPlugins = JSON.parse(pluginsJson);
            currentPlugins[name] = PLUGIN_TEMPLATES[name];
            pluginsJson = JSON.stringify(currentPlugins, null, 2);
            showTemplateSelector = false;
        } catch (err) {
            alert(
                "Ensure your current JSON is valid before adding a template.",
            );
        }
    }

    async function saveGroup() {
        saving = true;
        try {
            group.plugins = JSON.parse(pluginsJson);
            const method = id === "new" ? "POST" : "PUT";
            const path =
                id === "new" ? "consumer_groups" : `consumer_groups/${id}`;

            await apiFetch(path, {
                method,
                body: group,
            });

            goto("/consumer-groups");
        } catch (err: any) {
            alert("Failed to save group: " + err.message);
        } finally {
            saving = false;
        }
    }
</script>

<div class="space-y-6 max-w-5xl mx-auto pb-20">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <a
                href="/consumer-groups"
                class="p-2 hover:bg-base-200 rounded-full transition-colors opacity-50"
            >
                <ArrowLeft class="w-4 h-4" />
            </a>
            <h1 class="text-2xl font-black tracking-tighter italic">
                {id === "new" ? "Create Group" : "Edit Group"}
            </h1>
        </div>
        <button
            onclick={saveGroup}
            disabled={saving || loading}
            class="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 disabled:opacity-20 text-primary-content font-black rounded-xl transition-all shadow-lg shadow-primary/10 text-xs uppercase tracking-widest"
        >
            {#if saving}
                <div
                    class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
                <span>Saving...</span>
            {:else}
                <Save class="w-4 h-4" />
                <span>Save Group</span>
            {/if}
        </button>
    </div>

    {#if loading}
        <div class="py-32 flex flex-col items-center justify-center opacity-20">
            <div class="loading loading-spinner loading-lg"></div>
            <p class="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">
                Synchronizing Aggregation
            </p>
        </div>
    {:else}
        <div class="space-y-8">
            <!-- Basic Config -->
            <section class="section-card">
                <h2 class="section-title">
                    <div class="flex items-center gap-2">
                        <Info class="w-4 h-4 text-primary opacity-50" />
                        Group Identity
                    </div>
                </h2>
                <div class="space-y-1 max-w-md">
                    <label for="group-id" class="label-minimal"
                        >Group ID (Name)</label
                    >
                    <input
                        id="group-id"
                        type="text"
                        bind:value={group.id}
                        disabled={id !== "new"}
                        placeholder="e.g. premium-tier-users"
                        class="input-minimal"
                    />
                    <p
                        class="text-[9px] font-bold opacity-20 uppercase tracking-widest pt-1 italic"
                    >
                        The unique identifier for this consumer group.
                    </p>
                </div>
            </section>

            <!-- Plugins -->
            <section class="section-card">
                <div class="section-title">
                    <div class="flex items-center gap-2">
                        Group Policies (Plugins)
                    </div>
                    <button
                        onclick={() =>
                            (showTemplateSelector = !showTemplateSelector)}
                        class="btn btn-ghost btn-xs h-7 rounded-lg border border-base-300 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3"
                    >
                        <LayoutTemplate class="w-3 h-3" />
                        Insert Template
                    </button>
                </div>

                {#if showTemplateSelector}
                    <div
                        class="bg-base-200 p-4 rounded-xl border border-base-300 animate-in fade-in slide-in-from-top-2 mb-4"
                    >
                        <div
                            class="flex items-center justify-between mb-3 px-1"
                        >
                            <span
                                class="text-[9px] font-black uppercase tracking-[0.2em] opacity-40"
                                >Choose a policy template</span
                            >
                            <button
                                onclick={() => (showTemplateSelector = false)}
                                class="opacity-20 hover:opacity-100"
                                ><X class="w-3 h-3" /></button
                            >
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                            {#each Object.keys(PLUGIN_TEMPLATES) as t}
                                <button
                                    onclick={() =>
                                        applyTemplate(t as PluginName)}
                                    class="btn btn-ghost btn-xs h-8 rounded-lg bg-base-100 border border-base-300 text-[9px] font-black uppercase tracking-widest px-3 hover:bg-primary hover:text-primary-content hover:border-primary transition-all"
                                >
                                    {t}
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}

                <p
                    class="text-[10px] font-bold opacity-30 uppercase tracking-widest"
                >
                    Plugins configured here apply to all consumers who join this
                    group.
                </p>
                <div
                    class="h-[400px] rounded-xl overflow-hidden border border-base-300"
                >
                    <Editor bind:value={pluginsJson} language="json" />
                </div>
            </section>
        </div>
    {/if}
</div>
