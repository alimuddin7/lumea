<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import {
        Save,
        ArrowLeft,
        Plus,
        Info,
        X,
        Database,
        Server,
        Sparkles,
        Globe,
        Sliders,
        Code
    } from "lucide-svelte";
    import Editor from "$lib/components/Editor.svelte";
    import { goto } from "$app/navigation";
    import { PLUGIN_TEMPLATES, type PluginName } from "$lib/utils/pluginTemplates";
    import RecipeSelector from "$lib/components/ui/RecipeSelector.svelte";
    import { type Recipe } from "$lib/utils/recipes";
    import PluginManager from "$lib/components/ui/PluginManager.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Switch from "$lib/components/ui/Switch.svelte";

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
    let editorMode = $state<"visual" | "code">("visual");

    let servicesList = $state<any[]>([]);
    let upstreamsList = $state<any[]>([]);
    let loadingServices = $state(true);
    let loadingUpstreams = $state(true);

    $effect(() => {
        if (id) {
            initForm();
        }
    });

    async function initForm() {
        loading = true;
        try {
            const data = await apiFetch("services");
            servicesList = data.list || [];
        } catch (err) {
            console.warn("Failed to fetch services");
        } finally {
            loadingServices = false;
        }

        try {
            const data = await apiFetch("upstreams");
            upstreamsList = data.list || [];
        } catch (err) {
            console.warn("Failed to fetch upstreams");
        } finally {
            loadingUpstreams = false;
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
            if (initialPlugin && PLUGIN_TEMPLATES[initialPlugin as PluginName]) {
                applyTemplate(initialPlugin as PluginName);
            }
        }
    }

    function toggleMethod(m: string) {
        if (route.methods.includes(m)) {
            if (route.methods.length > 1) {
                route.methods = route.methods.filter((item: string) => item !== m);
            }
        } else {
            route.methods = [...route.methods, m];
        }
    }

    function applyTemplate(name: PluginName) {
        const template = PLUGIN_TEMPLATES[name];
        if (!template) return;

        try {
            const currentPlugins = JSON.parse(pluginsJson || "{}");
            const newPlugins = { ...currentPlugins, ...template };
            pluginsJson = JSON.stringify(newPlugins, null, 2);
        } catch (e) {
            console.error("Invalid plugins JSON", e);
        }
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();
        saving = true;

        try {
            let parsedPlugins = {};
            try {
                parsedPlugins = JSON.parse(pluginsJson);
            } catch (err) {
                alert("Invalid JSON format in Plugins tab");
                saving = false;
                return;
            }

            let parsedVars = [];
            try {
                parsedVars = JSON.parse(varsJson);
            } catch (err) {
                alert("Invalid JSON format in Vars tab");
                saving = false;
                return;
            }

            const payload: any = {
                name: route.name,
                uri: route.uri,
                methods: route.methods,
                status: route.status,
                plugins: parsedPlugins,
                vars: parsedVars,
            };

            if (route.service_id) {
                payload.service_id = route.service_id;
            } else if (route.upstream_id) {
                payload.upstream_id = route.upstream_id;
            }

            const method = id === "new" ? "POST" : "PUT";
            const endpoint = id === "new" ? "routes" : `routes/${id}`;

            await apiFetch(endpoint, {
                method,
                body: JSON.stringify(payload),
            });

            goto("/routes");
        } catch (err: any) {
            alert(err.message || "Failed to save route");
        } finally {
            saving = false;
        }
    }
</script>

