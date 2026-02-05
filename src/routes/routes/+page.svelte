<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Plus, Edit2, Trash2, MoreVertical } from "lucide-svelte";

    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import StatusBadge from "$lib/components/ui/StatusBadge.svelte";
    import DataTable from "$lib/components/ui/DataTable.svelte";

    let routes = $state<any[]>([]);
    let loading = $state(true);
    let searchQuery = $state("");
    let pageSize = $state(10);
    let currentPage = $state(1);

    const filteredRoutes = $derived(
        routes.filter(
            (route) =>
                route.value.uri
                    .toLowerCase()
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
        title="Routes"
        description="Traffic matching rules and upstream destinations."
        badge="Live"
    >
        {#snippet actions()}
            <a
                href="/routes/new"
                class="btn btn-primary btn-md rounded-xl font-black shadow-lg shadow-primary/10 transition-all text-[10px] uppercase tracking-widest text-primary-content"
            >
                <Plus class="w-4 h-4 mr-1" />
                Create New
            </a>
        {/snippet}
    </PageHeader>

    <DataTable
        columns={[
            "Route Identity",
            "Matching Rules",
            "Connectivity",
            "Operations",
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
        loadingMessage="Syncing configuration..."
        emptyMessage="No routes found."
    >
        {#snippet rowSnippet(route)}
            <td class="py-4 px-6">
                <div>
                    <div
                        class="font-bold text-sm tracking-tight text-base-content/90"
                    >
                        {route.value.name || "Unnamed"}
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                        <span
                            class="text-[9px] font-black uppercase tracking-[0.1em] opacity-30"
                        >
                            {route.value.id.substring(0, 8)}
                        </span>
                        {#if route.value.plugins && Object.keys(route.value.plugins).length > 0}
                            <div
                                class="flex items-center gap-1 text-[9px] font-black text-secondary uppercase tracking-widest"
                            >
                                {Object.keys(route.value.plugins).length} Plugins
                            </div>
                        {/if}
                    </div>
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex flex-col gap-1.5">
                    <div class="flex items-center gap-2">
                        <span
                            class="text-[9px] font-black uppercase opacity-20 w-6"
                            >URI</span
                        >
                        <code
                            class="text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/5 rounded border border-primary/5"
                        >
                            {route.value.uri}
                        </code>
                    </div>
                    <div class="flex items-center gap-2">
                        <span
                            class="text-[9px] font-black uppercase opacity-20 w-6"
                            >MTH</span
                        >
                        <div class="flex flex-wrap gap-1">
                            {#each route.value.methods || ["ALL"] as method}
                                <span
                                    class="text-[8px] font-black uppercase tracking-widest {method ===
                                    'GET'
                                        ? 'text-success'
                                        : method === 'POST'
                                          ? 'text-info'
                                          : 'opacity-40'}"
                                >
                                    {method}
                                </span>
                            {/each}
                        </div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6">
                <StatusBadge status={route.value.status ?? 1} />
            </td>
            <td class="py-4 px-6">
                <div
                    class="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-all"
                >
                    <a
                        href="/routes/{route.value.id}"
                        class="btn btn-square btn-ghost btn-xs hover:bg-base-200"
                    >
                        <Edit2 class="w-3.5 h-3.5" />
                    </a>
                    <button
                        onclick={() => deleteRoute(route.value.id)}
                        class="btn btn-square btn-ghost btn-xs hover:bg-error/10 hover:text-error"
                    >
                        <Trash2 class="w-3.5 h-3.5" />
                    </button>
                    <div class="dropdown dropdown-end">
                        <div
                            tabindex="0"
                            role="button"
                            class="btn btn-square btn-ghost btn-xs hover:bg-base-200"
                        >
                            <MoreVertical class="w-3.5 h-3.5" />
                        </div>
                        <ul
                            tabindex="0"
                            class="dropdown-content z-[2] menu p-2 shadow-2xl bg-base-100 rounded-xl w-48 border border-base-300 mt-2"
                        >
                            <li>
                                <a
                                    class="text-[10px] font-black uppercase tracking-widest py-2"
                                    >View Metrics</a
                                >
                            </li>
                            <li>
                                <a
                                    class="text-[10px] font-black uppercase tracking-widest py-2"
                                    >Security Audit</a
                                >
                            </li>
                        </ul>
                    </div>
                </div>
            </td>
        {/snippet}
    </DataTable>
</div>
