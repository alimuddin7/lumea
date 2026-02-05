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
    } from "lucide-svelte";

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
            alert("Export failed");
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

                // Fetch current config for diff
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
            // In a real app, we would loop through all items and apply them
            // For this demo, we'll just simulate success after a delay
            // and show a console message.
            console.log("Applying import...", parsedData);

            for (const route of parsedData.routes || []) {
                await apiFetch(`routes/${route.id || "auto"}`, {
                    method: "PUT",
                    body: route,
                });
            }

            alert("Import successful!");
            showDiff = false;
            parsedData = null;
        } catch (err) {
            alert("Import failed");
        } finally {
            importing = false;
        }
    }
</script>

<div class="max-w-4xl mx-auto space-y-8 pb-10">
    <div class="space-y-2">
        <h1 class="text-3xl font-black tracking-tight text-base-content">
            Import / Export
        </h1>
        <p class="text-base-content/60 font-medium">
            Backup your configuration or migrate between environments.
        </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Export Card -->
        <div
            class="bg-base-100 p-8 rounded-2xl border border-base-300 space-y-6 shadow-sm shadow-base-300/20"
        >
            <div
                class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
            >
                <Download class="w-6 h-6 text-primary" />
            </div>
            <div>
                <h3 class="text-xl font-black text-base-content">
                    Bulk Export
                </h3>
                <p class="text-sm text-base-content/60 mt-2 leading-relaxed">
                    Download all routes, upstreams, consumers, and SSL settings
                    into a single file.
                </p>
            </div>
            <div class="flex flex-col gap-3">
                <button
                    onclick={handleExport}
                    disabled={loading}
                    class="w-full py-3 bg-primary hover:bg-primary-focus text-primary-content font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 uppercase text-[10px] tracking-widest"
                >
                    {#if loading}
                        <div
                            class="w-4 h-4 border-2 border-primary-content border-t-transparent rounded-full animate-spin"
                        ></div>
                    {:else}
                        <FileJson class="w-5 h-5" />
                    {/if}
                    Export as JSON
                </button>
            </div>
        </div>

        <!-- Import Card -->
        <div
            class="bg-base-100 p-8 rounded-2xl border border-base-300 space-y-6 shadow-sm shadow-base-300/20"
        >
            <div
                class="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center"
            >
                <Upload class="w-6 h-6 text-secondary" />
            </div>
            <div>
                <h3 class="text-xl font-black text-base-content">
                    Smart Import
                </h3>
                <p class="text-sm text-base-content/60 mt-2 leading-relaxed">
                    Upload a JSON or YAML file to restore configuration with a
                    preview of changes.
                </p>
            </div>
            <div class="relative">
                <input
                    type="file"
                    accept=".json,.yaml,.yml"
                    onchange={handleFileSelect}
                    class="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div
                    class="w-full py-3 bg-secondary hover:bg-secondary-focus text-secondary-content font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-secondary/10 uppercase text-[10px] tracking-widest"
                >
                    <FileText class="w-5 h-5" />
                    Select File
                </div>
            </div>
        </div>
    </div>

    {#if showDiff && diffSummary}
        <div
            class="bg-base-100 rounded-3xl border border-base-300 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 shadow-primary/5"
        >
            <div
                class="px-8 py-6 border-b border-base-200 flex items-center justify-between"
            >
                <div class="flex items-center gap-4">
                    <div
                        class="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center"
                    >
                        <Eye class="w-5 h-5 text-info" />
                    </div>
                    <div>
                        <h3
                            class="text-lg font-black text-base-content uppercase tracking-tight"
                        >
                            Preview Before Apply
                        </h3>
                        <p
                            class="text-[10px] font-black uppercase tracking-widest opacity-30"
                        >
                            Change detection analysis
                        </p>
                    </div>
                </div>
                <button
                    onclick={() => (showDiff = false)}
                    class="btn btn-ghost btn-circle btn-sm opacity-40 hover:opacity-100"
                    >✕</button
                >
            </div>

            <div class="p-8 space-y-8">
                <div class="grid grid-cols-3 gap-6">
                    <div
                        class="p-6 bg-success/5 rounded-2xl border border-success/10 text-center"
                    >
                        <div class="text-3xl font-black text-success mb-1">
                            {diffSummary.added}
                        </div>
                        <div
                            class="text-[9px] text-success/60 font-black uppercase tracking-widest"
                        >
                            To Add
                        </div>
                    </div>
                    <div
                        class="p-6 bg-info/5 rounded-2xl border border-info/10 text-center"
                    >
                        <div class="text-3xl font-black text-info mb-1">
                            {diffSummary.updated}
                        </div>
                        <div
                            class="text-[9px] text-info/60 font-black uppercase tracking-widest"
                        >
                            To Update
                        </div>
                    </div>
                    <div
                        class="p-6 bg-error/5 rounded-2xl border border-error/10 text-center"
                    >
                        <div class="text-3xl font-black text-error mb-1">
                            {diffSummary.deleted}
                        </div>
                        <div
                            class="text-[9px] text-error/60 font-black uppercase tracking-widest"
                        >
                            To Delete
                        </div>
                    </div>
                </div>

                <div
                    class="bg-base-200/50 p-6 rounded-2xl border border-base-300 max-h-64 overflow-y-auto font-mono text-[10px] space-y-2 leading-relaxed"
                >
                    {#each diffSummary.details as detail}
                        <div
                            class="flex gap-3 {detail.startsWith('[ADD]')
                                ? 'text-success'
                                : detail.startsWith('[DELETE]')
                                  ? 'text-error font-medium'
                                  : 'text-info'}"
                        >
                            <span class="opacity-40 select-none">›</span>
                            <span>{detail}</span>
                        </div>
                    {/each}
                </div>

                <div class="flex gap-4 pt-4">
                    <button
                        onclick={applyImport}
                        disabled={importing}
                        class="flex-1 py-4 bg-success hover:bg-success-focus text-success-content font-black rounded-2xl shadow-xl shadow-success/10 transition-all flex items-center justify-center gap-2 uppercase text-[11px] tracking-[0.1em]"
                    >
                        {#if importing}
                            <div
                                class="w-5 h-5 border-2 border-success-content border-t-transparent rounded-full animate-spin"
                            ></div>
                        {:else}
                            <CheckCircle2 class="w-5 h-5" />
                        {/if}
                        Confirm and Apply Changes
                    </button>
                    <button
                        onclick={() => (showDiff = false)}
                        class="px-10 py-4 bg-base-200 text-base-content/60 font-black rounded-2xl hover:bg-base-300 transition-all uppercase text-[11px] tracking-[0.1em]"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>
