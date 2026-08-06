<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Plus, Edit2, Trash2, Server, ArrowRight } from "lucide-svelte";

    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import DataTable from "$lib/components/ui/DataTable.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";

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
        if (!confirm("Are you sure you want to delete this service?")) return;
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
        title="Services Abstraction"
        description="Reusable plugin configurations and upstream mappings across multiple routes."
        badge="Abstraction"
    >
        {#snippet actions()}
            <a href="/services/new">
                <Button variant="default" size="sm" class="gap-1.5 shadow-sm">
                    <Plus class="w-4 h-4" />
                    <span>Create Service</span>
                </Button>
            </a>
        {/snippet}
    </PageHeader>

    <DataTable
        columns={["Service Identity", "Mapped Upstream", "Shared Plugins", "Actions"]}
        items={filteredServices}
        {loading}
        showSearch={true}
        searchPlaceholder="Filter services by name or ID..."
        bind:searchValue={searchQuery}
        totalItems={filteredServices.length}
        bind:pageSize
        {currentPage}
        onPageChange={(p) => (currentPage = p)}
        loadingMessage="Syncing services..."
        emptyMessage="No APISIX services found."
    >
        {#snippet rowSnippet(service)}
            <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                    <div class="p-2 rounded-lg bg-primary/10 text-primary">
                        <Server class="w-4 h-4" />
                    </div>
                    <div>
                        <div class="font-semibold text-xs text-foreground">
                            {service.value.name || "Unnamed Service"}
                        </div>
                        <div class="text-[10px] font-mono text-muted-foreground mt-0.5">
                            ID: {service.value.id.substring(0, 12)}
                        </div>
                    </div>
                </div>
            </td>

            <td class="py-3.5 px-4">
                <div class="flex items-center gap-1.5 text-xs text-foreground font-medium">
                    <span>{service.value.upstream_id || "Direct Upstream"}</span>
                    {#if service.value.upstream_id}
                        <ArrowRight class="w-3 h-3 text-muted-foreground" />
                    {/if}
                </div>
            </td>

            <td class="py-3.5 px-4">
                <div class="flex flex-wrap gap-1">
                    {#each Object.keys(service.value.plugins || {}) as pluginName}
                        <Badge variant="secondary" class="text-[9px] py-0 font-mono">
                            {pluginName}
                        </Badge>
                    {/each}
                    {#if Object.keys(service.value.plugins || {}).length === 0}
                        <span class="text-xs text-muted-foreground italic">No shared plugins</span>
                    {/if}
                </div>
            </td>

            <td class="py-3.5 px-4">
                <div class="flex items-center justify-end gap-1">
                    <a href="/services/{service.value.id}">
                        <Button variant="ghost" size="icon" class="h-7 w-7" title="Edit Service">
                            <Edit2 class="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                    </a>
                    <Button
                        variant="ghost"
                        size="icon"
                        class="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                        onclick={() => deleteService(service.value.id)}
                        title="Delete Service"
                    >
                        <Trash2 class="w-3.5 h-3.5" />
                    </Button>
                </div>
            </td>
        {/snippet}
    </DataTable>
</div>
