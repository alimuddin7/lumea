<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Save, ArrowLeft, ShieldCheck, Lock, Globe, Plus, Trash2, Loader2 } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import Card from "$lib/components/ui/Card.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Switch from "$lib/components/ui/Switch.svelte";

    let { id } = $props();
    let loading = $state(false);
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
            loading = true;
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
            alert("Please fill in SNI, certificate, and private key.");
            return;
        }
        saving = true;
        try {
            const method = id === "new" ? "POST" : "PUT";
            const path = id === "new" ? "ssls" : `ssls/${id}`;
            await apiFetch(path, {
                method,
                body: JSON.stringify(ssl),
            });
            goto("/ssl");
        } catch (err: any) {
            alert("Failed to save certificate: " + err.message);
        } finally {
            saving = false;
        }
    }
</script>

<div class="space-y-6 max-w-4xl mx-auto pb-20">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <a href="/ssl">
                <Button variant="ghost" size="icon" class="h-9 w-9">
                    <ArrowLeft class="w-4 h-4" />
                </Button>
            </a>
            <div>
                <h1 class="text-xl font-bold tracking-tight text-foreground">
                    {id === "new" ? "Upload SSL/TLS Certificate" : "Edit SSL Certificate"}
                </h1>
                <p class="text-xs text-muted-foreground">
                    SNI domain bindings, X.509 PEM certificate, and private key configuration.
                </p>
            </div>
        </div>

        <Button
            onclick={saveSSL}
            disabled={saving || loading}
            variant="default"
            size="sm"
            class="gap-1.5 shadow-sm"
        >
            {#if saving}
                <Loader2 class="w-4 h-4 animate-spin" />
                <span>Saving...</span>
            {:else}
                <Save class="w-4 h-4" />
                <span>Save Certificate</span>
            {/if}
        </Button>
    </div>

    {#if loading}
        <Card class="p-12 text-center text-muted-foreground text-xs font-medium">
            Loading SSL certificate details...
        </Card>
    {:else}
        <div class="grid grid-cols-1 gap-6">
            <!-- SNI Domains -->
            <Card class="p-6 space-y-4">
                <div class="flex items-center gap-2 pb-3 border-b border-border">
                    <Globe class="w-4 h-4 text-primary" />
                    <h2 class="font-semibold text-sm text-foreground">
                        SNI Domain Names
                    </h2>
                </div>

                <div class="space-y-3">
                    <div class="flex items-center gap-2">
                        <Input
                            type="text"
                            bind:value={sniInput}
                            onkeydown={(e) => e.key === "Enter" && (e.preventDefault(), addSNI())}
                            placeholder="e.g. api.example.com"
                            class="h-9 text-xs font-mono"
                        />
                        <Button variant="outline" size="sm" onclick={addSNI} class="h-9 gap-1">
                            <Plus class="w-4 h-4" />
                            <span>Add Domain</span>
                        </Button>
                    </div>

                    <div class="flex flex-wrap gap-1.5 pt-1">
                        {#each ssl.snis as sni}
                            <Badge variant="secondary" class="gap-1.5 py-1 text-xs font-mono">
                                <span>{sni}</span>
                                <button type="button" onclick={() => removeSNI(sni)} class="hover:text-destructive">
                                    <Trash2 class="w-3 h-3" />
                                </button>
                            </Badge>
                        {/each}
                        {#if !ssl.snis.length}
                            <span class="text-xs text-muted-foreground italic">No SNI domains added yet.</span>
                        {/if}
                    </div>
                </div>
            </Card>

            <!-- Certificate PEM & Private Key -->
            <Card class="p-6 space-y-4">
                <div class="flex items-center gap-2 pb-3 border-b border-border">
                    <Lock class="w-4 h-4 text-primary" />
                    <h2 class="font-semibold text-sm text-foreground">
                        X.509 Certificate Payload (PEM)
                    </h2>
                </div>

                <div class="space-y-4">
                    <div class="space-y-1.5">
                        <label for="sslCertPem" class="text-xs font-semibold text-foreground">
                            Public Certificate (PEM)
                        </label>
                        <textarea
                            id="sslCertPem"
                            bind:value={ssl.cert}
                            rows={6}
                            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                            class="flex w-full rounded-md border border-input bg-background p-3 text-xs font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        ></textarea>
                    </div>

                    <div class="space-y-1.5">
                        <label for="sslPrivateKeyPem" class="text-xs font-semibold text-foreground">
                            Private Key (PEM)
                        </label>
                        <textarea
                            id="sslPrivateKeyPem"
                            bind:value={ssl.key}
                            rows={6}
                            placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                            class="flex w-full rounded-md border border-input bg-background p-3 text-xs font-mono shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        ></textarea>
                    </div>

                    <div class="flex items-center justify-between pt-2 border-t border-border">
                        <span class="text-xs font-semibold text-foreground">Certificate Status</span>
                        <Switch
                            checked={ssl.status === 1}
                            onCheckedChange={(val) => ssl.status = val ? 1 : 0}
                            ariaLabel="Toggle Certificate Status"
                        />
                    </div>
                </div>
            </Card>
        </div>
    {/if}
</div>
