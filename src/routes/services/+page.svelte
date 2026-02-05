<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import {
        Plus,
        Edit2,
        Trash2,
        Server,
        Settings2,
        ArrowRight,
    } from "lucide-svelte";

    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import DataTable from "$lib/components/ui/DataTable.svelte";

    let services = $state<any[]>([]);
    let loading = $state(true);
    let searchQuery = $state("");
    let pageSize = $state(10);
    let currentPage = $state(1);

    const filteredServices = $derived(
        services.filter(
            (s) =>
                (s.value.name &&
                    s.value.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())) ||
                s.value.id.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );

    async function fetchServices() {
        loading = true;
        try {
            const data = await apiFetch("services");
            services = data.list || [];
        } catch (err) {
            console.error("Failed to fetch services:", err);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchServices();
    });

    async function deleteService(id: string) {
        if (!confirm("Are you sure?")) return;
        try {
            await apiFetch(`services/${id}`, { method: "DELETE" });
            fetchServices();
        } catch (err) {
            alert("Failed to delete service");
        }
    }
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-20">
    <PageHeader
        title="Services"
        description="Encapsulate common plugins and upstreams for reusable routing logic."
        badge="ABSTRACTION"
        badgeType="secondary"
    >
        {#snippet actions()}
            <a
                href="/services/new"
                class="btn btn-primary btn-md rounded-xl font-black shadow-lg shadow-primary/10 transition-all text-primary-content uppercase text-[10px] tracking-widest"
            >
                <Plus class="w-4 h-4 mr-1" />
                Create Service
            </a>
        {/snippet}
    </PageHeader>

    <DataTable
        columns={["Service Identity", "Upstream", "Plugins", "Operations"]}
        items={filteredServices}
        {loading}
        showSearch={true}
        searchPlaceholder="Filter by name, ID..."
        bind:searchValue={searchQuery}
        totalItems={filteredServices.length}
        bind:pageSize
        {currentPage}
        onPageChange={(p) => (currentPage = p)}
        loadingMessage="Retrieving services..."
        emptyMessage="No services found."
    >
        {#snippet rowSnippet(service)}
            <td class="py-4 px-6">
                <div class="flex items-center gap-4">
                    <div class="p-2.5 bg-base-200 rounded-xl text-primary/40">
                        <Server class="w-4 h-4" />
                    </div>
                    <div>
                        <div
                            class="font-bold text-sm tracking-tight text-base-content/90"
                        >
                            {service.value.name || "Unnamed"}
                        </div>
                        <div
                            class="text-[9px] font-black tracking-widest opacity-30 mt-0.5 uppercase"
                        >
                            {service.value.id.substring(0, 12)}
                        </div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center gap-2">
                    <span
                        class="text-[10px] font-black uppercase tracking-widest opacity-40"
                    >
                        {service.value.upstream_id || "Direct Nodes"}
                    </span>
                    {#if service.value.upstream_id}
                        <ArrowRight class="w-3 h-3 opacity-20" />
                    {/if}
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex flex-wrap gap-1">
                    {#each Object.keys(service.value.plugins || {}) as pluginName}
                        <span
                            class="text-[8px] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded"
                        >
                            {pluginName}
                        </span>
                    {/each}
                    {#if Object.keys(service.value.plugins || {}).length === 0}
                        <span
                            class="text-[9px] font-black uppercase tracking-widest opacity-10"
                            >Pure Proxy</span
                        >
                    {/if}
                </div>
            </td>
            <td class="py-4 px-6 text-right">
                <div
                    class="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-all"
                >
                    <a
                        href="/services/{service.value.id}"
                        class="btn btn-square btn-ghost btn-xs rounded-lg hover:bg-base-200"
                    >
                        <Edit2 class="w-3.5 h-3.5" />
                    </a>
                    <button
                        onclick={() => deleteService(service.value.id)}
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
