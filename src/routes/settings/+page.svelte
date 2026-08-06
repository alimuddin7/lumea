<script lang="ts">
    import { config, connectionStatus } from "$lib/stores/config";
    import { checkConnection } from "$lib/api/client";
    import { ShieldCheck, Info, Save, AlertCircle, CheckCircle2, Loader2, Key, Globe } from "lucide-svelte";
    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";

    let baseUrl = $state($config.baseUrl);
    let apiKey = $state($config.apiKey);
    let saving = $state(false);
    let saveMessage = $state<{ success: boolean; text: string } | null>(null);

    const isUnconfigured = $derived(!baseUrl.trim() || !apiKey.trim());

    async function saveSettings() {
        saving = true;
        saveMessage = null;
        config.set({ baseUrl: baseUrl.trim(), apiKey: apiKey.trim() });

        connectionStatus.set("checking");
        const isConnected = await checkConnection();
        connectionStatus.set(isConnected ? "connected" : "disconnected");

        saving = false;
        if (isConnected) {
            saveMessage = { success: true, text: "Konfigurasi APISIX berhasil disimpan dan terhubung!" };
        } else {
            saveMessage = { success: false, text: "Kredensial disimpan, namun gagal terhubung ke APISIX Admin API. Periksa URL & Key." };
        }
    }
</script>

<div class="max-w-4xl mx-auto space-y-6 pb-20">
    <PageHeader
        title="APISIX Connection Settings"
        description="Atur URL Admin API dan X-API-KEY APISIX Control Center Anda. Kredensial disimpan secara aman di browser LocalStorage."
        badge="Security & Config"
    />

    {#if isUnconfigured}
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-start gap-3 text-xs">
            <AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
            <div>
                <div class="font-bold text-sm mb-0.5 text-amber-300">APISIX Admin API Belum Dikonfigurasi</div>
                <p class="leading-relaxed">
                    Silakan isi <strong>Admin API Base URL</strong> dan <strong>X-API-KEY</strong> di bawah ini agar Lumea dapat mengelola rute, upstreams, dan plugin APISIX Gateway Anda.
                </p>
            </div>
        </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
            <Card class="p-6 space-y-6">
                <div class="flex items-center gap-2 pb-3 border-b border-border">
                    <ShieldCheck class="w-5 h-5 text-primary" />
                    <h2 class="font-semibold text-sm text-foreground">
                        Kredensial APISIX Admin API
                    </h2>
                </div>

                <div class="space-y-4">
                    <div class="space-y-1.5">
                        <label for="baseUrl" class="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Globe class="w-3.5 h-3.5 text-primary" />
                            <span>Admin API Base URL</span>
                        </label>
                        <Input
                            id="baseUrl"
                            type="text"
                            bind:value={baseUrl}
                            placeholder="e.g. http://127.0.0.1:9180/apisix/admin"
                            class="h-9 text-xs font-mono"
                        />
                        <div class="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                            <Info class="w-3.5 h-3.5 shrink-0" />
                            <span>Sertakan akhiran <code>/apisix/admin</code> (contoh: <code>http://10.0.0.1:9180/apisix/admin</code>)</span>
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label for="apiKey" class="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Key class="w-3.5 h-3.5 text-primary" />
                            <span>Admin API Key (X-API-KEY)</span>
                        </label>
                        <Input
                            id="apiKey"
                            type="password"
                            bind:value={apiKey}
                            placeholder="Masukkan token keamanan APISIX X-API-KEY"
                            class="h-9 text-xs font-mono"
                        />
                    </div>
                </div>

                {#if saveMessage}
                    <div class="p-3 rounded-lg border text-xs flex items-start gap-2 {saveMessage.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-destructive/10 border-destructive/30 text-destructive'}">
                        {#if saveMessage.success}
                            <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {:else}
                            <AlertCircle class="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        {/if}
                        <span>{saveMessage.text}</span>
                    </div>
                {/if}

                <div class="pt-2 flex justify-end">
                    <Button
                        onclick={saveSettings}
                        disabled={saving || !baseUrl.trim() || !apiKey.trim()}
                        variant="default"
                        size="sm"
                        class="gap-2"
                    >
                        {#if saving}
                            <Loader2 class="w-4 h-4 animate-spin" />
                            <span>Menyimpan...</span>
                        {:else}
                            <Save class="w-4 h-4" />
                            <span>Simpan Konfigurasi</span>
                        {/if}
                    </Button>
                </div>
            </Card>
        </div>

        <div class="space-y-6">
            <Card class="p-6 space-y-3 bg-muted/20">
                <div class="flex items-center gap-2">
                    <Badge variant="outline" class="text-[10px] uppercase font-semibold">Arsitektur Safe</Badge>
                </div>
                <h3 class="text-xs font-bold text-foreground">Penyimpanan Lokal (Browser Storage)</h3>
                <p class="text-xs text-muted-foreground leading-relaxed">
                    Seluruh kredensial API Key dan URL disimpan secara lokal di browser pengguna (`localStorage`). Tidak ada kredensial yang tersimpan keras di kode aplikasi.
                </p>
                <div class="p-3 bg-background rounded-lg border border-border text-[11px] text-muted-foreground leading-relaxed">
                    Dashboard memanfaatkan server-side proxy untuk menjembatani komunikasi dengan APISIX Admin API tanpa mengalami isu CORS.
                </div>
            </Card>
        </div>
    </div>
</div>
