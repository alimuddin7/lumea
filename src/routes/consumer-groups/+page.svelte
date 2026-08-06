<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Plus, Edit2, Trash2, LayoutGrid, Settings2 } from "lucide-svelte";

    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import DataTable from "$lib/components/ui/DataTable.svelte";
    import Button from "$lib/components/ui/Button.svelte";

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
            <a href="/consumer-groups/new">
                <Button size="sm" class="gap-1.5 h-9 text-xs font-bold shadow-md">
                    <Plus class="w-4 h-4" />
                    <span>Create Group</span>
                </Button>
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
                    <div class="p-2.5 bg-primary/10 rounded-xl text-primary font-bold">
                        <LayoutGrid class="w-4 h-4" />
                    </div>
                    <div>
                        <div
                            class="font-bold text-sm tracking-tight text-foreground"
                        >
                            {group.value.id}
                        </div>
                        <div
                            class="text-[10px] font-mono text-muted-foreground mt-0.5"
                        >
                            Policy Container
                        </div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex flex-wrap gap-1.5">
                    {#each Object.keys(group.value.plugins || {}) as pluginName}
                        <span
                            class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20"
                        >
                            {pluginName}
                        </span>
                    {/each}
                    {#if Object.keys(group.value.plugins || {}).length === 0}
                        <span
                            class="text-xs text-muted-foreground italic"
                            >Baseline Policies</span
                        >
                    {/if}
                </div>
            </td>
            <td class="py-4 px-6 text-right">
                <div class="flex justify-end items-center gap-2">
                    <a href="/consumer-groups/{group.value.id}">
                        <Button variant="outline" size="xs" class="h-8 text-xs font-bold">
                            <Edit2 class="w-3.5 h-3.5 mr-1" />
                            <span>Edit</span>
                        </Button>
                    </a>
                    <Button
                        variant="destructive"
                        size="xs"
                        onclick={() => deleteGroup(group.value.id)}
                        class="h-8 text-xs font-bold"
                    >
                        <Trash2 class="w-3.5 h-3.5 mr-1" />
                        <span>Delete</span>
                    </Button>
                </div>
            </td>
        {/snippet}
    </DataTable>
</div>
