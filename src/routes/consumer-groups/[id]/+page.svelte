<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import {
        Save,
        ArrowLeft,
        Info,
        Users,
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

    let group = $state<any>({
        id: "",
        plugins: {},
    });

    let pluginsJson = $state("{}");
    let showRecipeSelector = $state(false);

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
                group = data.value || {};
                pluginsJson = JSON.stringify(group.plugins || {}, null, 2);
            }
        } catch (err) {
            console.error("Failed to fetch consumer group:", err);
        } finally {
            loading = false;
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

    async function saveGroup() {
        if (!group.id?.trim()) {
            alert("Group ID (Name) is required");
            return;
        }

        saving = true;
        try {
            group.plugins = JSON.parse(pluginsJson || "{}");
            const method = id === "new" ? "POST" : "PUT";
            const path =
                id === "new" ? "consumer_groups" : `consumer_groups/${id}`;

            await apiFetch(path, {
                method,
                body: JSON.stringify(group),
            });

            goto("/consumer-groups");
        } catch (err: any) {
            alert("Failed to save group: " + err.message);
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
                href="/consumer-groups"
                class="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-xl transition-colors border border-border"
                title="Back to Consumer Groups"
            >
                <ArrowLeft class="w-4 h-4" />
            </a>
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-foreground">
                    {id === "new" ? "Create Group" : "Edit Group"}
                </h1>
                <p class="text-xs text-muted-foreground mt-0.5">
                    Define global plugin policies shared across all consumers in this group.
                </p>
            </div>
        </div>

        <Button
            onclick={saveGroup}
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
                <span>Save Group</span>
            {/if}
        </Button>
    </div>

    {#if loading}
        <div class="py-32 flex flex-col items-center justify-center space-y-3">
            <div class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs font-bold text-muted-foreground tracking-wide">
                Loading Consumer Group...
            </p>
        </div>
    {:else}
        <div class="space-y-6">
            <!-- Group Identity Card -->
            <Card class="p-6 space-y-5 border-border/80 shadow-sm rounded-3xl bg-card">
                <div class="flex items-center gap-2 pb-3 border-b border-border">
                    <Users class="w-4 h-4 text-primary" />
                    <h2 class="font-bold text-sm text-foreground">Group Identity</h2>
                </div>

                <div class="space-y-2 max-w-md">
                    <label for="group-id" class="text-xs font-bold text-foreground block">
                        Group ID (Name)
                    </label>
                    <Input
                        id="group-id"
                        type="text"
                        bind:value={group.id}
                        disabled={id !== "new"}
                        placeholder="e.g. premium-tier-users"
                        class="h-10 text-xs"
                    />
                    <p class="text-[11px] text-muted-foreground italic pt-1">
                        The unique identifier for this consumer group in APISIX.
                    </p>
                </div>
            </Card>

            <!-- Group Policies (Plugins) Card -->
            <Card class="p-6 space-y-5 border-border/80 shadow-sm rounded-3xl bg-card">
                <div class="flex items-center justify-between pb-3 border-b border-border">
                    <h2 class="font-bold text-sm text-foreground">Group Policies (Plugins)</h2>
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
                    contextLabel="Consumer Group Policy Manifest"
                />
            </Card>
        </div>
    {/if}
</div>

<RecipeSelector bind:show={showRecipeSelector} onSelect={applyRecipe} />
