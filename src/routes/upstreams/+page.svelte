<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Plus, Edit2, Trash2, Database, Settings2 } from "lucide-svelte";

    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import DataTable from "$lib/components/ui/DataTable.svelte";

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
        if (!confirm("Are you sure?")) return;
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
        title="Upstreams"
        description="Target nodes and load balancing strategies for your proxy destinations."
        badge="INFRASTRUCTURE"
        badgeType="secondary"
    >
        {#snippet actions()}
            <a
                href="/upstreams/new"
                class="btn btn-primary btn-md rounded-xl font-black shadow-lg shadow-primary/10 transition-all text-primary-content uppercase text-[10px] tracking-widest"
            >
                <Plus class="w-4 h-4 mr-1" />
                Create Upstream
            </a>
        {/snippet}
    </PageHeader>

    <DataTable
        columns={["Target Identity", "Active Nodes", "Algorithm", "Operations"]}
        items={filteredUpstreams}
        {loading}
        showSearch={true}
        searchPlaceholder="Filter by name, ID, or IP..."
        bind:searchValue={searchQuery}
        totalItems={filteredUpstreams.length}
        bind:pageSize
        {currentPage}
        onPageChange={(p) => (currentPage = p)}
        loadingMessage="Scaling clusters..."
        emptyMessage="No upstreams found."
    >
        {#snippet rowSnippet(upstream)}
            <td class="py-4 px-6">
                <div class="flex items-center gap-4">
                    <div class="p-2.5 bg-base-200 rounded-xl text-primary/40">
                        <Database class="w-4 h-4" />
                    </div>
                    <div>
                        <div
                            class="font-bold text-sm tracking-tight text-base-content/90"
                        >
                            {upstream.value.name || "Unnamed"}
                        </div>
                        <div
                            class="text-[9px] font-black tracking-widest opacity-30 mt-0.5 uppercase"
                        >
                            {upstream.value.id.substring(0, 12)}
                        </div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center gap-2">
                    <div class="flex -space-x-1.5">
                        {#each (upstream.value.nodes || []).slice(0, 3) as node}
                            <div
                                class="w-6 h-6 rounded-full bg-base-200 border border-base-100 flex items-center justify-center shadow-sm"
                            >
                                <span class="text-[7px] font-black opacity-40"
                                    >{node.port.toString().slice(-2)}</span
                                >
                            </div>
                        {/each}
                        {#if (upstream.value.nodes || []).length > 3}
                            <div
                                class="w-6 h-6 rounded-full bg-primary text-primary-content border border-base-100 flex items-center justify-center shadow-sm"
                            >
                                <span class="text-[7px] font-black"
                                    >+{(upstream.value.nodes || []).length -
                                        3}</span
                                >
                            </div>
                        {/if}
                    </div>
                    <span
                        class="text-[9px] font-black uppercase opacity-20 tracking-widest ml-1"
                    >
                        {(upstream.value.nodes || []).length} Targets
                    </span>
                </div>
            </td>
            <td
                class="py-4 px-6 text-[10px] font-black uppercase tracking-widest italic opacity-40"
            >
                {upstream.value.type}
            </td>
            <td class="py-4 px-6 text-right">
                <div
                    class="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-all"
                >
                    <a
                        href="/upstreams/{upstream.value.id}"
                        class="btn btn-square btn-ghost btn-xs rounded-lg hover:bg-base-200"
                    >
                        <Edit2 class="w-3.5 h-3.5" />
                    </a>
                    <button
                        onclick={() => deleteUpstream(upstream.value.id)}
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
