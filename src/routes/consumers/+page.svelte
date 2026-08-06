<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Plus, Edit2, Trash2, Fingerprint, Users } from "lucide-svelte";

    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import DataTable from "$lib/components/ui/DataTable.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";

    let consumers = $state<any[]>([]);
    let loading = $state(true);
    let searchQuery = $state("");
    let pageSize = $state(10);
    let currentPage = $state(1);

    const filteredConsumers = $derived(
        consumers.filter(
            (c) =>
                c.value.username
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (c.value.custom_id &&
                    c.value.custom_id
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())),
        ),
    );

    async function fetchConsumers() {
        loading = true;
        try {
            const data = await apiFetch("consumers");
            consumers = data.list || [];
        } catch (err) {
            console.error("Failed to fetch consumers:", err);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchConsumers();
    });

    async function deleteConsumer(username: string) {
        if (!confirm("Are you sure you want to delete this consumer?")) return;
        try {
            await apiFetch(`consumers/${username}`, { method: "DELETE" });
            fetchConsumers();
        } catch (err) {
            alert("Failed to delete consumer");
        }
    }
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-20">
    <PageHeader
        title="Consumers & Identity"
        description="Identity management for API consumers, credentials, rate limit quotas, and access tokens."
        badge="Security"
    >
        {#snippet actions()}
            <a href="/consumers/new">
                <Button variant="default" size="sm" class="gap-1.5 shadow-sm">
                    <Plus class="w-4 h-4" />
                    <span>Create Consumer</span>
                </Button>
            </a>
        {/snippet}
    </PageHeader>

    <DataTable
        columns={["Identity Profile", "Custom Reference ID", "Auth Policies", "Actions"]}
        items={filteredConsumers}
        {loading}
        showSearch={true}
        searchPlaceholder="Search by username or custom ID..."
        bind:searchValue={searchQuery}
        totalItems={filteredConsumers.length}
        bind:pageSize
        {currentPage}
        onPageChange={(p) => (currentPage = p)}
        loadingMessage="Syncing consumer entities..."
        emptyMessage="No APISIX consumers found."
    >
        {#snippet rowSnippet(consumer)}
            <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                    <div class="p-2 rounded-lg bg-primary/10 text-primary">
                        <Users class="w-4 h-4" />
                    </div>
                    <div>
                        <div class="font-semibold text-xs text-foreground">
                            {consumer.value.username}
                        </div>
                        <div class="text-[10px] text-muted-foreground mt-0.5">
                            Verified APISIX Entity
                        </div>
                    </div>
                </div>
            </td>

            <td class="py-3.5 px-4">
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <Fingerprint class="w-3.5 h-3.5" />
                    <span>{consumer.value.custom_id || "N/A"}</span>
                </div>
            </td>

            <td class="py-3.5 px-4">
                <div class="flex flex-wrap gap-1">
                    {#if consumer.value.plugins && Object.keys(consumer.value.plugins).length > 0}
                        {#each Object.keys(consumer.value.plugins) as plugin}
                            <Badge variant="secondary" class="text-[9px] py-0 font-mono">
                                {plugin}
                            </Badge>
                        {/each}
                    {:else}
                        <span class="text-xs text-muted-foreground italic">No Auth Policy</span>
                    {/if}
                </div>
            </td>

            <td class="py-3.5 px-4">
                <div class="flex items-center justify-end gap-1">
                    <a href="/consumers/{consumer.value.username}">
                        <Button variant="ghost" size="icon" class="h-7 w-7" title="Edit Consumer">
                            <Edit2 class="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                    </a>
                    <Button
                        variant="ghost"
                        size="icon"
                        class="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                        onclick={() => deleteConsumer(consumer.value.username)}
                        title="Delete Consumer"
                    >
                        <Trash2 class="w-3.5 h-3.5" />
                    </Button>
                </div>
            </td>
        {/snippet}
    </DataTable>
</div>
