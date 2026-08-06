<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import { config, connectionStatus } from "$lib/stores/config";
    import Card from "$lib/components/ui/Card.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Switch from "$lib/components/ui/Switch.svelte";
    import StatusBadge from "$lib/components/ui/StatusBadge.svelte";
    import StatsCard from "$lib/components/ui/StatsCard.svelte";
    import {
        Globe,
        Database,
        Server,
        Users,
        Sliders,
        ShieldCheck,
        Sparkles,
        ArrowUpRight,
        MoreHorizontal,
        Search,
        Activity,
        Plus,
        CheckCircle2,
        Zap,
        ExternalLink,
        RefreshCw,
    } from "lucide-svelte";

    let searchQuery = $state("");
    let routesList = $state<any[]>([]);
    let filteredRoutes = $derived(
        searchQuery.trim()
            ? routesList.filter(
                  (r) =>
                      (r.value?.name || r.value?.id || "")
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                      (r.value?.uri || "")
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
              )
            : routesList,
    );
    let loading = $state(true);
    let togglingId = $state<string | null>(null);

    let stats = $state({
        routes: 0,
        upstreams: 0,
        services: 0,
        consumers: 0,
        ssls: 0,
    });

    async function loadDashboardData() {
        loading = true;
        try {
            const [
                routesRes,
                upstreamsRes,
                servicesRes,
                consumersRes,
                sslsRes,
            ] = await Promise.allSettled([
                apiFetch("routes"),
                apiFetch("upstreams"),
                apiFetch("services"),
                apiFetch("consumers"),
                apiFetch("ssls"),
            ]);

            if (routesRes.status === "fulfilled") {
                routesList = routesRes.value?.list || [];
                stats.routes = routesRes.value?.total || routesList.length || 0;
            } else {
                routesList = [];
                stats.routes = 0;
            }

            stats.upstreams =
                upstreamsRes.status === "fulfilled"
                    ? upstreamsRes.value?.total ||
                      upstreamsRes.value?.list?.length ||
                      0
                    : 0;
            stats.services =
                servicesRes.status === "fulfilled"
                    ? servicesRes.value?.total ||
                      servicesRes.value?.list?.length ||
                      0
                    : 0;
            stats.consumers =
                consumersRes.status === "fulfilled"
                    ? consumersRes.value?.total ||
                      consumersRes.value?.list?.length ||
                      0
                    : 0;
            stats.ssls =
                sslsRes.status === "fulfilled"
                    ? sslsRes.value?.total || sslsRes.value?.list?.length || 0
                    : 0;
        } catch (err) {
            console.warn("Failed to load dashboard metrics", err);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadDashboardData();
    });

    async function toggleRouteStatus(routeObj: any) {
        const routeId = routeObj.value?.id;
        if (!routeId) return;

        togglingId = routeId;
        const currentStatus = routeObj.value.status ?? 1;
        const newStatus = currentStatus === 1 ? 0 : 1;

        try {
            const updatedPayload = {
                ...routeObj.value,
                status: newStatus,
            };

            await apiFetch(`routes/${routeId}`, {
                method: "PUT",
                body: JSON.stringify(updatedPayload),
            });

            routeObj.value.status = newStatus;
        } catch (err: any) {
            alert("Failed to update route status: " + err.message);
        } finally {
            togglingId = null;
        }
    }
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-20">
    <!-- Header Bar -->
    <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-foreground">
                APISIX Dashboard
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
                Real-time status overview of active APISIX Gateway entities &
                routes
            </p>
        </div>

        <div class="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onclick={loadDashboardData}
                disabled={loading}
                class="gap-1.5 h-9 text-xs"
            >
                <RefreshCw
                    class="w-3.5 h-3.5 {loading ? 'animate-spin' : ''}"
                />
                <span>Refresh Data</span>
            </Button>
            <a href="/routes/new">
                <Button size="sm" class="gap-1.5 h-9 text-xs shadow-sm">
                    <Plus class="w-4 h-4" />
                    <span>Create Route</span>
                </Button>
            </a>
        </div>
    </div>

    <!-- Real Entity Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
            title="Active Routes"
            value={loading ? "..." : stats.routes}
            description="APISIX Traffic Rules"
            icon={Globe}
        />
        <StatsCard
            title="Upstreams"
            value={loading ? "..." : stats.upstreams}
            description="Backend Nodes"
            icon={Database}
        />
        <StatsCard
            title="Services"
            value={loading ? "..." : stats.services}
            description="Service Grouping"
            icon={Server}
        />
        <StatsCard
            title="Consumers"
            value={loading ? "..." : stats.consumers}
            description="Authenticated Clients"
            icon={Users}
        />
        <StatsCard
            title="Certificates"
            value={loading ? "..." : stats.ssls}
            description="TLS SNI Bindings"
            icon={ShieldCheck}
        />
    </div>

    <!-- Main Dashboard Grid: Real Routes List & Connection Health -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left 2-Cols: Real APISIX Routes List -->
        <Card
            class="lg:col-span-2 p-6 space-y-5 shadow-sm border-border/80 rounded-3xl bg-card"
        >
            <div
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
                <div>
                    <h2 class="font-bold text-base text-foreground">
                        Real Configured Routes
                    </h2>
                    <p class="text-xs text-muted-foreground">
                        Directly fetched from your APISIX Admin API
                    </p>
                </div>

                <div class="relative w-full sm:w-56">
                    <Search
                        class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Search real route..."
                        class="w-full h-8 pl-8 pr-3 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            <!-- Routes Table / List -->
            {#if loading}
                <div
                    class="p-12 text-center text-xs text-muted-foreground font-medium"
                >
                    Fetching real APISIX routes...
                </div>
            {:else if !filteredRoutes.length}
                <div
                    class="p-12 text-center text-xs text-muted-foreground space-y-3"
                >
                    <p class="font-medium">
                        Belum ada Rute APISIX yang ditemukan.
                    </p>
                    <a href="/routes/new">
                        <Button
                            variant="outline"
                            size="sm"
                            class="gap-1.5 text-xs"
                        >
                            <Plus class="w-3.5 h-3.5" />
                            <span>Buat Rute Baru</span>
                        </Button>
                    </a>
                </div>
            {:else}
                <div class="space-y-3">
                    {#each filteredRoutes as r}
                        {@const routeVal = r.value || {}}
                        {@const isEnabled = (routeVal.status ?? 1) === 1}
                        <div
                            class="flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all border border-border/50"
                        >
                            <div class="space-y-1 max-w-[60%]">
                                <div class="flex items-center gap-2">
                                    <h3
                                        class="font-bold text-xs text-foreground truncate"
                                    >
                                        {routeVal.name || routeVal.id}
                                    </h3>
                                    <Badge
                                        variant={isEnabled
                                            ? "success"
                                            : "secondary"}
                                        class="text-[10px] py-0"
                                    >
                                        {isEnabled ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>

                                <div
                                    class="text-[11px] font-mono text-muted-foreground truncate"
                                >
                                    {routeVal.uri ||
                                        routeVal.uris?.join(", ") ||
                                        "No URI specified"}
                                </div>

                                <div class="flex flex-wrap gap-1 pt-1">
                                    {#each routeVal.methods || ["ALL"] as method}
                                        <span
                                            class="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/20"
                                        >
                                            {method}
                                        </span>
                                    {/each}
                                </div>
                            </div>

                            <div class="flex items-center gap-3">
                                <a href={`/routes/${routeVal.id}`}>
                                    <Button
                                        variant="outline"
                                        size="xs"
                                        class="h-8 text-[11px]"
                                    >
                                        Edit
                                    </Button>
                                </a>

                                <Switch
                                    checked={isEnabled}
                                    disabled={togglingId === routeVal.id}
                                    onCheckedChange={() => toggleRouteStatus(r)}
                                    ariaLabel={`Toggle route ${routeVal.name || routeVal.id}`}
                                />
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </Card>

        <!-- Right 1-Col: Gateway Status & Crimson Quick Widget -->
        <div class="space-y-6">
            <Card
                class="p-6 space-y-4 shadow-sm border-border/80 rounded-3xl bg-card"
            >
                <div
                    class="flex items-center justify-between pb-3 border-b border-border"
                >
                    <h2 class="font-bold text-sm text-foreground">
                        APISIX Admin Gateway
                    </h2>
                    <StatusBadge status={$connectionStatus} />
                </div>

                <div class="space-y-2 text-xs">
                    <div
                        class="flex justify-between items-center text-muted-foreground"
                    >
                        <span>Admin Base URL</span>
                        <span
                            class="font-mono text-[11px] font-medium text-foreground truncate max-w-[180px]"
                        >
                            {$config.baseUrl || "Belum dikonfigurasi"}
                        </span>
                    </div>

                    <div
                        class="flex justify-between items-center text-muted-foreground"
                    >
                        <span>Status Rute Aktif</span>
                        <span class="font-bold text-emerald-500"
                            >{stats.routes} Rute Terdaftar</span
                        >
                    </div>
                </div>

                <a href="/settings" class="block pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        class="w-full justify-between text-xs"
                    >
                        <span>Pengaturan Kredensial APISIX</span>
                        <ExternalLink class="w-3.5 h-3.5" />
                    </Button>
                </a>
            </Card>

            <Card
                class="p-6 space-y-4 shadow-sm border-border/80 rounded-3xl bg-gradient-to-br from-primary via-primary/95 to-rose-700 text-primary-foreground"
            >
                <div class="flex items-center gap-2">
                    <Sparkles class="w-5 h-5" />
                    <h3 class="font-bold text-sm">Quick Action Gateway</h3>
                </div>

                <p class="text-xs opacity-90 leading-relaxed">
                    Kelola rute, upstream, dan kebijakan keamanan API Anda
                    langsung dari APISIX Control Center.
                </p>

                <div class="pt-2 flex flex-col gap-2">
                    <a href="/routes/new" class="w-full">
                        <Button
                            variant="secondary"
                            size="sm"
                            class="w-full justify-between text-xs font-bold bg-white text-slate-900 hover:bg-white/90"
                        >
                            <span>Tambah Rute APISIX Baru</span>
                            <Plus class="w-4 h-4" />
                        </Button>
                    </a>
                </div>
            </Card>
        </div>
    </div>
</div>
