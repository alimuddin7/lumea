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
    import Button from "$lib/components/ui/Button.svelte";

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
            <a href="/ssl/new">
                <Button size="sm" class="gap-1.5 h-9 text-xs shadow-md font-bold">
                    <Plus class="w-4 h-4" />
                    <span>Add Certificate</span>
                </Button>
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
                    <div class="p-2.5 bg-primary/10 rounded-xl text-primary font-bold">
                        <ShieldCheck class="w-4 h-4" />
                    </div>
                    <div>
                        <div class="flex flex-wrap gap-1.5 mb-1">
                            {#each ssl.value.snis || [] as sni}
                                <span
                                    class="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20"
                                >
                                    {sni}
                                </span>
                            {/each}
                        </div>
                        <div
                            class="text-[10px] font-mono text-muted-foreground"
                        >
                            ID: {ssl.value.id.substring(0, 12)}
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
                            class="text-[10px] font-semibold text-muted-foreground leading-none mt-1"
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
                    class="flex items-center gap-2 text-xs text-muted-foreground font-semibold"
                >
                    <Calendar class="w-3.5 h-3.5" />
                    <span>Perpetual</span>
                </div>
            </td>
            <td class="py-4 px-6 text-right">
                <div class="flex justify-end items-center gap-2">
                    <a href="/ssl/{ssl.value.id}">
                        <Button variant="outline" size="xs" class="h-8 text-xs font-bold">
                            <Edit2 class="w-3.5 h-3.5 mr-1" />
                            <span>Edit</span>
                        </Button>
                    </a>
                    <Button
                        variant="destructive"
                        size="xs"
                        onclick={() => deleteSSL(ssl.value.id)}
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
