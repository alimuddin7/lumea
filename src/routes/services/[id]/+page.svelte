<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import {
        Save,
        ArrowLeft,
        Info,
        LayoutTemplate,
        X,
        Server,
        ExternalLink,
        Network,
        Sparkles,
    } from "lucide-svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import Editor from "$lib/components/Editor.svelte";
    import PluginManager from "$lib/components/ui/PluginManager.svelte";
    import {
        PLUGIN_TEMPLATES,
        type PluginName,
    } from "$lib/utils/pluginTemplates";
    import RecipeSelector from "$lib/components/ui/RecipeSelector.svelte";
    import { type Recipe } from "$lib/utils/recipes";

    const id = $derived(page.params.id);
    let loading = $state(true);
    let saving = $state(false);

    let service = $state<any>({
        name: "",
        desc: "",
        upstream_id: "",
        plugins: {},
    });

    let pluginsJson = $state("{}");
    let pluginsLanguage = $state("json");
    let showTemplateSelector = $state(false);
    let showRecipeSelector = $state(false);
    let editorMode = $state<"visual" | "code">("visual");

    let upstreamsList = $state<any[]>([]);
    let associatedRoutes = $state<any[]>([]);
    let loadingData = $state(true);

    $effect(() => {
        if (id) {
            fetchData();
        }
    });

    async function fetchData() {
        loading = id !== "new";
        loadingData = true;

        try {
            // Fetch Upstreams for the dropdown
            const upsData = await apiFetch("upstreams");
            upstreamsList = upsData.list || [];

            if (id !== "new") {
                const data = await apiFetch(`services/${id}`);
                service = data.value;
                pluginsJson = JSON.stringify(service.plugins || {}, null, 2);

                // Fetch routes to find associations
                const routesData = await apiFetch("routes");
                associatedRoutes = (routesData.list || []).filter(
                    (r: any) => r.value.service_id === id,
                );
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            loading = false;
            loadingData = false;
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

    function applyRecipe(recipe: Recipe) {
        try {
            if (recipe.type === "plugin") {
                const currentPlugins = JSON.parse(pluginsJson);
                Object.assign(currentPlugins, recipe.content);
                pluginsJson = JSON.stringify(currentPlugins, null, 2);
            }
        } catch (err) {
            alert("Failed to apply recipe. check your JSON formatting.");
        }
    }

    async function saveService() {
        saving = true;
        try {
            service.plugins = JSON.parse(pluginsJson);
            const method = id === "new" ? "POST" : "PUT";
            const path = id === "new" ? "services" : `services/${id}`;

            await apiFetch(path, {
                method,
                body: service,
            });

            goto("/services");
        } catch (err: any) {
            alert("Failed to save service: " + err.message);
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
                href="/services"
                class="p-2 hover:bg-base-200 rounded-full transition-colors opacity-50"
            >
                <ArrowLeft class="w-4 h-4" />
            </a>
            <h1 class="text-2xl font-black tracking-tighter italic">
                {id === "new" ? "Create Service" : "Edit Service"}
            </h1>
        </div>
        <button
            onclick={saveService}
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
                <span>Save Service</span>
            {/if}
        </button>
    </div>

    {#if loading}
        <div class="py-32 flex flex-col items-center justify-center opacity-20">
            <div class="loading loading-spinner loading-lg"></div>
            <p class="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">
                Synchronizing Abstraction
            </p>
        </div>
    {:else}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div class="lg:col-span-2 space-y-8">
                <!-- Basic Config -->
                <section class="section-card">
                    <h2 class="section-title">
                        <div class="flex items-center gap-2">
                            <Info class="w-4 h-4 text-primary opacity-50" />
                            Basic Information
                        </div>
                    </h2>
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <label for="service-name" class="label-minimal"
                                >Service Name</label
                            >
                            <input
                                id="service-name"
                                type="text"
                                bind:value={service.name}
                                placeholder="e.g. User Authentication Service"
                                class="input-minimal"
                            />
                        </div>
                        <div class="space-y-1">
                            <label for="service-desc" class="label-minimal"
                                >Description</label
                            >
                            <textarea
                                id="service-desc"
                                bind:value={service.desc}
                                placeholder="Shared configuration for all auth-related routes..."
                                class="input-minimal min-h-[100px] py-3"
                            ></textarea>
                        </div>
                    </div>
                </section>

                <!-- Plugins -->
                <section class="section-card">
                    <div class="section-title">
                        <div class="flex items-center gap-2">
                            Applied Plugins
                        </div>
                        <div class="flex items-center gap-2">
                            <button
                                onclick={() => (showRecipeSelector = true)}
                                class="btn btn-ghost btn-xs h-7 rounded-lg border border-primary/30 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 bg-primary/5 text-primary"
                            >
                                <Sparkles class="w-3 h-3" />
                                Recipes & Tips
                            </button>
                        </div>
                    </div>

                    <PluginManager
                        bind:pluginsJson
                        contextLabel="Service Plugin Manifest"
                    />
                </section>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <section class="section-card">
                    <h2 class="section-title">
                        <div class="flex items-center gap-2">
                            <Server class="w-4 h-4 text-primary opacity-50" />
                            Upstream Binding
                        </div>
                    </h2>
                    <div class="space-y-1">
                        <label for="upstream-id" class="label-minimal"
                            >Target Upstream</label
                        >
                        <select
                            id="upstream-id"
                            bind:value={service.upstream_id}
                            class="input-minimal appearance-none bg-base-100"
                        >
                            <option value="">None (Standalone)</option>
                            {#each upstreamsList as ups}
                                <option value={ups.value.id}>
                                    {ups.value.name || ups.value.id}
                                </option>
                            {/each}
                        </select>
                        <p
                            class="text-[9px] font-bold opacity-20 uppercase tracking-widest pt-1 italic"
                        >
                            Select the upstream nodes for this service.
                        </p>
                    </div>
                </section>

                {#if id !== "new"}
                    <section
                        class="section-card border-l-4 border-l-primary/30"
                    >
                        <h2 class="section-title">
                            <div class="flex items-center gap-2">
                                <Network
                                    class="w-4 h-4 text-primary opacity-50"
                                />
                                Involved Routes
                            </div>
                        </h2>
                        <div class="space-y-3">
                            {#if associatedRoutes.length === 0}
                                <p
                                    class="text-[10px] font-bold opacity-30 italic py-2 text-center"
                                >
                                    No routes currently using this service.
                                </p>
                            {:else}
                                {#each associatedRoutes as route}
                                    <a
                                        href="/routes/{route.value.id}"
                                        class="flex items-center justify-between p-3 bg-base-200/50 rounded-xl border border-base-300/30 hover:border-primary/30 hover:bg-base-200 transition-all group"
                                    >
                                        <div class="space-y-1">
                                            <p
                                                class="text-[11px] font-black tracking-tight"
                                            >
                                                {route.value.name ||
                                                    route.value.id}
                                            </p>
                                            <p
                                                class="text-[9px] font-mono opacity-40"
                                            >
                                                {route.value.uri ||
                                                    "Multiple Hosts"}
                                            </p>
                                        </div>
                                        <ExternalLink
                                            class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </a>
                                {/each}
                            {/if}
                        </div>
                        <p
                            class="text-[9px] font-bold opacity-20 uppercase tracking-widest pt-1 italic"
                        >
                            These routes inherit configuration from this
                            service.
                        </p>
                    </section>
                {/if}
            </div>
        </div>
    {/if}
</div>

<RecipeSelector bind:show={showRecipeSelector} onSelect={applyRecipe} />
