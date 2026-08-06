<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";
    import {
        Shield,
        Key,
        Zap,
        Eye,
        Server,
        Globe,
        Terminal,
        Star,
        Cpu,
        ExternalLink,
        Sparkles,
        Loader2
    } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import PageHeader from "$lib/components/ui/PageHeader.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";

    const categories = [
        { name: "All", icon: Globe },
        { name: "Authentication", icon: Key },
        { name: "Security", icon: Shield },
        { name: "Traffic", icon: Zap },
        { name: "Observability", icon: Eye },
        { name: "Serverless", icon: Server },
        { name: "Transformation", icon: Cpu },
        { name: "AI & LLM", icon: Sparkles },
    ];

    let plugins = $state<any[]>([
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
            id: "cors",
            name: "CORS",
            category: "Security",
            description: "Enable Cross-Origin Resource Sharing.",
            rating: 4.5,
            installs: "62k",
            featured: true,
        },
        {
            id: "limit-count",
            name: "Limit Count",
            category: "Traffic",
            description: "Rate limiting by request count per time window.",
            rating: 4.9,
            installs: "38k",
            featured: true,
        },
        {
            id: "ai-proxy",
            name: "AI Proxy",
            category: "AI & LLM",
            description: "Multi-provider AI proxy with fallback and key protection.",
            rating: 4.9,
            installs: "5k",
            featured: true,
        }
    ]);

    let loading = $state(false);
    let selectedCategory = $state("All");

    const filteredPlugins = $derived(
        selectedCategory === "All"
            ? plugins
            : plugins.filter((p) => p.category === selectedCategory),
    );

    function enablePlugin(id: string) {
        goto(`/routes/new?plugin=${id}`);
    }
</script>

<div class="space-y-6 max-w-7xl mx-auto pb-20">
    <PageHeader
        title="Plugin Marketplace"
        description="Extend APISIX Gateway with enterprise-grade security, traffic control, observability, and AI plugins."
        badge="Extensions"
    >
        {#snippet actions()}
            <a href="https://apisix.apache.org/docs/apisix/plugins/" target="_blank">
                <Button variant="outline" size="sm" class="gap-1.5">
                    <ExternalLink class="w-4 h-4" />
                    <span>Documentation</span>
                </Button>
            </a>
        {/snippet}
    </PageHeader>

    <!-- Category Filters -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2">
        {#each categories as cat}
            <Button
                variant={selectedCategory === cat.name ? "default" : "outline"}
                size="sm"
                onclick={() => (selectedCategory = cat.name)}
                class="gap-2 shrink-0 text-xs"
            >
                <cat.icon class="w-3.5 h-3.5" />
                <span>{cat.name}</span>
            </Button>
        {/each}
    </div>

    <!-- Plugins Grid -->
    {#if loading}
        <div class="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 class="w-8 h-8 animate-spin text-primary" />
            <p class="text-xs font-medium">Loading APISIX Plugin Catalog...</p>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {#each filteredPlugins as plugin}
                <Card class="p-6 flex flex-col justify-between hover:border-primary/50 transition-all group relative">
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <div class="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <Terminal class="w-5 h-5" />
                            </div>
                            {#if plugin.featured}
                                <Badge variant="warning" class="text-[9px] uppercase font-semibold">
                                    Featured
                                </Badge>
                            {/if}
                        </div>

                        <h3 class="text-base font-bold text-foreground mb-1">
                            {plugin.name}
                        </h3>

                        <div class="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" class="text-[10px]">
                                {plugin.category}
                            </Badge>
                            <span class="text-xs text-muted-foreground">★ {plugin.rating}</span>
                        </div>

                        <p class="text-xs text-muted-foreground leading-relaxed mb-6">
                            {plugin.description}
                        </p>
                    </div>

                    <div class="pt-4 border-t border-border flex items-center justify-between">
                        <span class="text-[11px] text-muted-foreground">
                            {plugin.installs} installs
                        </span>
                        <Button
                            variant="default"
                            size="xs"
                            onclick={() => enablePlugin(plugin.id)}
                            class="font-semibold"
                        >
                            Enable Plugin
                        </Button>
                    </div>
                </Card>
            {/each}
        </div>
    {/if}
</div>
