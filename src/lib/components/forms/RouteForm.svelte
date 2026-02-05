<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import {
        Save,
        ArrowLeft,
        Plus,
        Info,
        LayoutTemplate,
        X,
    } from "lucide-svelte";
    import Editor from "$lib/components/Editor.svelte";
    import { goto } from "$app/navigation";
    import {
        PLUGIN_TEMPLATES,
        type PluginName,
    } from "$lib/utils/pluginTemplates";
    import RecipeSelector from "$lib/components/ui/RecipeSelector.svelte";
    import { type Recipe } from "$lib/utils/recipes";
    import { Sparkles } from "lucide-svelte";
    import PluginManager from "$lib/components/ui/PluginManager.svelte";

    let { id, initialPlugin = null } = $props();
    let loading = $state(true);
    let saving = $state(false);

    let route = $state<any>({
        name: "",
        uri: "/",
        methods: ["GET", "POST"],
        upstream_id: "",
        plugins: {},
        vars: [],
        status: 1,
    });

    let pluginsJson = $state("{}");
    let varsJson = $state("[]");
    let pluginsLanguage = $state("json");
    let varsLanguage = $state("json");
    let showTemplateSelector = $state(false);
    let showRecipeSelector = $state(false);
    let editorMode = $state<"visual" | "code">("visual");

    let servicesList = $state<any[]>([]);
    let loadingServices = $state(true);

    $effect(() => {
        if (id) {
            initForm();
        }
    });

    async function initForm() {
        loading = true;
        // Fetch services for the dropdown
        try {
            const data = await apiFetch("services");
            servicesList = data.list || [];
        } catch (err) {
            console.warn("Failed to fetch services for dropdown");
        } finally {
            loadingServices = false;
        }

        if (id !== "new") {
            try {
                const data = await apiFetch(`routes/${id}`);
                route = data.value;
                pluginsJson = JSON.stringify(route.plugins || {}, null, 2);
                varsJson = JSON.stringify(route.vars || [], null, 2);
            } catch (err) {
                console.error("Failed to fetch route:", err);
            } finally {
                loading = false;
            }
        } else {
            loading = false;
            if (
                initialPlugin &&
                PLUGIN_TEMPLATES[initialPlugin as PluginName]
            ) {
                applyTemplate(initialPlugin as PluginName);
            }
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
            } else if (recipe.type === "vars") {
                varsJson = JSON.stringify(recipe.content, null, 2);
            }
        } catch (err) {
            alert("Failed to apply recipe. check your JSON formatting.");
        }
    }

    async function saveRoute() {
        saving = true;
        try {
            route.plugins = JSON.parse(pluginsJson);
            route.vars = JSON.parse(varsJson);
            const method = id === "new" ? "POST" : "PUT";
            const path = id === "new" ? "routes" : `routes/${id}`;

            await apiFetch(path, {
                method,
                body: route,
            });

            goto("/routes");
        } catch (err: any) {
            alert("Failed to save route: " + err.message);
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
                href="/routes"
                class="p-2 hover:bg-base-200 rounded-full transition-colors opacity-50"
            >
                <ArrowLeft class="w-4 h-4" />
            </a>
            <h1 class="text-2xl font-black tracking-tighter italic">
                {id === "new" ? "Create Route" : "Edit Route"}
            </h1>
        </div>
        <button
            onclick={saveRoute}
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
                <span>Save Route</span>
            {/if}
        </button>
    </div>

    {#if loading}
        <div class="py-32 flex flex-col items-center justify-center opacity-20">
            <div class="loading loading-spinner loading-lg"></div>
            <p class="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">
                Synchronizing State
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
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label for="route-name" class="label-minimal"
                                >Route Name</label
                            >
                            <input
                                id="route-name"
                                type="text"
                                bind:value={route.name}
                                placeholder="e.g. My Website Route"
                                class="input-minimal"
                            />
                        </div>
                        <div class="space-y-1">
                            <label for="route-uri" class="label-minimal"
                                >HTTP URI</label
                            >
                            <input
                                id="route-uri"
                                type="text"
                                bind:value={route.uri}
                                placeholder="/api/v1/*"
                                class="input-minimal"
                            />
                        </div>
                    </div>

                    <div class="space-y-2 pt-2">
                        <label class="label-minimal">Restricted Methods</label>
                        <div class="flex flex-wrap gap-1.5">
                            {#each ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"] as m}
                                <button
                                    onclick={() => {
                                        if (route.methods.includes(m)) {
                                            route.methods =
                                                route.methods.filter(
                                                    (x: string) => x !== m,
                                                );
                                        } else {
                                            route.methods = [
                                                ...route.methods,
                                                m,
                                            ];
                                        }
                                    }}
                                    class="px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-[0.1em] transition-all {route.methods.includes(
                                        m,
                                    )
                                        ? 'bg-primary border-primary text-primary-content shadow-md'
                                        : 'bg-base-200 border-base-300 opacity-40 hover:opacity-100'}"
                                >
                                    {m}
                                </button>
                            {/each}
                        </div>
                    </div>
                </section>

                <!-- Plugins -->
                <section class="section-card">
                    <div class="section-title">
                        <div class="flex items-center gap-2">
                            <Plus class="w-4 h-4 text-secondary opacity-50" />
                            Plugin Manifest (JSON)
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
                        contextLabel="Route Plugin Manifest"
                    />
                </section>

                <!-- Advanced Matching -->
                <section class="section-card">
                    <h2 class="section-title">
                        <div class="flex items-center gap-2">
                            <Sparkles class="w-4 h-4 text-primary opacity-50" />
                            Advanced Matching (Vars)
                        </div>
                    </h2>
                    <p
                        class="mb-3 text-[10px] font-bold opacity-30 uppercase tracking-widest"
                    >
                        Use APISIX variables for complex routing rules (headers,
                        cookies, etc).
                    </p>
                    <div
                        class="h-[200px] rounded-xl overflow-hidden border border-base-300"
                    >
                        <Editor
                            bind:value={varsJson}
                            bind:language={varsLanguage}
                        />
                    </div>
                </section>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <section class="section-card">
                    <h2 class="section-title">Backend Abstraction</h2>
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <label for="service-id" class="label-minimal"
                                >Bound Service</label
                            >
                            <select
                                id="service-id"
                                bind:value={route.service_id}
                                class="input-minimal appearance-none bg-base-100"
                            >
                                <option value="">None (Direct Backend)</option>
                                {#each servicesList as svc}
                                    <option value={svc.value.id}>
                                        {svc.value.name || svc.value.id}
                                    </option>
                                {/each}
                            </select>
                            <p
                                class="text-[8px] font-bold opacity-20 uppercase tracking-widest pt-1 italic"
                            >
                                {route.service_id
                                    ? "Inheriting from Service"
                                    : "Direct Upstream required below"}
                            </p>
                        </div>

                        <div class="divider opacity-5 my-0"></div>

                        <div class="space-y-1">
                            <label for="upstream-id" class="label-minimal"
                                >Manual Upstream ID</label
                            >
                            <input
                                id="upstream-id"
                                type="text"
                                bind:value={route.upstream_id}
                                disabled={!!route.service_id}
                                placeholder={route.service_id
                                    ? "Using Service Upstream"
                                    : "e.g. 123456"}
                                class="input-minimal {route.service_id
                                    ? 'bg-base-200/50 opacity-50'
                                    : 'bg-base-200/50'}"
                            />
                            <p
                                class="text-[8px] font-bold opacity-20 uppercase tracking-widest pt-1 italic"
                            >
                                {route.service_id
                                    ? "Managed by Service"
                                    : "Manual node reference"}
                            </p>
                        </div>
                    </div>
                </section>

                <section class="section-card">
                    <h2 class="section-title">Target Status</h2>
                    <div
                        class="flex items-center justify-between p-4 bg-base-200/50 rounded-xl border border-base-300/50"
                    >
                        <span
                            class="text-[10px] font-black uppercase tracking-widest opacity-60"
                        >
                            {route.status === 1 ? "Active" : "Disabled"}
                        </span>
                        <input
                            type="checkbox"
                            class="toggle toggle-primary toggle-sm"
                            checked={route.status === 1}
                            onchange={() =>
                                (route.status = route.status === 1 ? 0 : 1)}
                        />
                    </div>
                </section>
            </div>
        </div>
    {/if}

    <!-- Recipe Selector Modal -->
    {#if showRecipeSelector}
        <RecipeSelector
            bind:show={showRecipeSelector}
            onSelect={(recipe: Recipe) => {
                pluginsJson = JSON.stringify(recipe.content, null, 2);
                showRecipeSelector = false;
            }}
        />
    {/if}
</div>
