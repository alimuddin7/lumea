<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Puzzle, Plus, Info, Terminal, Search } from "lucide-svelte";
    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import DataTable from "$lib/components/ui/DataTable.svelte";

    let plugins = $state<any[]>([]);
    let loading = $state(true);
    let searchQuery = $state("");
    let pageSize = $state(10);
    let currentPage = $state(1);

    const filteredPlugins = $derived(
        plugins.filter(
            (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.id &&
                    p.id.toLowerCase().includes(searchQuery.toLowerCase())),
        ),
    );

    async function fetchCustomPlugins() {
        loading = true;
        try {
            // APISIX custom plugins are usually registered in the admin API
            // For now, let's look for plugins that aren't in the default set or use plugin_metadata
            const data = await apiFetch("plugin_metadata");
            plugins = data.list || [];
        } catch (err) {
            console.warn("Failed to fetch custom plugin metadata:", err);
            plugins = [];
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchCustomPlugins();
    });
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-20">
    <PageHeader
        title="Custom Plugins"
        description="Manage your enterprise-specific custom plugins and metadata."
        badge="CUSTOM"
        badgeType="secondary"
    >
        {#snippet actions()}
            <button
                class="btn btn-primary btn-md rounded-xl font-black shadow-lg shadow-primary/10 transition-all text-primary-content uppercase text-[10px] tracking-widest"
            >
                <Plus class="w-4 h-4 mr-1" />
                Register Plugin
            </button>
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
                    <div class="p-2.5 bg-base-200 rounded-xl text-primary/40">
                        <Puzzle class="w-4 h-4" />
                    </div>
                    <div>
                        <div
                            class="font-bold text-sm tracking-tight text-base-content/90"
                        >
                            {plugin.value.id || "Unnamed"}
                        </div>
                        <div
                            class="text-[9px] font-black tracking-widest opacity-30 mt-0.5 uppercase"
                        >
                            INTERNAL MODULE
                        </div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6">
                <div
                    class="text-[10px] font-black uppercase tracking-widest opacity-40"
                >
                    {plugin.value.priority || "DEFAULT"}
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-success"></div>
                    <span
                        class="text-[10px] font-black uppercase tracking-widest opacity-40"
                        >Active</span
                    >
                </div>
            </td>
            <td class="py-4 px-6 text-right">
                <div
                    class="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-all"
                >
                    <button
                        class="btn btn-square btn-ghost btn-xs rounded-lg hover:bg-base-200"
                    >
                        <Info class="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        {/snippet}
    </DataTable>
</div>
