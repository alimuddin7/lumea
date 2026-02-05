<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import {
        Save,
        ArrowLeft,
        ShieldCheck,
        Lock,
        Globe,
        Plus,
        Trash2,
    } from "lucide-svelte";
    import { goto } from "$app/navigation";

    let { id } = $props();
    let loading = $state(id !== "new");
    let saving = $state(false);

    let ssl = $state<any>({
        snis: [],
        cert: "",
        key: "",
        status: 1,
    });

    let sniInput = $state("");

    onMount(async () => {
        if (id !== "new") {
            try {
                const data = await apiFetch(`ssls/${id}`);
                ssl = data.value;
            } catch (err) {
                console.error("Failed to fetch SSL:", err);
            } finally {
                loading = false;
            }
        }
    });

    function addSNI() {
        if (sniInput && !ssl.snis.includes(sniInput)) {
            ssl.snis = [...ssl.snis, sniInput];
            sniInput = "";
        }
    }

    function removeSNI(sni: string) {
        ssl.snis = ssl.snis.filter((s: string) => s !== sni);
    }

    async function saveSSL() {
        if (!ssl.snis.length || !ssl.cert || !ssl.key) {
            alert("Please fill in all certificate details.");
            return;
        }
        saving = true;
        try {
            const method = id === "new" ? "POST" : "PUT";
            const path = id === "new" ? "ssls" : `ssls/${id}`;
            await apiFetch(path, {
                method,
                body: ssl,
            });
            goto("/ssl");
        } catch (err: any) {
            alert("Failed to save: " + err.message);
        } finally {
            saving = false;
        }
    }
</script>

<div class="space-y-6 max-w-5xl mx-auto pb-20">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <a
                href="/ssl"
                class="p-2 hover:bg-base-200 rounded-full transition-colors opacity-50"
            >
                <ArrowLeft class="w-4 h-4" />
            </a>
            <h1 class="text-2xl font-black tracking-tighter italic">
                {id === "new" ? "Upload Certificate" : "Edit Certificate"}
            </h1>
        </div>
        <button
            onclick={saveSSL}
            disabled={saving || loading}
            class="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 disabled:opacity-20 text-primary-content font-black rounded-xl transition-all shadow-lg shadow-primary/10 text-xs uppercase tracking-widest"
        >
            {#if saving}
                <div
                    class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
                <span>Syncing...</span>
            {:else}
                <Save class="w-4 h-4" />
                <span>Save Certificate</span>
            {/if}
        </button>
    </div>

    {#if loading}
        <div class="py-32 flex flex-col items-center justify-center opacity-20">
            <div class="loading loading-spinner loading-lg"></div>
            <p class="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">
                Authenticating Payload
            </p>
        </div>
    {:else}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div class="lg:col-span-2 space-y-8">
                <!-- SNI -->
                <section class="section-card">
                    <h2 class="section-title">
                        <div class="flex items-center gap-2">
                            <Globe class="w-4 h-4 text-primary opacity-50" />
                            SNI Domains
                        </div>
                    </h2>
                    <div class="space-y-4">
                        <div class="flex gap-2">
                            <input
                                type="text"
                                bind:value={sniInput}
                                placeholder="e.g. api.domain.com"
                                class="input-minimal flex-1"
                                onkeydown={(e) => e.key === "Enter" && addSNI()}
                            />
                            <button
                                onclick={addSNI}
                                class="btn btn-ghost border border-base-300 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest"
                            >
                                <Plus class="w-3 h-3 mr-1" /> Add
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            {#each ssl.snis as sni}
                                <div
                                    class="flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary rounded-lg border border-primary/10 text-[10px] font-black uppercase tracking-widest"
                                >
                                    {sni}
                                    <button
                                        onclick={() => removeSNI(sni)}
                                        class="hover:text-error transition-colors"
                                    >
                                        <Trash2 class="w-3 h-3" />
                                    </button>
                                </div>
                            {:else}
                                <p
                                    class="text-[10px] font-bold opacity-20 uppercase tracking-widest italic pt-2"
                                >
                                    No domains assigned yet.
                                </p>
                            {/each}
                        </div>
                    </div>
                </section>

                <!-- Cert Data -->
                <section class="section-card">
                    <h2 class="section-title">
                        <div class="flex items-center gap-2">
                            <Lock class="w-4 h-4 text-secondary opacity-50" />
                            Security Payload
                        </div>
                    </h2>
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <label class="label-minimal"
                                >Certificate (PEM)</label
                            >
                            <textarea
                                bind:value={ssl.cert}
                                rows="6"
                                placeholder="-----BEGIN CERTIFICATE-----"
                                class="input-minimal font-mono text-[10px] leading-relaxed py-3 bg-base-200/30"
                            ></textarea>
                        </div>
                        <div class="space-y-1">
                            <label class="label-minimal"
                                >Private Key (PEM)</label
                            >
                            <textarea
                                bind:value={ssl.key}
                                rows="6"
                                placeholder="-----BEGIN PRIVATE KEY-----"
                                class="input-minimal font-mono text-[10px] leading-relaxed py-3 bg-base-200/30"
                            ></textarea>
                        </div>
                    </div>
                </section>
            </div>

            <div class="space-y-6">
                <section class="section-card">
                    <h2 class="section-title">Certification Status</h2>
                    <div
                        class="flex items-center justify-between p-4 bg-base-200/50 rounded-xl border border-base-300/50"
                    >
                        <span
                            class="text-[10px] font-black uppercase tracking-widest opacity-60"
                        >
                            {ssl.status === 1 ? "Active" : "Revoked/Disabled"}
                        </span>
                        <input
                            type="checkbox"
                            class="toggle toggle-primary toggle-sm"
                            checked={ssl.status === 1}
                            onchange={() =>
                                (ssl.status = ssl.status === 1 ? 0 : 1)}
                        />
                    </div>
                </section>
            </div>
        </div>
    {/if}
</div>
