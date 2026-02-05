<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import {
        Shield,
        Key,
        Zap,
        Eye,
        Server,
        Lock,
        Globe,
        Terminal,
        Plus,
        ArrowRight,
        Star,
        Cpu,
        ExternalLink,
    } from "lucide-svelte";
    import { goto } from "$app/navigation";

    const categories = [
        { name: "All", icon: Globe, color: "text-primary" },
        { name: "Authentication", icon: Key, color: "text-blue-500" },
        { name: "Security", icon: Shield, color: "text-red-500" },
        { name: "Traffic", icon: Zap, color: "text-orange-500" },
        { name: "Observability", icon: Eye, color: "text-green-500" },
        { name: "Serverless", icon: Server, color: "text-purple-500" },
    ];

    // Initial static list to ensure UI works, will be augmented by API
    let plugins = $state<any[]>([
        {
            id: "key-auth",
            name: "Key Auth",
            category: "Authentication",
            description:
                "Add key authentication to your routes with multi-credential support.",
            rating: 4.8,
            installs: "12k",
            featured: true,
        },
        {
            id: "jwt-auth",
            name: "JWT Auth",
            category: "Authentication",
            description:
                "Authenticate users using industry-standard JSON Web Tokens.",
            rating: 4.9,
            installs: "45k",
            featured: false,
        },
        {
            id: "limit-count",
            name: "Limit Count",
            category: "Traffic",
            description:
                "Limit the number of requests in a period to prevent abuse.",
            rating: 4.7,
            installs: "31k",
            featured: true,
        },
        {
            id: "prometheus",
            name: "Prometheus",
            category: "Observability",
            description:
                "Expose high-resolution metrics in Prometheus format for Grafana.",
            rating: 5.0,
            installs: "100k+",
            featured: true,
        },
        {
            id: "proxy-rewrite",
            name: "Proxy Rewrite",
            category: "Traffic",
            description:
                "Rewrite host, URI, or headers before proxying to the upstream server.",
            rating: 4.6,
            installs: "89k",
            featured: false,
        },
        {
            id: "cors",
            name: "CORS",
            category: "Security",
            description:
                "Enable Cross-Origin Resource Sharing for browser-based clients.",
            rating: 4.5,
            installs: "62k",
            featured: false,
        },
        {
            id: "ip-restriction",
            name: "IP Restriction",
            category: "Security",
            description:
                "Restrict access by IP address or entire subnet ranges for extra layer.",
            rating: 4.4,
            installs: "15k",
            featured: false,
        },
        {
            id: "serverless-pre-function",
            name: "Serverless",
            category: "Serverless",
            description:
                "Run custom Lua code before the request to inject dynamic logic.",
            rating: 4.9,
            installs: "8k",
            featured: true,
        },
    ]);

    let loading = $state(true);
    let selectedCategory = $state("All");

    const filteredPlugins = $derived(
        selectedCategory === "All"
            ? plugins
            : plugins.filter((p) => p.category === selectedCategory),
    );

    async function fetchPluginMetadata() {
        loading = true;
        try {
            // APISIX provides a list of all plugins metadata
            const data = await apiFetch("plugins");
            if (data && Array.isArray(data)) {
                // Merge with existing descriptions or just use the list
                // For now, let's just mark which ones are available on this node
                console.log("Found plugins on node:", data);
            }
        } catch (err) {
            console.warn(
                "Could not fetch real plugin list, using static catalog.",
            );
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchPluginMetadata();
    });

    function enablePlugin(id: string) {
        // Redirect to route creation with this plugin pre-selected/marked in context
        // We'll use a session storage or search param to carry the intent
        goto(`/routes/new?plugin=${id}`);
    }

    import PageHeader from "$lib/components/ui/PageHeader.svelte";
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-20">
    <PageHeader
        title="Plugin Marketplace"
        description="Extend your Gateway Power. Over 80+ enterprise-grade plugins available for security, observability, and traffic control. Secure, monitor, and scale your APIs with ease."
        badge="GATEWAY EXTENSIONS"
        badgeType="accent"
    >
        {#snippet actions()}
            <a
                href="https://apisix.apache.org/docs/apisix/plugins/"
                target="_blank"
                class="btn btn-outline btn-md rounded-xl font-black transition-all uppercase text-[10px] tracking-widest border-base-300"
            >
                <ExternalLink class="w-4 h-4 mr-1" />
                Documentation
            </a>
        {/snippet}
    </PageHeader>

    <!-- Category Filter -->
    <div id="catalog" class="flex flex-col gap-4 scroll-mt-20">
        <div class="flex items-center justify-between px-2">
            <h2
                class="text-sm font-black tracking-[0.2em] uppercase opacity-30 italic"
            >
                Navigation / Categories
            </h2>
            <div
                class="text-[10px] font-black uppercase tracking-widest opacity-20"
            >
                {plugins.length} Plugins Found
            </div>
        </div>
        <div class="flex flex-wrap gap-2 px-1">
            {#each categories as cat}
                <button
                    onclick={() => (selectedCategory = cat.name)}
                    class="btn rounded-xl group border-none shadow-sm transition-all h-12 {selectedCategory ===
                    cat.name
                        ? 'btn-primary px-10 text-primary-content shadow-lg shadow-primary/10 scale-105'
                        : 'bg-base-100 border border-base-300/50 hover:bg-base-200'}"
                >
                    <cat.icon
                        class="w-4 h-4 {selectedCategory === cat.name
                            ? 'text-primary-content'
                            : cat.color +
                              ' opacity-50 group-hover:opacity-100 transition-opacity'}"
                    />
                    <span
                        class="font-black uppercase text-[10px] tracking-widest"
                        >{cat.name}</span
                    >
                </button>
            {/each}
        </div>
    </div>

    {#if loading}
        <div class="py-20 flex flex-col items-center justify-center opacity-20">
            <div class="loading loading-spinner loading-lg"></div>
            <p class="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">
                Authenticating Payload
            </p>
        </div>
    {:else}
        <!-- Plugins Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {#each filteredPlugins as plugin}
                <div
                    class="section-card group relative flex flex-col justify-between hover:border-primary/30 transition-all duration-500 overflow-hidden !py-8 !px-8"
                >
                    {#if plugin.featured}
                        <div
                            class="absolute -top-6 -right-6 p-10 z-0 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000"
                        >
                            <Star class="w-32 h-32 fill-primary text-primary" />
                        </div>
                    {/if}

                    <div class="relative z-10 flex flex-col h-full">
                        <div class="flex items-start justify-between mb-8">
                            <div
                                class="p-3 bg-primary/5 rounded-xl text-primary border border-primary/10 group-hover:bg-primary group-hover:text-primary-content transition-all duration-300"
                            >
                                <Terminal class="w-6 h-6" />
                            </div>
                            {#if plugin.featured}
                                <div
                                    class="text-[8px] font-black tracking-[0.2em] text-primary uppercase bg-primary/10 px-2 py-1 rounded"
                                >
                                    PRM
                                </div>
                            {/if}
                        </div>

                        <h3 class="text-xl font-black tracking-tighter mb-1.5">
                            {plugin.name}
                        </h3>
                        <div class="flex items-center gap-2 mb-6">
                            <span
                                class="text-[8px] font-black uppercase text-base-content/40 tracking-widest border border-base-300 px-1.5 py-0.5 rounded"
                            >
                                {plugin.category}
                            </span>
                            <div
                                class="flex items-center gap-1 text-[9px] font-black opacity-30 uppercase tracking-widest"
                            >
                                {plugin.rating} RATING
                            </div>
                        </div>

                        <p
                            class="text-xs font-bold leading-relaxed opacity-40 mb-8 flex-1"
                        >
                            {plugin.description}
                        </p>

                        <div
                            class="pt-6 border-t border-base-300/50 flex items-center justify-between"
                        >
                            <div class="flex flex-col">
                                <span
                                    class="text-[8px] font-black opacity-20 uppercase tracking-[0.2em]"
                                    >Deployments</span
                                >
                                <span
                                    class="text-[10px] font-black uppercase tracking-tighter"
                                    >{plugin.installs}</span
                                >
                            </div>
                            <button
                                onclick={() => enablePlugin(plugin.id)}
                                class="btn btn-primary btn-xs rounded-lg font-black uppercase tracking-widest text-[9px] px-4 group-hover:scale-105 transition-all"
                            >
                                Enable
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Empty State -->
    {#if filteredPlugins.length === 0 && !loading}
        <div
            class="py-40 text-center flex flex-col items-center gap-4 opacity-10"
        >
            <Cpu class="w-20 h-20 animate-pulse" />
            <h2
                class="text-2xl font-black italic tracking-tighter uppercase underline decoration-4 underline-offset-8"
            >
                Out of Sync
            </h2>
        </div>
    {/if}
</div>
