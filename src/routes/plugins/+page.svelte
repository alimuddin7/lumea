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
        Sparkles,
    } from "lucide-svelte";
    import { goto } from "$app/navigation";

    const categories = [
        { name: "All", icon: Globe, color: "text-primary" },
        { name: "Authentication", icon: Key, color: "text-blue-500" },
        { name: "Security", icon: Shield, color: "text-red-500" },
        { name: "Traffic", icon: Zap, color: "text-orange-500" },
        { name: "Observability", icon: Eye, color: "text-green-500" },
        { name: "Serverless", icon: Server, color: "text-purple-500" },
        { name: "Transformation", icon: Cpu, color: "text-pink-500" },
        { name: "AI & LLM", icon: Sparkles, color: "text-indigo-500" },
    ];

    // Initial static list to ensure UI works, will be augmented by API
    let plugins = $state<any[]>([
        // Authentication
        {
            id: "key-auth",
            name: "Key Auth",
            category: "Authentication",
            description: "Key authentication with multi-credential support.",
            rating: 4.8,
            installs: "12k",
            featured: true,
        },
        {
            id: "jwt-auth",
            name: "JWT Auth",
            category: "Authentication",
            description: "Industry-standard JSON Web Token authentication.",
            rating: 4.9,
            installs: "45k",
            featured: true,
        },
        {
            id: "basic-auth",
            name: "Basic Auth",
            category: "Authentication",
            description: "Simple username & password authentication.",
            rating: 4.5,
            installs: "8k",
        },
        {
            id: "hmac-auth",
            name: "HMAC Auth",
            category: "Authentication",
            description: "Message integrity using HMAC signatures.",
            rating: 4.7,
            installs: "15k",
        },
        {
            id: "openid-connect",
            name: "OIDC",
            category: "Authentication",
            description: "Integrate with identity providers like Keycloak.",
            rating: 4.9,
            installs: "22k",
        },
        {
            id: "forward-auth",
            name: "Forward Auth",
            category: "Authentication",
            description: "Delegate authentication to external services.",
            rating: 4.6,
            installs: "19k",
        },
        {
            id: "ldap-auth",
            name: "LDAP Auth",
            category: "Authentication",
            description: "Authenticate against LDAP/Active Directory.",
            rating: 4.5,
            installs: "9k",
        },

        // Security
        {
            id: "cors",
            name: "CORS",
            category: "Security",
            description: "Enable Cross-Origin Resource Sharing.",
            rating: 4.5,
            installs: "62k",
            featured: true,
        },
        {
            id: "ip-restriction",
            name: "IP Restriction",
            category: "Security",
            description: "Whitelist/blacklist IPs and subnets.",
            rating: 4.4,
            installs: "15k",
        },
        {
            id: "ua-restriction",
            name: "UA Restriction",
            category: "Security",
            description: "Restrict access based on User-Agent.",
            rating: 4.1,
            installs: "5k",
        },
        {
            id: "uri-blocker",
            name: "URI Blocker",
            category: "Security",
            description: "Block requests with defined rules.",
            rating: 4.3,
            installs: "10k",
        },
        {
            id: "csrf",
            name: "CSRF",
            category: "Security",
            description: "Protect against CSRF attacks.",
            rating: 4.2,
            installs: "4k",
        },
        {
            id: "referer-restriction",
            name: "Referer Restriction",
            category: "Security",
            description: "Filter by Referer header.",
            rating: 4.0,
            installs: "3k",
        },

        // Traffic
        {
            id: "limit-count",
            name: "Limit Count",
            category: "Traffic",
            description: "Fixed-window request limiting.",
            rating: 4.7,
            installs: "31k",
            featured: true,
        },
        {
            id: "limit-req",
            name: "Limit Req",
            category: "Traffic",
            description: "Leaky-bucket request rate limiting.",
            rating: 4.6,
            installs: "18k",
        },
        {
            id: "limit-conn",
            name: "Limit Conn",
            category: "Traffic",
            description: "Concurrency limiting for protection.",
            rating: 4.5,
            installs: "9k",
        },
        {
            id: "proxy-cache",
            name: "Proxy Cache",
            category: "Traffic",
            description: "Upstream response caching.",
            rating: 4.8,
            installs: "55k",
            featured: true,
        },
        {
            id: "proxy-mirror",
            name: "Proxy Mirror",
            category: "Traffic",
            description: "Mirror client requests to another service.",
            rating: 4.4,
            installs: "7k",
        },
        {
            id: "traffic-split",
            name: "Traffic Split",
            category: "Traffic",
            description: "Weighted routing for canary releases.",
            rating: 4.9,
            installs: "14k",
            featured: true,
        },
        {
            id: "api-breaker",
            name: "API Breaker",
            category: "Traffic",
            description: "Circuit breaker for upstream health.",
            rating: 4.7,
            installs: "11k",
        },
        {
            id: "proxy-rewrite",
            name: "Proxy Rewrite",
            category: "Traffic",
            description: "Rewrite host/URI before proxying.",
            rating: 4.6,
            installs: "89k",
        },

        // Observability
        {
            id: "prometheus",
            name: "Prometheus",
            category: "Observability",
            description: "Export metrics for Grafana.",
            rating: 5.0,
            installs: "100k+",
            featured: true,
        },
        {
            id: "opentelemetry",
            name: "OTel",
            category: "Observability",
            description: "OpenTelemetry tracing support.",
            rating: 4.8,
            installs: "25k",
            featured: true,
        },
        {
            id: "zipkin",
            name: "Zipkin",
            category: "Observability",
            description: "Zipkin distributed tracing.",
            rating: 4.4,
            installs: "11k",
        },
        {
            id: "skywalking",
            name: "SkyWalking",
            category: "Observability",
            description: "Apache SkyWalking integration.",
            rating: 4.6,
            installs: "14k",
        },
        {
            id: "http-logger",
            name: "HTTP Logger",
            category: "Observability",
            description: "Push logs to external HTTP servers.",
            rating: 4.2,
            installs: "7k",
        },
        {
            id: "kafka-logger",
            name: "Kafka Logger",
            category: "Observability",
            description: "Send log data to Kafka topics.",
            rating: 4.5,
            installs: "13k",
        },

        // Serverless
        {
            id: "serverless-pre-function",
            name: "Serverless Pre",
            category: "Serverless",
            description: "Run custom Lua code before proxying.",
            rating: 4.9,
            installs: "8k",
            featured: true,
        },
        {
            id: "serverless-post-function",
            name: "Serverless Post",
            category: "Serverless",
            description: "Run custom Lua code after proxying.",
            rating: 4.8,
            installs: "6k",
        },
        {
            id: "aws-lambda",
            name: "AWS Lambda",
            category: "Serverless",
            description: "Invoke AWS Lambda functions.",
            rating: 4.7,
            installs: "12k",
        },
        {
            id: "azure-functions",
            name: "Azure Func",
            category: "Serverless",
            description: "Invoke Azure Serverless Functions.",
            rating: 4.6,
            installs: "5k",
        },

        // Transformation
        {
            id: "response-rewrite",
            name: "Response RW",
            category: "Transformation",
            description: "Rewrite body and status codes.",
            rating: 4.5,
            installs: "21k",
        },
        {
            id: "body-transformer",
            name: "Body Trans",
            category: "Transformation",
            description: "Transform request/response body.",
            rating: 4.6,
            installs: "9k",
        },
        {
            id: "grpc-transcode",
            name: "gRPC Trans",
            category: "Transformation",
            description: "REST to gRPC transcoding.",
            rating: 4.7,
            installs: "13k",
        },
        {
            id: "fault-injection",
            name: "Fault Inj",
            category: "Transformation",
            description: "Inject delays and errors.",
            rating: 4.3,
            installs: "4k",
        },

        // AI & LLM
        {
            id: "ai-proxy",
            name: "AI Proxy",
            category: "AI & LLM",
            description: "Proxy to LLM providers with token control.",
            rating: 5.0,
            installs: "3k",
            featured: true,
        },
        {
            id: "ai-proxy-multi",
            name: "AI Multi",
            category: "AI & LLM",
            description: "Multi-provider AI proxy with fallback.",
            rating: 4.9,
            installs: "1k",
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
