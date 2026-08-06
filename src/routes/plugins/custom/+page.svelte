<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Puzzle, Plus, Info, Terminal, Search, Trash2 } from "lucide-svelte";
    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import DataTable from "$lib/components/ui/DataTable.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Dialog from "$lib/components/ui/Dialog.svelte";
    import Input from "$lib/components/ui/Input.svelte";

    let plugins = $state<any[]>([]);
    let loading = $state(true);
    let searchQuery = $state("");
    let pageSize = $state(10);
    let currentPage = $state(1);

    // Modal state
    let showRegisterModal = $state(false);
    let saving = $state(false);
    let newPluginId = $state("");
    let newPluginPriority = $state("1000");
    let newPluginSchema = $state('{\n  "disable": false\n}');

    const filteredPlugins = $derived(
        plugins.filter(
            (p) =>
                p.value?.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.key?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );

    async function fetchCustomPlugins() {
        loading = true;
        try {
            const data = await apiFetch("plugin_metadata");
            plugins = data.list || [];
        } catch (err) {
            console.warn("Failed to fetch custom plugin metadata:", err);
            plugins = [];
        } finally {
            loading = false;
        }
    }

    async function handleRegisterPlugin() {
        if (!newPluginId.trim()) {
            alert("Plugin ID / Name is required");
            return;
        }

        saving = true;
        try {
            let parsedSchema = {};
            try {
                parsedSchema = JSON.parse(newPluginSchema);
            } catch (e) {
                alert("Invalid JSON format in Plugin Schema");
                saving = false;
                return;
            }

            const body = {
                id: newPluginId.trim(),
                priority: parseInt(newPluginPriority) || 1000,
                schema: parsedSchema
            };

            await apiFetch(`plugin_metadata/${newPluginId.trim()}`, {
                method: "PUT",
                body: JSON.stringify(body)
            });

            showRegisterModal = false;
            newPluginId = "";
            newPluginSchema = '{\n  "disable": false\n}';
            await fetchCustomPlugins();
        } catch (err: any) {
            alert("Failed to register custom plugin: " + err.message);
        } finally {
            saving = false;
        }
    }

    async function deleteCustomPlugin(id: string) {
        if (!confirm(`Are you sure you want to delete custom plugin metadata for "${id}"?`)) return;
        try {
            await apiFetch(`plugin_metadata/${id}`, { method: "DELETE" });
            await fetchCustomPlugins();
        } catch (err: any) {
            alert("Failed to delete plugin: " + err.message);
        }
    }

    onMount(() => {
        fetchCustomPlugins();
    });
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-20 font-sans">
    <PageHeader
        title="Custom Plugins"
        description="Manage your enterprise-specific custom plugins, schemas, and execution priorities."
        badge="CUSTOM"
        badgeType="secondary"
    >
        {#snippet actions()}
            <Button
                size="sm"
                onclick={() => (showRegisterModal = true)}
                class="gap-1.5 h-9 text-xs font-bold shadow-md"
            >
                <Plus class="w-4 h-4" />
                <span>Register Custom Plugin</span>
            </Button>
        {/snippet}
    </PageHeader>

    <DataTable
        columns={["Plugin Name", "Priority", "Status", "Operations"]}
        items={filteredPlugins}
        {loading}
        showSearch={true}
        searchPlaceholder="Filter custom plugins..."
        bind:searchValue={searchQuery}
        totalItems={filteredPlugins.length}
        bind:pageSize
        {currentPage}
        onPageChange={(p) => (currentPage = p)}
        loadingMessage="Syncing custom plugins..."
        emptyMessage="No custom plugins discovered."
    >
        {#snippet rowSnippet(plugin)}
            <td class="py-4 px-6">
                <div class="flex items-center gap-4">
                    <div class="p-2.5 bg-primary/10 rounded-xl text-primary font-bold">
                        <Puzzle class="w-4 h-4" />
                    </div>
                    <div>
                        <div class="font-bold text-sm tracking-tight text-foreground">
                            {plugin.value?.id || plugin.key?.split("/").pop() || "Unnamed Plugin"}
                        </div>
                        <div class="text-[10px] font-mono text-muted-foreground mt-0.5">
                            Lua Extension Module
                        </div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="text-xs font-bold text-muted-foreground">
                    {plugin.value?.priority ?? 1000}
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span class="text-xs font-bold text-emerald-500">Active</span>
                </div>
            </td>
            <td class="py-4 px-6 text-right">
                <div class="flex justify-end items-center gap-2">
                    <Button
                        variant="destructive"
                        size="xs"
                        onclick={() => deleteCustomPlugin(plugin.value?.id || plugin.key?.split("/").pop())}
                        class="h-8 text-xs font-bold gap-1"
                    >
                        <Trash2 class="w-3.5 h-3.5" />
                        <span>Delete</span>
                    </Button>
                </div>
            </td>
        {/snippet}
    </DataTable>
</div>

<!-- Register Custom Plugin Modal -->
<Dialog
    bind:open={showRegisterModal}
    title="Register Custom Plugin"
    description="Add metadata and JSON configuration schema for your custom Lua plugin."
>
    <div class="space-y-4 font-sans">
        <div class="space-y-1.5">
            <label for="custom-plugin-id" class="text-xs font-bold text-foreground block">
                Plugin ID / Name
            </label>
            <Input
                id="custom-plugin-id"
                type="text"
                bind:value={newPluginId}
                placeholder="e.g. my-custom-rate-limiter"
                class="h-10 text-xs"
            />
        </div>

        <div class="space-y-1.5">
            <label for="custom-plugin-priority" class="text-xs font-bold text-foreground block">
                Execution Priority
            </label>
            <Input
                id="custom-plugin-priority"
                type="number"
                bind:value={newPluginPriority}
                placeholder="1000"
                class="h-10 text-xs"
            />
        </div>

        <div class="space-y-1.5">
            <label for="custom-plugin-schema" class="text-xs font-bold text-foreground block">
                Plugin Schema JSON
            </label>
            <textarea
                id="custom-plugin-schema"
                bind:value={newPluginSchema}
                rows={5}
                class="w-full p-3 font-mono text-xs rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Enter JSON schema..."
            ></textarea>
        </div>
    </div>

    {#snippet footer()}
        <Button
            variant="outline"
            size="sm"
            onclick={() => (showRegisterModal = false)}
        >
            Cancel
        </Button>
        <Button
            variant="default"
            size="sm"
            disabled={saving}
            onclick={handleRegisterPlugin}
            class="font-bold gap-1.5"
        >
            {#if saving}
                <div class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
            {:else}
                <Plus class="w-4 h-4" />
                <span>Register Plugin</span>
            {/if}
        </Button>
    {/snippet}
</Dialog>
