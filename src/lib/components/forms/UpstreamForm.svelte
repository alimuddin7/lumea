<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { Save, ArrowLeft, Plus, Trash2 } from "lucide-svelte";
    import { goto } from "$app/navigation";

    let { id } = $props();
    let loading = $state(id !== "new");
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
            try {
                const data = await apiFetch(`upstreams/${id}`);
                const val = data.value;

                // DATA NORMALIZATION: Ensure nested properties exist for binding
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
                if (!val.timeout)
                    val.timeout = { connect: 6, send: 6, read: 6 };

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
        upstream.nodes = upstream.nodes.filter(
            (_: any, i: number) => i !== index,
        );
    }

    async function saveUpstream() {
        saving = true;
        try {
            const method = id === "new" ? "POST" : "PUT";
            const path = id === "new" ? "upstreams" : `upstreams/${id}`;
            await apiFetch(path, {
                method,
                body: upstream,
            });
            goto("/upstreams");
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
                href="/upstreams"
                class="p-2 hover:bg-base-200 rounded-full transition-colors opacity-50"
            >
                <ArrowLeft class="w-4 h-4" />
            </a>
            <h1 class="text-2xl font-black tracking-tighter">
                {id === "new" ? "Create Upstream" : "Edit Upstream"}
            </h1>
        </div>
        <button
            onclick={saveUpstream}
            disabled={saving || loading}
            class="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 disabled:opacity-20 text-primary-content font-black rounded-xl transition-all shadow-lg shadow-primary/10 text-xs uppercase tracking-widest"
        >
            {#if saving}
                <div
                    class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
                <span>Saving...</span>
            {:else}
                <Save class="w-4 h-4" />
                <span>Save Configuration</span>
            {/if}
        </button>
    </div>

    {#if loading}
        <div class="py-32 flex flex-col items-center justify-center opacity-20">
            <div class="loading loading-spinner loading-lg"></div>
            <p class="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">
                Synchronizing Infrastructure State
            </p>
        </div>
    {:else}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div class="lg:col-span-2 space-y-8">
                <!-- Basic Config -->
                <section class="section-card">
                    <h2 class="section-title">Basic Configuration</h2>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label for="u-name" class="label-minimal"
                                >Upstream Name</label
                            >
                            <input
                                id="u-name"
                                type="text"
                                bind:value={upstream.name}
                                placeholder="e.g. Production Cluster"
                                class="input-minimal"
                            />
                        </div>
                        <div class="space-y-1">
                            <label for="u-type" class="label-minimal"
                                >Balancing Algorithm</label
                            >
                            <select
                                id="u-type"
                                bind:value={upstream.type}
                                class="input-minimal"
                            >
                                <option value="roundrobin">Round Robin</option>
                                <option value="chash">C-Hash</option>
                                <option value="least_conn"
                                    >Least Connection</option
                                >
                                <option value="ewma">EWMA</option>
                            </select>
                        </div>
                    </div>
                </section>

                <!-- Target Nodes -->
                <section class="section-card">
                    <div class="section-title">
                        <span>Target Nodes</span>
                        <button
                            onclick={addNode}
                            class="btn btn-ghost btn-xs h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20"
                        >
                            <Plus class="w-3 h-3 mr-1" /> Add Node
                        </button>
                    </div>
                    <div class="space-y-3">
                        {#each upstream.nodes as node, i}
                            <div
                                class="flex items-end gap-3 p-4 bg-base-200/50 rounded-2xl border border-base-300/50 group"
                            >
                                <div class="flex-1 space-y-1">
                                    <label for={"h-" + i} class="label-minimal"
                                        >Host / IP</label
                                    >
                                    <input
                                        id={"h-" + i}
                                        type="text"
                                        bind:value={node.host}
                                        placeholder="e.g. 127.0.0.1"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                                <div class="w-24 space-y-1">
                                    <label for={"p-" + i} class="label-minimal"
                                        >Port</label
                                    >
                                    <input
                                        id={"p-" + i}
                                        type="number"
                                        bind:value={node.port}
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                                <div class="w-16 space-y-1">
                                    <label for={"w-" + i} class="label-minimal"
                                        >Weight</label
                                    >
                                    <input
                                        id={"w-" + i}
                                        type="number"
                                        bind:value={node.weight}
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                                <button
                                    onclick={() => removeNode(i)}
                                    class="p-2.5 text-base-content/20 hover:text-error transition-all hover:bg-error/5 rounded-xl"
                                >
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        {/each}
                    </div>
                </section>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <section class="section-card">
                    <h2 class="section-title">Health Checks</h2>
                    <div class="space-y-4">
                        <div class="space-y-1">
                            <label for="hc-path" class="label-minimal"
                                >HTTP Path</label
                            >
                            <input
                                id="hc-path"
                                type="text"
                                bind:value={upstream.checks.active.http_path}
                                class="input-minimal bg-base-200/50"
                            />
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <label for="hc-int" class="label-minimal"
                                    >Interval (s)</label
                                >
                                <input
                                    id="hc-int"
                                    type="number"
                                    bind:value={
                                        upstream.checks.active.healthy.interval
                                    }
                                    class="input-minimal bg-base-200/50"
                                />
                            </div>
                            <div class="space-y-1">
                                <label for="hc-succ" class="label-minimal"
                                    >Successes</label
                                >
                                <input
                                    id="hc-succ"
                                    type="number"
                                    bind:value={
                                        upstream.checks.active.healthy.successes
                                    }
                                    class="input-minimal bg-base-200/50"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section class="section-card">
                    <h2 class="section-title">Connectivity</h2>
                    <div class="grid grid-cols-3 gap-2">
                        <div class="space-y-1">
                            <label for="t-conn" class="label-minimal text-[8px]"
                                >Connect</label
                            >
                            <input
                                id="t-conn"
                                type="number"
                                bind:value={upstream.timeout.connect}
                                class="input-minimal bg-base-200/50 text-xs px-2 py-1.5 font-bold"
                            />
                        </div>
                        <div class="space-y-1">
                            <label for="t-send" class="label-minimal text-[8px]"
                                >Send</label
                            >
                            <input
                                id="t-send"
                                type="number"
                                bind:value={upstream.timeout.send}
                                class="input-minimal bg-base-200/50 text-xs px-2 py-1.5 font-bold"
                            />
                        </div>
                        <div class="space-y-1">
                            <label for="t-read" class="label-minimal text-[8px]"
                                >Read</label
                            >
                            <input
                                id="t-read"
                                type="number"
                                bind:value={upstream.timeout.read}
                                class="input-minimal bg-base-200/50 text-xs px-2 py-1.5 font-bold"
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    {/if}
</div>