<form onsubmit={handleSubmit} class="space-y-6 max-w-5xl mx-auto pb-20">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <a href="/routes">
                <Button variant="ghost" size="icon" class="h-9 w-9">
                    <ArrowLeft class="w-4 h-4" />
                </Button>
            </a>
            <div>
                <h1 class="text-xl font-bold tracking-tight text-foreground">
                    {id === "new" ? "Create New APISIX Route" : `Edit Route: ${route.name || id}`}
                </h1>
                <p class="text-xs text-muted-foreground">
                    Configure matching rules, target upstreams, and plugin policies.
                </p>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={saving || loading || !route.name || !route.uri}
                class="gap-1.5 shadow-sm"
            >
                <Save class="w-4 h-4" />
                <span>{saving ? "Saving Route..." : "Save Route"}</span>
            </Button>
        </div>
    </div>

    {#if loading}
        <Card class="p-12 text-center text-muted-foreground text-xs font-medium">
            Loading route configuration...
        </Card>
    {:else}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column: Core Route Settings -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Match Rules Card -->
                <Card class="p-6 space-y-4">
                    <div class="flex items-center gap-2 pb-3 border-b border-border">
                        <Globe class="w-4 h-4 text-primary" />
                        <h2 class="font-semibold text-sm text-foreground">
                            Route Matching Rules
                        </h2>
                    </div>

                    <div class="space-y-4">
                        <div class="space-y-1.5">
                            <label for="routeNameInput" class="text-xs font-semibold text-foreground">
                                Route Name
                            </label>
                            <Input
                                id="routeNameInput"
                                type="text"
                                bind:value={route.name}
                                placeholder="e.g. user-service-route"
                                required
                                class="h-9 text-xs"
                            />
                        </div>

                        <div class="space-y-1.5">
                            <label for="routeUriInput" class="text-xs font-semibold text-foreground">
                                HTTP Request URI
                            </label>
                            <Input
                                id="routeUriInput"
                                type="text"
                                bind:value={route.uri}
                                placeholder="e.g. /api/v1/users/*"
                                required
                                class="h-9 text-xs font-mono"
                            />
                        </div>

                        <div class="space-y-1.5">
                            <span class="text-xs font-semibold text-foreground block">HTTP Methods</span>
                            <div class="flex flex-wrap gap-1.5">
                                {#each ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"] as m}
                                    <button
                                        type="button"
                                        onclick={() => toggleMethod(m)}
                                        class="px-2.5 py-1 rounded-md text-xs font-semibold border transition-all {route.methods.includes(m) ? 'bg-primary text-primary-foreground border-primary shadow-xs' : 'bg-background border-border text-muted-foreground hover:bg-muted'}"
                                    >
                                        {m}
                                    </button>
                                {/each}
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-2 border-t border-border">
                            <div>
                                <span class="text-xs font-semibold text-foreground block">Route Status</span>
                                <span class="text-[11px] text-muted-foreground">Enable or disable this route in APISIX</span>
                            </div>
                            <Switch
                                checked={route.status === 1}
                                onCheckedChange={(val) => route.status = val ? 1 : 0}
                                ariaLabel="Toggle Route Status"
                            />
                        </div>
                    </div>
                </Card>

                <!-- Upstream / Service Target Card -->
                <Card class="p-6 space-y-4">
                    <div class="flex items-center gap-2 pb-3 border-b border-border">
                        <Database class="w-4 h-4 text-primary" />
                        <h2 class="font-semibold text-sm text-foreground">
                            Target Upstream or Service
                        </h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                            <label for="routeUpstreamSelect" class="text-xs font-semibold text-foreground">
                                Upstream Target
                            </label>
                            <select
                                id="routeUpstreamSelect"
                                bind:value={route.upstream_id}
                                disabled={!!route.service_id}
                                class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">None (Select Upstream)</option>
                                {#each upstreamsList as u}
                                    <option value={u.value.id}>{u.value.name || u.value.id}</option>
                                {/each}
                            </select>
                        </div>

                        <div class="space-y-1.5">
                            <label for="routeServiceSelect" class="text-xs font-semibold text-foreground">
                                Service Abstraction
                            </label>
                            <select
                                id="routeServiceSelect"
                                bind:value={route.service_id}
                                disabled={!!route.upstream_id}
                                class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">None (Select Service)</option>
                                {#each servicesList as s}
                                    <option value={s.value.id}>{s.value.name || s.value.id}</option>
                                {/each}
                            </select>
                        </div>
                    </div>
                </Card>
            </div>

            <!-- Right Column: Plugins & Policies -->
            <div class="space-y-6">
                <Card class="p-6 space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-border">
                        <div class="flex items-center gap-2">
                            <Sliders class="w-4 h-4 text-primary" />
                            <h2 class="font-semibold text-sm text-foreground">
                                Plugin Policies
                            </h2>
                        </div>
                        <div class="flex items-center gap-1 bg-muted p-0.5 rounded-lg border border-border">
                            <button
                                type="button"
                                onclick={() => editorMode = "visual"}
                                class="px-2 py-0.5 rounded text-[11px] font-medium transition-all {editorMode === 'visual' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'}"
                            >
                                Visual
                            </button>
                            <button
                                type="button"
                                onclick={() => editorMode = "code"}
                                class="px-2 py-0.5 rounded text-[11px] font-medium transition-all {editorMode === 'code' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'}"
                            >
                                JSON
                            </button>
                        </div>
                    </div>

                    {#if editorMode === "visual"}
                        <PluginManager bind:pluginsJson />
                    {:else}
                        <div class="h-80 border border-border rounded-lg overflow-hidden">
                            <Editor bind:value={pluginsJson} language="json" />
                        </div>
                    {/if}
                </Card>
            </div>
        </div>
    {/if}
</form>
