<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import {
        Plus,
        Edit2,
        Trash2,
        ShieldCheck,
        Calendar,
        Globe,
    } from "lucide-svelte";

    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import StatusBadge from "$lib/components/ui/StatusBadge.svelte";
    import DataTable from "$lib/components/ui/DataTable.svelte";

    let ssls = $state<any[]>([]);
    let loading = $state(true);
    let searchQuery = $state("");
    let pageSize = $state(10);
    let currentPage = $state(1);

    const filteredSSls = $derived(
        ssls.filter(
            (s) =>
                (s.value.snis &&
                    s.value.snis
                        .join(",")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())) ||
                s.value.id.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );

    async function fetchSSLs() {
        loading = true;
        try {
            const data = await apiFetch("ssls");
            ssls = data.list || [];
        } catch (err) {
            console.error("Failed to fetch SSLs:", err);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchSSLs();
    });

    async function deleteSSL(id: string) {
        if (!confirm("Are you sure?")) return;
        try {
            await apiFetch(`ssls/${id}`, { method: "DELETE" });
            fetchSSLs();
        } catch (err) {
            alert("Failed to delete certificate");
        }
    }
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-20">
    <PageHeader
        title="SSL Certificates"
        description="Manage your domain certificates and private keys. High-grade encryption management for multiple domain SNI support."
        badge="TLS/SSL"
        badgeType="error"
    >
        {#snippet actions()}
            <a
                href="/ssl/new"
                class="btn btn-primary btn-md rounded-xl font-black shadow-lg shadow-primary/10 transition-all text-primary-content uppercase text-[10px] tracking-widest"
            >
                <Plus class="w-4 h-4 mr-1" />
                Add Certificate
            </a>
        {/snippet}
    </PageHeader>

    <DataTable
        columns={[
            "Encrypted Domains (SNI)",
            "Security Status",
            "Validity",
            "Operations",
        ]}
        items={filteredSSls}
        {loading}
        showSearch={true}
        searchPlaceholder="Filter by domain or ID..."
        bind:searchValue={searchQuery}
        totalItems={filteredSSls.length}
        bind:pageSize
        {currentPage}
        onPageChange={(p) => (currentPage = p)}
        loadingMessage="Validating chains of trust..."
        emptyMessage="Vault is Empty"
    >
        {#snippet rowSnippet(ssl)}
            <td class="py-4 px-6">
                <div class="flex items-center gap-4">
                    <div class="p-2.5 bg-base-200 rounded-xl text-error/60">
                        <ShieldCheck class="w-4 h-4" />
                    </div>
                    <div>
                        <div class="flex flex-wrap gap-1.5 mb-1">
                            {#each ssl.value.snis || [] as sni}
                                <span
                                    class="text-[9px] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded"
                                >
                                    {sni}
                                </span>
                            {/each}
                        </div>
                        <div
                            class="text-[9px] font-black tracking-widest opacity-30 uppercase"
                        >
                            {ssl.value.id.substring(0, 12)}
                        </div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6">
                <StatusBadge
                    status={ssl.value.status === 1}
                    trueLabel="Protected"
                    falseLabel="Vulnerable"
                    trueType="success"
                    falseType="error"
                >
                    {#snippet subtitle()}
                        <p
                            class="text-[9px] font-bold opacity-40 uppercase tracking-widest leading-none mt-1"
                        >
                            {ssl.value.status === 1
                                ? "Standard Grade"
                                : "Expired / Inactive"}
                        </p>
                    {/snippet}
                </StatusBadge>
            </td>
            <td class="py-4 px-6">
                <div
                    class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40"
                >
                    <Calendar class="w-3 h-3" />
                    <span>Perpetual</span>
                </div>
            </td>
            <td class="py-4 px-6 text-right">
                <div
                    class="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-all"
                >
                    <a
                        href="/ssl/{ssl.value.id}"
                        class="btn btn-square btn-ghost btn-xs rounded-lg hover:bg-base-200"
                    >
                        <Edit2 class="w-3.5 h-3.5" />
                    </a>
                    <button
                        onclick={() => deleteSSL(ssl.value.id)}
                        class="btn btn-square btn-ghost btn-xs rounded-lg hover:bg-error/10 hover:text-error"
                    >
                        <Trash2 class="w-3.5 h-3.5" />
                    </button>
                    <button
                        class="btn btn-square btn-ghost btn-xs rounded-lg hover:bg-base-200"
                    >
                        <Globe class="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        {/snippet}
    </DataTable>
</div>
