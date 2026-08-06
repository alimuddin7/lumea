<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Save, ArrowLeft, Users, Fingerprint, Sliders, Loader2 } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import Editor from "$lib/components/Editor.svelte";
    import PluginManager from "$lib/components/ui/PluginManager.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";

    let { username } = $props();
    let loading = $state(false);
    let saving = $state(false);

    let consumer = $state<any>({
        username: "",
        custom_id: "",
        group_id: "",
        plugins: {},
    });

    let pluginsJson = $state("{}");
    let editorMode = $state<"visual" | "code">("visual");

    let groupsList = $state<any[]>([]);
    let loadingGroups = $state(true);

    onMount(async () => {
        try {
            const data = await apiFetch("consumer_groups");
            groupsList = data.list || [];
        } catch (err) {
            console.warn("Failed to fetch consumer groups");
        } finally {
            loadingGroups = false;
        }

        if (username !== "new") {
            loading = true;
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

    async function saveConsumer() {
        if (!consumer.username.trim()) {
            alert("Username cannot be empty.");
            return;
        }
        saving = true;
        try {
            consumer.plugins = JSON.parse(pluginsJson);
            const { create_time, update_time, ...saveData } = consumer;

            if (!saveData.group_id) {
                delete saveData.group_id;
            }

            await apiFetch(`consumers/${consumer.username}`, {
                method: "PUT",
                body: JSON.stringify(saveData),
            });
            goto("/consumers");
        } catch (err: any) {
            alert("Failed to save consumer: " + err.message);
        } finally {
            saving = false;
        }
    }
</script>

<div class="space-y-6 max-w-4xl mx-auto pb-20">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <a href="/consumers">
                <Button variant="ghost" size="icon" class="h-9 w-9">
                    <ArrowLeft class="w-4 h-4" />
                </Button>
            </a>
            <div>
                <h1 class="text-xl font-bold tracking-tight text-foreground">
                    {username === "new" ? "Create New API Consumer" : `Edit Consumer: ${consumer.username}`}
                </h1>
                <p class="text-xs text-muted-foreground">
                    Assign consumer identity, external reference ID, and auth policy plugins.
                </p>
            </div>
        </div>

        <Button
            onclick={saveConsumer}
            disabled={saving || loading}
            variant="default"
            size="sm"
            class="gap-1.5 shadow-sm"
        >
            {#if saving}
                <Loader2 class="w-4 h-4 animate-spin" />
                <span>Saving...</span>
            {:else}
                <Save class="w-4 h-4" />
                <span>Save Consumer</span>
            {/if}
        </Button>
    </div>

    {#if loading}
        <Card class="p-12 text-center text-muted-foreground text-xs font-medium">
            Loading consumer details...
        </Card>
    {:else}
        <div class="space-y-6">
            <!-- Consumer Identity Card -->
            <Card class="p-6 space-y-4">
                <div class="flex items-center gap-2 pb-3 border-b border-border">
                    <Users class="w-4 h-4 text-primary" />
                    <h2 class="font-semibold text-sm text-foreground">
                        Consumer Identity Profile
                    </h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label for="consumerUsernameInput" class="text-xs font-semibold text-foreground">
                            Username
                        </label>
                        <Input
                            id="consumerUsernameInput"
                            type="text"
                            bind:value={consumer.username}
                            disabled={username !== "new"}
                            placeholder="e.g. partner-client-01"
                            required
                            class="h-9 text-xs"
                        />
                    </div>

                    <div class="space-y-1.5">
                        <label for="consumerCustomIdInput" class="text-xs font-semibold text-foreground flex items-center gap-1">
                            <Fingerprint class="w-3.5 h-3.5 text-primary" />
                            <span>Custom Reference ID</span>
                        </label>
                        <Input
                            id="consumerCustomIdInput"
                            type="text"
                            bind:value={consumer.custom_id}
                            placeholder="e.g. client-guid-890"
                            class="h-9 text-xs font-mono"
                        />
                    </div>
                </div>
            </Card>

            <!-- Auth Plugins Card -->
            <Card class="p-6 space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-border">
                    <div class="flex items-center gap-2">
                        <Sliders class="w-4 h-4 text-primary" />
                        <h2 class="font-semibold text-sm text-foreground">
                            Consumer Credentials & Auth Plugins
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
                    <div class="h-72 border border-border rounded-lg overflow-hidden">
                        <Editor bind:value={pluginsJson} language="json" />
                    </div>
                {/if}
            </Card>
        </div>
    {/if}
</div>
