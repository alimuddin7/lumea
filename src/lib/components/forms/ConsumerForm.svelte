<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Save, ArrowLeft, Info, LayoutTemplate, X } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import Editor from "$lib/components/Editor.svelte";
    import PluginManager from "$lib/components/ui/PluginManager.svelte";
    import {
        PLUGIN_TEMPLATES,
        type PluginName,
    } from "$lib/utils/pluginTemplates";

    let { username } = $props();
    let loading = $state(true);
    let saving = $state(false);

    // Set initial loading state
    onMount(() => {
        loading = username !== "new";
    });

    let consumer = $state<any>({
        username: "",
        custom_id: "",
        group_id: "",
        plugins: {},
    });

    let pluginsJson = $state("{}");
    let pluginsLanguage = $state("json");
    let showTemplateSelector = $state(false);
    let editorMode = $state<"visual" | "code">("visual");

    let groupsList = $state<any[]>([]);
    let loadingGroups = $state(true);

    onMount(async () => {
        // Fetch groups for the dropdown
        try {
            const data = await apiFetch("consumer_groups");
            groupsList = data.list || [];
        } catch (err) {
            console.warn("Failed to fetch groups for dropdown");
        } finally {
            loadingGroups = false;
        }

        if (username !== "new") {
            try {
                const data = await apiFetch(`consumers/${username}`);
                consumer = data.value;
                pluginsJson = JSON.stringify(consumer.plugins || {}, null, 2);
            } catch (err) {
                console.error("Failed to fetch consumer:", err);
            } finally {
                loading = false;
            }
        }
    });

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

    async function saveConsumer() {
        saving = true;
        try {
            consumer.plugins = JSON.parse(pluginsJson);

            // APISIX PUT /consumers/{username} often requires username in body
            // and definitely doesn't want create_time/update_time
            const { create_time, update_time, ...saveData } = consumer;

            if (!saveData.group_id) {
                delete saveData.group_id;
            }

            await apiFetch(`consumers/${consumer.username}`, {
                method: "PUT",
                body: saveData,
            });
            goto("/consumers");
        } catch (err: any) {
            alert("Failed to save: " + err.message);
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
                href="/consumers"
                class="p-2 hover:bg-base-200 rounded-full transition-colors opacity-50"
            >
                <ArrowLeft class="w-4 h-4" />
            </a>
            <h1 class="text-2xl font-black tracking-tighter italic">
                {username === "new" ? "Create Identity" : "Edit Identity"}
            </h1>
        </div>
        <button
            onclick={saveConsumer}
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
                <span>Save Identity</span>
            {/if}
        </button>
    </div>

    {#if loading}
        <div class="py-32 flex flex-col items-center justify-center opacity-20">
            <div class="loading loading-spinner loading-lg"></div>
            <p class="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">
                Synchronizing Entity
            </p>
        </div>
    {:else}
        <div class="space-y-8">
            <section class="section-card">
                <h2 class="section-title">
                    <div class="flex items-center gap-2">
                        <Info class="w-4 h-4 text-primary opacity-50" />
                        Basic Information
                    </div>
                </h2>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label for="c-user" class="label-minimal"
                            >Username</label
                        >
                        <input
                            id="c-user"
                            type="text"
                            bind:value={consumer.username}
                            disabled={username !== "new"}
                            placeholder="e.g. mobile_client"
                            class="input-minimal"
                        />
                    </div>
                    <div class="space-y-1">
                        <label for="c-group" class="label-minimal"
                            >Consumer Group</label
                        >
                        <select
                            id="c-group"
                            bind:value={consumer.group_id}
                            class="input-minimal appearance-none bg-base-100"
                        >
                            <option value="">None (Standalone)</option>
                            {#each groupsList as group}
                                <option value={group.value.id}
                                    >{group.value.id}</option
                                >
                            {/each}
                        </select>
                    </div>
                </div>

                <div class="pt-4 border-t border-base-300/30">
                    <div class="space-y-1">
                        <label for="c-id" class="label-minimal"
                            >Custom/System ID</label
                        >
                        <input
                            id="c-id"
                            type="text"
                            bind:value={consumer.custom_id}
                            placeholder="e.g. 1a2b3c"
                            class="input-minimal bg-base-200/50"
                        />
                    </div>
                </div>
            </section>

            <section class="section-card">
                <div class="section-title">
                    <div class="flex items-center gap-2">
                        Credentials & Plugins
                    </div>
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
                                >Choose authentication template</span
                            >
                            <button
                                onclick={() => (showTemplateSelector = false)}
                                class="opacity-20 hover:opacity-100"
                                ><X class="w-3 h-3" /></button
                            >
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                            {#each ["key-auth", "jwt-auth", "basic-auth"] as t}
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

                <PluginManager
                    bind:pluginsJson
                    contextLabel="Consumer Plugin Manifest"
                />
            </section>
        </div>
    {/if}
</div>
