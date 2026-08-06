<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Save, ArrowLeft, Plus, Trash2, Database, Loader2, Server } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import Card from "$lib/components/ui/Card.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";

    let { id } = $props();
    let loading = $state(false);
    let saving = $state(false);

    let upstream = $state<any>({
        name: "",
        type: "roundrobin",
        nodes: [{ host: "", port: 80, weight: 1 }],
        checks: {
            active: {
                type: "http",
                http_path: "/",
                healthy: { interval: 2, successes: 1 },
                unhealthy: { interval: 1, http_failures: 2 },
            },
        },
        retries: 1,
        timeout: { connect: 6, send: 6, read: 6 },
    });

    onMount(async () => {
        if (id !== "new") {
            loading = true;
            try {
                const data = await apiFetch(`upstreams/${id}`);
                const val = data.value;

                if (!val.checks) val.checks = {};
                if (!val.checks.active) {
                    val.checks.active = {
                        type: "http",
                        http_path: "/",
                        healthy: { interval: 2, successes: 1 },
                        unhealthy: { interval: 1, http_failures: 2 },
                    };
                }
                if (!val.nodes) val.nodes = [];
                if (!val.timeout) val.timeout = { connect: 6, send: 6, read: 6 };

                upstream = val;
            } catch (err) {
                console.error("Failed to fetch upstream:", err);
            } finally {
                loading = false;
            }
        }
    });

    function addNode() {
        upstream.nodes = [...upstream.nodes, { host: "", port: 80, weight: 1 }];
    }

    function removeNode(index: number) {
        upstream.nodes = upstream.nodes.filter((_: any, i: number) => i !== index);
    }

    async function saveUpstream() {
        if (!upstream.name.trim()) {
            alert("Upstream name cannot be empty.");
            return;
        }
        saving = true;
        try {
            const method = id === "new" ? "POST" : "PUT";
            const path = id === "new" ? "upstreams" : `upstreams/${id}`;
            await apiFetch(path, {
                method,
                body: JSON.stringify(upstream),
            });
            goto("/upstreams");
        } catch (err: any) {
            alert("Failed to save upstream: " + err.message);
        } finally {
            saving = false;
        }
    }
</script>

<div class="space-y-6 max-w-4xl mx-auto pb-20">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <a href="/upstreams">
                <Button variant="ghost" size="icon" class="h-9 w-9">
                    <ArrowLeft class="w-4 h-4" />
                </Button>
            </a>
            <div>
                <h1 class="text-xl font-bold tracking-tight text-foreground">
                    {id === "new" ? "Create New Upstream" : `Edit Upstream: ${upstream.name || id}`}
                </h1>
                <p class="text-xs text-muted-foreground">
                    Define target backend nodes, load balancing algorithm, and health checks.
                </p>
            </div>
        </div>

        <Button
            onclick={saveUpstream}
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
                <span>Save Upstream</span>
            {/if}
        </Button>
    </div>

    {#if loading}
        <Card class="p-12 text-center text-muted-foreground text-xs font-medium">
            Loading upstream configuration...
        </Card>
    {:else}
        <div class="space-y-6">
            <!-- Identity & Strategy Card -->
            <Card class="p-6 space-y-4">
                <div class="flex items-center gap-2 pb-3 border-b border-border">
                    <Database class="w-4 h-4 text-primary" />
                    <h2 class="font-semibold text-sm text-foreground">
                        Upstream Profile & Load Balancing Algorithm
                    </h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label for="upstreamNameInput" class="text-xs font-semibold text-foreground">
                            Upstream Name
                        </label>
                        <Input
                            id="upstreamNameInput"
                            type="text"
                            bind:value={upstream.name}
                            placeholder="e.g. user-service-cluster"
                            required
                            class="h-9 text-xs"
                        />
                    </div>

                    <div class="space-y-1.5">
                        <label for="upstreamAlgorithmSelect" class="text-xs font-semibold text-foreground">
                            Load Balancing Algorithm
                        </label>
                        <select
                            id="upstreamAlgorithmSelect"
                            bind:value={upstream.type}
                            class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring uppercase"
                        >
                            <option value="roundrobin">Round Robin</option>
                            <option value="chash">Consistent Hash (CHash)</option>
                            <option value="ewma">Exponentially Weighted Moving Average (EWMA)</option>
                            <option value="least_conn">Least Connections</option>
                        </select>
                    </div>
                </div>
            </Card>

            <!-- Target Backend Nodes Card -->
            <Card class="p-6 space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-border">
                    <div class="flex items-center gap-2">
                        <Server class="w-4 h-4 text-primary" />
                        <h2 class="font-semibold text-sm text-foreground">
                            Backend Target Nodes
                        </h2>
                    </div>
                    <Button variant="outline" size="xs" onclick={addNode} class="gap-1">
                        <Plus class="w-3.5 h-3.5" />
                        <span>Add Target Node</span>
                    </Button>
                </div>

                <div class="space-y-3">
                    {#each upstream.nodes as node, i}
                        <div class="grid grid-cols-12 gap-3 items-center p-3 rounded-lg border border-border bg-muted/20">
                            <div class="col-span-6 space-y-1">
                                <label for="nodeHostInput-{i}" class="text-[11px] font-medium text-muted-foreground">Host / IP</label>
                                <Input
                                    id="nodeHostInput-{i}"
                                    type="text"
                                    bind:value={node.host}
                                    placeholder="127.0.0.1 or httpbin.org"
                                    class="h-8 text-xs font-mono"
                                />
                            </div>

                            <div class="col-span-3 space-y-1">
                                <label for="nodePortInput-{i}" class="text-[11px] font-medium text-muted-foreground">Port</label>
                                <Input
                                    id="nodePortInput-{i}"
                                    type="number"
                                    bind:value={node.port}
                                    placeholder="80"
                                    class="h-8 text-xs font-mono"
                                />
                            </div>

                            <div class="col-span-2 space-y-1">
                                <label for="nodeWeightInput-{i}" class="text-[11px] font-medium text-muted-foreground">Weight</label>
                                <Input
                                    id="nodeWeightInput-{i}"
                                    type="number"
                                    bind:value={node.weight}
                                    placeholder="1"
                                    class="h-8 text-xs font-mono"
                                />
                            </div>

                            <div class="col-span-1 flex justify-end pt-5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    class="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                                    onclick={() => removeNode(i)}
                                >
                                    <Trash2 class="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    {/each}
                </div>
            </Card>
        </div>
    {/if}
</div>
