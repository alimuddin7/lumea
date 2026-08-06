<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Plus, Edit2, Trash2, Database, Server } from "lucide-svelte";

    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import DataTable from "$lib/components/ui/DataTable.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";

    let upstreams = $state<any[]>([]);
    let loading = $state(true);
    let searchQuery = $state("");
    let pageSize = $state(10);
    let currentPage = $state(1);

    const filteredUpstreams = $derived(
        upstreams.filter(
            (u) =>
                (u.value.name &&
                    u.value.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())) ||
                u.value.id.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );

    async function fetchUpstreams() {
        loading = true;
        try {
            const data = await apiFetch("upstreams");
            upstreams = data.list || [];
        } catch (err) {
            console.error("Failed to fetch upstreams:", err);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchUpstreams();
    });

    async function deleteUpstream(id: string) {
        if (!confirm("Are you sure you want to delete this upstream?")) return;
        try {
            await apiFetch(`upstreams/${id}`, { method: "DELETE" });
            fetchUpstreams();
        } catch (err) {
            alert("Failed to delete upstream");
        }
    }
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-20">
    <PageHeader
        title="Upstreams & Targets"
        description="Backend target nodes, health checking, and load balancing algorithm configuration."
        badge="Infrastructure"
    >
        {#snippet actions()}
            <a href="/upstreams/new">
                <Button variant="default" size="sm" class="gap-1.5 shadow-sm">
                    <Plus class="w-4 h-4" />
                    <span>Create Upstream</span>
                </Button>
            </a>
        {/snippet}
    </PageHeader>

    <DataTable
        columns={["Target Identity", "Active Nodes", "Algorithm Strategy", "Actions"]}
        items={filteredUpstreams}
        {loading}
        showSearch={true}
        searchPlaceholder="Filter upstreams by name, ID, or IP..."
        bind:searchValue={searchQuery}
        totalItems={filteredUpstreams.length}
        bind:pageSize
        {currentPage}
        onPageChange={(p) => (currentPage = p)}
        loadingMessage="Syncing backend clusters..."
        emptyMessage="No APISIX upstreams found."
    >
        {#snippet rowSnippet(upstream)}
            <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                    <div class="p-2 rounded-lg bg-primary/10 text-primary">
                        <Database class="w-4 h-4" />
                    </div>
                    <div>
                        <div class="font-semibold text-xs text-foreground">
                            {upstream.value.name || "Unnamed Upstream"}
                        </div>
                        <div class="text-[10px] font-mono text-muted-foreground mt-0.5">
                            ID: {upstream.value.id.substring(0, 12)}
                        </div>
                    </div>
                </div>
            </td>

            <td class="py-3.5 px-4">
                <div class="flex items-center gap-2">
                    <Badge variant="outline" class="text-[10px] font-mono">
                        {(upstream.value.nodes || []).length} Active Nodes
                    </Badge>
                </div>
            </td>

            <td class="py-3.5 px-4">
                <Badge variant="secondary" class="uppercase text-[10px] font-semibold">
                    {upstream.value.type || "Roundrobin"}
                </Badge>
            </td>

            <td class="py-3.5 px-4">
                <div class="flex items-center justify-end gap-1">
                    <a href="/upstreams/{upstream.value.id}">
                        <Button variant="ghost" size="icon" class="h-7 w-7" title="Edit Upstream">
                            <Edit2 class="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                    </a>
                    <Button
                        variant="ghost"
                        size="icon"
                        class="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                        onclick={() => deleteUpstream(upstream.value.id)}
                        title="Delete Upstream"
                    >
                        <Trash2 class="w-3.5 h-3.5" />
                    </Button>
                </div>
            </td>
        {/snippet}
    </DataTable>
</div>
