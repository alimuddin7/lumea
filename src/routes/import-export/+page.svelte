<script lang="ts">
    import { apiFetch } from "$lib/api/client";
    import {
        exportConfig,
        parseConfig,
        generateDiff,
        type APISIXConfig,
    } from "$lib/utils/importExportHandler";
    import {
        Download,
        Upload,
        FileJson,
        FileText,
        CheckCircle2,
        AlertCircle,
        Eye,
        Loader2,
        X,
    } from "lucide-svelte";
    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import Button from "$lib/components/ui/Button.svelte";

    let loading = $state(false);
    let importing = $state(false);
    let fileContent = $state("");
    let diffSummary = $state<any>(null);
    let showDiff = $state(false);
    let parsedData = $state<APISIXConfig | null>(null);

    async function handleExport() {
        loading = true;
        try {
            const [routes, upstreams, consumers, ssls] = await Promise.all([
                apiFetch("routes"),
                apiFetch("upstreams"),
                apiFetch("consumers"),
                apiFetch("ssls"),
            ]);

            const config: APISIXConfig = {
                routes: routes.list?.map((r: any) => r.value) || [],
                upstreams: upstreams.list?.map((u: any) => u.value) || [],
                consumers: consumers.list?.map((c: any) => c.value) || [],
                ssls: ssls.list?.map((s: any) => s.value) || [],
            };

            const blob = new Blob([exportConfig(config, "json")], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `apisix-config-${new Date().toISOString().split("T")[0]}.json`;
            a.click();
        } catch (err) {
            alert("Export failed: " + (err as Error).message);
        } finally {
            loading = false;
        }
    }

    async function handleFileSelect(e: any) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event: any) => {
            fileContent = event.target.result;
            const isYaml =
                file.name.endsWith(".yaml") || file.name.endsWith(".yml");

            try {
                parsedData = parseConfig(fileContent, isYaml ? "yaml" : "json");

                const currentRoutes = await apiFetch("routes");
                const currentConfig: APISIXConfig = {
                    routes: currentRoutes.list?.map((r: any) => r.value) || [],
                };

                diffSummary = generateDiff(currentConfig, parsedData!);
                showDiff = true;
            } catch (err) {
                alert("Invalid file format");
            }
        };
        reader.readAsText(file);
    }

    async function applyImport() {
        if (!parsedData) return;
        importing = true;
        try {
            for (const route of parsedData.routes || []) {
                await apiFetch(`routes/${route.id || "auto"}`, {
                    method: "PUT",
                    body: JSON.stringify(route),
                });
            }

            alert("Import applied successfully!");
            showDiff = false;
            parsedData = null;
        } catch (err) {
            alert("Import failed: " + (err as Error).message);
        } finally {
            importing = false;
        }
    }
</script>

<div class="max-w-4xl mx-auto space-y-6 pb-20 font-sans">
    <PageHeader
        title="Import & Export"
        description="Backup APISIX gateway configurations or sync settings across environments."
        badge="MIGRATION"
        badgeType="secondary"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Bulk Export Card -->
        <Card class="p-6 space-y-5 border-border/80 shadow-sm rounded-3xl bg-card flex flex-col justify-between">
            <div class="space-y-4">
                <div class="w-12 h-12 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center">
                    <Download class="w-6 h-6" />
                </div>
                <div>
                    <h3 class="text-lg font-bold text-foreground">
                        Bulk Export Configuration
                    </h3>
                    <p class="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        Download all active routes, upstreams, consumer groups, and SSL certificates into a single JSON file.
                    </p>
                </div>
            </div>

            <Button
                onclick={handleExport}
                disabled={loading}
                class="w-full h-11 gap-2 font-bold shadow-md"
            >
                {#if loading}
                    <Loader2 class="w-4 h-4 animate-spin" />
                {:else}
                    <FileJson class="w-4 h-4" />
                {/if}
                <span>Export as JSON</span>
            </Button>
        </Card>

        <!-- Smart Import Card -->
        <Card class="p-6 space-y-5 border-border/80 shadow-sm rounded-3xl bg-card flex flex-col justify-between">
            <div class="space-y-4">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-foreground flex items-center justify-center border border-border">
                    <Upload class="w-6 h-6" />
                </div>
                <div>
                    <h3 class="text-lg font-bold text-foreground">
                        Smart Import & Migration
                    </h3>
                    <p class="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        Upload a JSON or YAML configuration file to restore settings with a full diff preview before applying.
                    </p>
                </div>
            </div>

            <div class="relative">
                <input
                    type="file"
                    accept=".json,.yaml,.yml"
                    onchange={handleFileSelect}
                    class="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                />
                <Button
                    variant="outline"
                    class="w-full h-11 gap-2 font-bold border-border"
                >
                    <FileText class="w-4 h-4 text-rose-600" />
                    <span>Select JSON/YAML File</span>
                </Button>
            </div>
        </Card>
    </div>

    {#if showDiff && diffSummary}
        <Card class="p-6 space-y-6 border-border shadow-xl rounded-3xl bg-card animate-in fade-in slide-in-from-bottom-4">
            <div class="flex items-center justify-between pb-4 border-b border-border">
                <div class="flex items-center gap-3">
                    <div class="p-2.5 bg-rose-600/10 text-rose-600 rounded-xl">
                        <Eye class="w-5 h-5" />
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-foreground">
                            Diff Preview Before Apply
                        </h3>
                        <p class="text-xs text-muted-foreground">
                            Automatic change analysis for incoming configuration
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onclick={() => (showDiff = false)}
                    class="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                    <X class="w-4 h-4" />
                </button>
            </div>

            <div class="grid grid-cols-3 gap-4">
                <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                    <div class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {diffSummary.added}
                    </div>
                    <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                        To Add
                    </div>
                </div>

                <div class="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-center">
                    <div class="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
                        {diffSummary.updated}
                    </div>
                    <div class="text-[10px] font-bold uppercase tracking-wider text-sky-600/80 dark:text-sky-400/80 mt-1">
                        To Update
                    </div>
                </div>

                <div class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
                    <div class="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                        {diffSummary.deleted}
                    </div>
                    <div class="text-[10px] font-bold uppercase tracking-wider text-rose-600/80 dark:text-rose-400/80 mt-1">
                        To Delete
                    </div>
                </div>
            </div>

            <div class="p-4 bg-muted/40 rounded-2xl border border-border max-h-60 overflow-y-auto font-mono text-xs space-y-1.5">
                {#each diffSummary.details as detail}
                    <div
                        class="flex gap-2 {detail.startsWith('[ADD]')
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                            : detail.startsWith('[DELETE]')
                              ? 'text-rose-600 dark:text-rose-400 font-semibold'
                              : 'text-sky-600 dark:text-sky-400'}"
                    >
                        <span class="opacity-50">›</span>
                        <span>{detail}</span>
                    </div>
                {/each}
            </div>

            <div class="flex gap-3 pt-2">
                <Button
                    variant="default"
                    disabled={importing}
                    onclick={applyImport}
                    class="flex-1 h-11 gap-2 font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    {#if importing}
                        <Loader2 class="w-4 h-4 animate-spin" />
                    {:else}
                        <CheckCircle2 class="w-4 h-4" />
                    {/if}
                    <span>Confirm and Apply Import</span>
                </Button>
                <Button
                    variant="outline"
                    onclick={() => (showDiff = false)}
                    class="h-11 px-6 font-bold"
                >
                    Cancel
                </Button>
            </div>
        </Card>
    {/if}
</div>
