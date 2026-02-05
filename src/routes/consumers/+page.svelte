<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import {
        Plus,
        Edit2,
        Trash2,
        Fingerprint,
        ExternalLink,
    } from "lucide-svelte";

    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import DataTable from "$lib/components/ui/DataTable.svelte";

    let consumers = $state<any[]>([]);
    let loading = $state(true);
    let searchQuery = $state("");
    let pageSize = $state(10);
    let currentPage = $state(1);

    const filteredConsumers = $derived(
        consumers.filter(
            (c) =>
                c.value.username
                    .toLowerCase()
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
        if (!confirm("Are you sure?")) return;
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
        title="Consumers"
        description="Identity management for your API users. Assign specific credentials, rate limits, and restricted access for each entity."
        badge="SECURITY ENTITIES"
        badgeType="accent"
    >
        {#snippet actions()}
            <a
                href="/consumers/new"
                class="btn btn-primary btn-md rounded-xl font-black shadow-lg shadow-primary/10 transition-all text-primary-content uppercase text-[10px] tracking-widest"
            >
                <Plus class="w-4 h-4 mr-1" />
                Create Consumer
            </a>
        {/snippet}
    </PageHeader>

    <DataTable
        columns={[
            "Identity Profile",
            "External Reference",
            "Auth Policy",
            "Operations",
        ]}
        items={filteredConsumers}
        {loading}
        showSearch={true}
        searchPlaceholder="Search by username or custom ID..."
        bind:searchValue={searchQuery}
        totalItems={filteredConsumers.length}
        bind:pageSize
        {currentPage}
        onPageChange={(p) => (currentPage = p)}
        loadingMessage="Hydrating user entities..."
        emptyMessage="No Consumers Found"
    >
        {#snippet rowSnippet(consumer)}
            <td class="py-4 px-6">
                <div>
                    <div
                        class="font-bold text-sm tracking-tight text-base-content/90"
                    >
                        {consumer.value.username}
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                        <span
                            class="text-[9px] font-black uppercase tracking-[0.1em] opacity-30"
                        >
                            Verified Entity
                        </span>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex items-center gap-2">
                    <Fingerprint class="w-3.5 h-3.5 opacity-20" />
                    <span class="text-xs font-bold opacity-60">
                        {consumer.value.custom_id || "NOT-LINKED"}
                    </span>
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex flex-wrap gap-1">
                    {#if consumer.value.plugins && Object.keys(consumer.value.plugins).length > 0}
                        {#each Object.keys(consumer.value.plugins) as plugin}
                            <div
                                class="badge badge-neutral badge-xs font-black text-[8px] px-2 py-2 uppercase tracking-tight opacity-70"
                            >
                                {plugin.replace("-auth", "")}
                            </div>
                        {/each}
                    {:else}
                        <span class="text-[10px] font-bold opacity-20 italic"
                            >No credentials</span
                        >
                    {/if}
                </div>
            </td>
            <td class="py-4 px-6 text-right">
                <div class="flex justify-end gap-1">
                    <a
                        href="/consumers/{consumer.value.username}"
                        class="btn btn-square btn-ghost btn-xs hover:text-primary hover:bg-primary/10 rounded-lg"
                    >
                        <Edit2 class="w-3.5 h-3.5" />
                    </a>
                    <button
                        onclick={() => deleteConsumer(consumer.value.username)}
                        class="btn btn-square btn-ghost btn-xs hover:text-error hover:bg-error/10 rounded-lg"
                    >
                        <Trash2 class="w-3.5 h-3.5" />
                    </button>
                    <button
                        class="btn btn-square btn-ghost btn-xs rounded-lg opacity-20 hover:opacity-100"
                    >
                        <ExternalLink class="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        {/snippet}
    </DataTable>
</div>
