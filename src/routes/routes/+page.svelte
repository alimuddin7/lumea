<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import {
        Plus,
        Edit2,
        Trash2,
        MoreVertical,
        Database,
        Server,
        Globe
    } from "lucide-svelte";

    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import StatusBadge from "$lib/components/ui/StatusBadge.svelte";
    import DataTable from "$lib/components/ui/DataTable.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";

    let routes = $state<any[]>([]);
    let loading = $state(true);
    let searchQuery = $state("");
    let pageSize = $state(10);
    let currentPage = $state(1);

    const filteredRoutes = $derived(
        routes.filter(
            (route) =>
                route.value.uri
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (route.value.name &&
                    route.value.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())),
        ),
    );

    async function fetchRoutes() {
        loading = true;
        try {
            const data = await apiFetch("routes");
            routes = data.list || [];
        } catch (err) {
            console.error("Failed to fetch routes:", err);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchRoutes();
    });

    async function deleteRoute(id: string) {
        if (!confirm("Are you sure you want to delete this route?")) return;
        try {
            await apiFetch(`routes/${id}`, { method: "DELETE" });
            fetchRoutes();
        } catch (err) {
            alert("Failed to delete route");
        }
    }
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-20">
    <PageHeader
        title="Routes Management"
        description="Traffic matching rules, URI routing, and upstream service destinations."
        badge="Live"
    >
        {#snippet actions()}
            <a href="/routes/new">
                <Button variant="default" size="sm" class="gap-1.5 shadow-sm">
                    <Plus class="w-4 h-4" />
                    <span>Create New Route</span>
                </Button>
            </a>
        {/snippet}
    </PageHeader>

    <DataTable
        columns={[
            "Route Identity",
            "Matching Rules",
            "Upstream / Target",
            "Status",
            "Actions",
        ]}
        items={filteredRoutes}
        {loading}
        showSearch={true}
        searchPlaceholder="Filter routes by name or URI..."
        bind:searchValue={searchQuery}
        totalItems={filteredRoutes.length}
        bind:pageSize
        {currentPage}
        onPageChange={(p) => (currentPage = p)}
        loadingMessage="Syncing APISIX configuration..."
        emptyMessage="No APISIX routes found."
    >
        {#snippet rowSnippet(route)}
            <td class="py-3.5 px-4">
                <div>
                    <div class="font-semibold text-xs text-foreground">
                        {route.value.name || "Unnamed Route"}
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-[10px] font-mono text-muted-foreground">
                            ID: {route.value.id?.substring(0, 8)}
                        </span>
                        {#if route.value.plugins && Object.keys(route.value.plugins).length > 0}
                            <Badge variant="secondary" class="text-[9px] py-0">
                                {Object.keys(route.value.plugins).length} Plugins
                            </Badge>
                        {/if}
                    </div>
                </div>
            </td>

            <td class="py-3.5 px-4">
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-semibold text-muted-foreground uppercase w-7">URI</span>
                        <code class="text-xs font-mono text-primary font-medium px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                            {route.value.uri || route.value.uris?.join(", ") || "/*"}
                        </code>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-semibold text-muted-foreground uppercase w-7">MTH</span>
                        <div class="flex flex-wrap gap-1">
                            {#each route.value.methods || ["ALL"] as method}
                                <Badge
                                    variant={method === 'GET' ? 'success' : method === 'POST' ? 'secondary' : 'outline'}
                                    class="text-[9px] py-0 uppercase"
                                >
                                    {method}
                                </Badge>
                            {/each}
                        </div>
                    </div>
                </div>
            </td>

            <td class="py-3.5 px-4">
                <div class="flex flex-col gap-1 text-xs">
                    {#if route.value.upstream_id}
                        <div class="flex items-center gap-1.5 text-foreground font-medium">
                            <Database class="w-3.5 h-3.5 text-primary" />
                            <span>Upstream: {route.value.upstream_id}</span>
                        </div>
                    {:else if route.value.service_id}
                        <div class="flex items-center gap-1.5 text-foreground font-medium">
                            <Server class="w-3.5 h-3.5 text-primary" />
                            <span>Service: {route.value.service_id}</span>
                        </div>
                    {:else if route.value.upstream}
                        <div class="flex items-center gap-1.5 text-foreground font-medium">
                            <Database class="w-3.5 h-3.5 text-emerald-400" />
                            <span>Inline ({route.value.upstream.type || "Roundrobin"})</span>
                        </div>
                    {:else}
                        <span class="text-muted-foreground text-xs italic">None</span>
                    {/if}
                </div>
            </td>

            <td class="py-3.5 px-4">
                <StatusBadge status={route.value.status ?? 1} />
            </td>

            <td class="py-3.5 px-4">
                <div class="flex items-center justify-end gap-1">
                    <a href="/routes/{route.value.id}">
                        <Button variant="ghost" size="icon" class="h-7 w-7" title="Edit Route">
                            <Edit2 class="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                    </a>
                    <Button
                        variant="ghost"
                        size="icon"
                        class="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                        onclick={() => deleteRoute(route.value.id)}
                        title="Delete Route"
                    >
                        <Trash2 class="w-3.5 h-3.5" />
                    </Button>
                </div>
            </td>
        {/snippet}
    </DataTable>
</div>
