<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Plus, Edit2, Trash2, LayoutGrid, Settings2 } from "lucide-svelte";

    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import DataTable from "$lib/components/ui/DataTable.svelte";

    let groups = $state<any[]>([]);
    let loading = $state(true);
    let searchQuery = $state("");
    let pageSize = $state(10);
    let currentPage = $state(1);

    const filteredGroups = $derived(
        groups.filter(
            (g) =>
                (g.value.name &&
                    g.value.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())) ||
                g.value.id.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );

    async function fetchGroups() {
        loading = true;
        try {
            const data = await apiFetch("consumer_groups");
            groups = data.list || [];
        } catch (err) {
            console.error("Failed to fetch consumer groups:", err);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchGroups();
    });

    async function deleteGroup(id: string) {
        if (!confirm("Are you sure?")) return;
        try {
            await apiFetch(`consumer_groups/${id}`, { method: "DELETE" });
            fetchGroups();
        } catch (err) {
            alert("Failed to delete group");
        }
    }
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-20">
    <PageHeader
        title="Consumer Groups"
        description="Bucket consumers together to apply global authentication and traffic policies."
        badge="AGGREGATION"
        badgeType="secondary"
    >
        {#snippet actions()}
            <a
                href="/consumer-groups/new"
                class="btn btn-primary btn-md rounded-xl font-black shadow-lg shadow-primary/10 transition-all text-primary-content uppercase text-[10px] tracking-widest"
            >
                <Plus class="w-4 h-4 mr-1" />
                Create Group
            </a>
        {/snippet}
    </PageHeader>

    <DataTable
        columns={["Group Identity", "Plugins", "Operations"]}
        items={filteredGroups}
        {loading}
        showSearch={true}
        searchPlaceholder="Filter by name, ID..."
        bind:searchValue={searchQuery}
        totalItems={filteredGroups.length}
        bind:pageSize
        {currentPage}
        onPageChange={(p) => (currentPage = p)}
        loadingMessage="Scaling groups..."
        emptyMessage="No consumer groups found."
    >
        {#snippet rowSnippet(group)}
            <td class="py-4 px-6">
                <div class="flex items-center gap-4">
                    <div class="p-2.5 bg-base-200 rounded-xl text-primary/40">
                        <LayoutGrid class="w-4 h-4" />
                    </div>
                    <div>
                        <div
                            class="font-bold text-sm tracking-tight text-base-content/90"
                        >
                            {group.value.id}
                        </div>
                        <div
                            class="text-[9px] font-black tracking-widest opacity-30 mt-0.5 uppercase"
                        >
                            POLICY CONTAINER
                        </div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex flex-wrap gap-1">
                    {#each Object.keys(group.value.plugins || {}) as pluginName}
                        <span
                            class="text-[8px] font-black uppercase text-secondary bg-secondary/10 px-1.5 py-0.5 rounded"
                        >
                            {pluginName}
                        </span>
                    {/each}
                    {#if Object.keys(group.value.plugins || {}).length === 0}
                        <span
                            class="text-[9px] font-black uppercase tracking-widest opacity-10"
                            >Baseline Policies</span
                        >
                    {/if}
                </div>
            </td>
            <td class="py-4 px-6 text-right">
                <div
                    class="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-all"
                >
                    <a
                        href="/consumer-groups/{group.value.id}"
                        class="btn btn-square btn-ghost btn-xs rounded-lg hover:bg-base-200"
                    >
                        <Edit2 class="w-3.5 h-3.5" />
                    </a>
                    <button
                        onclick={() => deleteGroup(group.value.id)}
                        class="btn btn-square btn-ghost btn-xs rounded-lg hover:bg-error/10 hover:text-error"
                    >
                        <Trash2 class="w-3.5 h-3.5" />
                    </button>
                    <button
                        class="btn btn-square btn-ghost btn-xs rounded-lg hover:bg-base-200"
                    >
                        <Settings2 class="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        {/snippet}
    </DataTable>
</div>
