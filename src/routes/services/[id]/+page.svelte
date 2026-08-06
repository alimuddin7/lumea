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
    import PluginManager from "$lib/components/ui/PluginManager.svelte";
    import {
        PLUGIN_TEMPLATES,
        type PluginName,
    } from "$lib/utils/pluginTemplates";
    import RecipeSelector from "$lib/components/ui/RecipeSelector.svelte";
    import { type Recipe } from "$lib/utils/recipes";
    import Card from "$lib/components/ui/Card.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";

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
    let showRecipeSelector = $state(false);

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
            const upsData = await apiFetch("upstreams");
            upstreamsList = upsData.list || [];

            if (id !== "new") {
                const data = await apiFetch(`services/${id}`);
                service = data.value || {};
                pluginsJson = JSON.stringify(service.plugins || {}, null, 2);

                const routesData = await apiFetch("routes");
                associatedRoutes = (routesData.list || []).filter(
                    (r: any) => r.value?.service_id === id,
                );
            }
        } catch (err) {
            console.error("Failed to fetch service data:", err);
        } finally {
            loading = false;
            loadingData = false;
        }
    }

    function applyRecipe(recipe: Recipe) {
        try {
            if (recipe.type === "plugin") {
                const currentPlugins = JSON.parse(pluginsJson || "{}");
                Object.assign(currentPlugins, recipe.content);
                pluginsJson = JSON.stringify(currentPlugins, null, 2);
            }
        } catch (err) {
            alert("Failed to apply recipe. Check your JSON formatting.");
        }
    }

    async function saveService() {
        if (!service.name?.trim()) {
            alert("Service Name is required");
            return;
        }

        saving = true;
        try {
            service.plugins = JSON.parse(pluginsJson || "{}");
            const method = id === "new" ? "POST" : "PUT";
            const path = id === "new" ? "services" : `services/${id}`;

            await apiFetch(path, {
                method,
                body: JSON.stringify(service),
            });

            goto("/services");
        } catch (err: any) {
            alert("Failed to save service: " + err.message);
        } finally {
            saving = false;
        }
    }
</script>

<div class="space-y-6 max-w-5xl mx-auto pb-20 font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
            <a
                href="/services"
                class="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-xl transition-colors border border-border"
                title="Back to Services"
            >
                <ArrowLeft class="w-4 h-4" />
            </a>
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-foreground">
                    {id === "new" ? "Create Service" : "Edit Service"}
                </h1>
                <p class="text-xs text-muted-foreground mt-0.5">
                    Configure matching rules, target upstreams, and plugin policies.
                </p>
            </div>
        </div>

        <Button
            onclick={saveService}
            disabled={saving || loading}
            class="gap-1.5 h-9 text-xs font-bold shadow-md"
        >
            {#if saving}
                <div
                    class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
                <span>Saving...</span>
            {:else}
                <Save class="w-4 h-4" />
                <span>Save Service</span>
            {/if}
        </Button>
    </div>

    {#if loading}
        <div class="py-32 flex flex-col items-center justify-center space-y-3">
            <div class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs font-bold text-muted-foreground tracking-wide">
                Loading Service Abstraction...
            </p>
        </div>
    {:else}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div class="lg:col-span-2 space-y-6">
                <!-- Basic Config Card -->
                <Card class="p-6 space-y-5 border-border/80 shadow-sm rounded-3xl bg-card">
                    <div class="flex items-center gap-2 pb-3 border-b border-border">
                        <Info class="w-4 h-4 text-primary" />
                        <h2 class="font-bold text-sm text-foreground">Basic Information</h2>
                    </div>

                    <div class="space-y-4">
                        <div class="space-y-1.5">
                            <label for="service-name" class="text-xs font-bold text-foreground block">
                                Service Name
                            </label>
                            <Input
                                id="service-name"
                                type="text"
                                bind:value={service.name}
                                placeholder="e.g. User Authentication Service"
                                class="h-10 text-xs"
                            />
                        </div>

                        <div class="space-y-1.5">
                            <label for="service-desc" class="text-xs font-bold text-foreground block">
                                Description
                            </label>
                            <textarea
                                id="service-desc"
                                bind:value={service.desc}
                                placeholder="Shared configuration for all auth-related routes..."
                                class="w-full min-h-[100px] p-3 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                            ></textarea>
                        </div>
                    </div>
                </Card>

                <!-- Plugins Card -->
                <Card class="p-6 space-y-5 border-border/80 shadow-sm rounded-3xl bg-card">
                    <div class="flex items-center justify-between pb-3 border-b border-border">
                        <h2 class="font-bold text-sm text-foreground">Applied Plugins</h2>
                        <Button
                            variant="outline"
                            size="xs"
                            onclick={() => (showRecipeSelector = true)}
                            class="gap-1.5 text-xs font-bold"
                        >
                            <Sparkles class="w-3.5 h-3.5 text-rose-600" />
                            <span>Recipes & Tips</span>
                        </Button>
                    </div>

                    <PluginManager
                        bind:pluginsJson
                        contextLabel="Service Plugin Manifest"
                    />
                </Card>
            </div>

            <!-- Right Sidebar -->
            <div class="space-y-6">
                <!-- Upstream Binding Card -->
                <Card class="p-6 space-y-4 border-border/80 shadow-sm rounded-3xl bg-card">
                    <div class="flex items-center gap-2 pb-3 border-b border-border">
                        <Server class="w-4 h-4 text-primary" />
                        <h2 class="font-bold text-sm text-foreground">Upstream Binding</h2>
                    </div>

                    <div class="space-y-2">
                        <label for="upstream-id" class="text-xs font-bold text-foreground block">
                            Target Upstream
                        </label>
                        <select
                            id="upstream-id"
                            bind:value={service.upstream_id}
                            class="w-full h-10 px-3 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            <option value="">None (Standalone)</option>
                            {#each upstreamsList as ups}
                                <option value={ups.value.id}>
                                    {ups.value.name || ups.value.id}
                                </option>
                            {/each}
                        </select>
                        <p class="text-[11px] text-muted-foreground italic leading-relaxed pt-1">
                            Select the target upstream nodes to handle proxying for this service.
                        </p>
                    </div>
                </Card>

                {#if id !== "new"}
                    <Card class="p-6 space-y-4 border-border/80 shadow-sm rounded-3xl bg-card">
                        <div class="flex items-center gap-2 pb-3 border-b border-border">
                            <Network class="w-4 h-4 text-primary" />
                            <h2 class="font-bold text-sm text-foreground">Involved Routes</h2>
                        </div>

                        <div class="space-y-2">
                            {#if associatedRoutes.length === 0}
                                <p class="text-xs text-muted-foreground italic py-2 text-center">
                                    No routes currently using this service.
                                </p>
                            {:else}
                                {#each associatedRoutes as route}
                                    <a
                                        href="/routes/{route.value.id}"
                                        class="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-muted/50 transition-all group"
                                    >
                                        <div class="space-y-0.5 max-w-[80%]">
                                            <p class="text-xs font-bold text-foreground truncate">
                                                {route.value.name || route.value.id}
                                            </p>
                                            <p class="text-[11px] font-mono text-muted-foreground truncate">
                                                {route.value.uri || "Multiple Hosts"}
                                            </p>
                                        </div>
                                        <ExternalLink class="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </a>
                                {/each}
                            {/if}
                        </div>
                    </Card>
                {/if}
            </div>
        </div>
    {/if}
</div>

<RecipeSelector bind:show={showRecipeSelector} onSelect={applyRecipe} />
