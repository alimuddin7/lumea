<script lang="ts">
    import type { Snippet } from "svelte";
    import Badge from "./Badge.svelte";

    interface Props {
        title: string;
        description?: string;
        badge?: string;
        badgeType?: string;
        actions?: Snippet;
        breadcrumbs?: Snippet;
        children?: Snippet;
    }

    let {
        title,
        description,
        badge,
        badgeType,
        actions,
        breadcrumbs,
        children,
    }: Props = $props();
</script>

<div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
    <div class="space-y-1.5">
        {#if breadcrumbs}
            <div class="text-xs text-muted-foreground font-medium mb-1">
                {@render breadcrumbs()}
            </div>
        {/if}

        <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold tracking-tight text-foreground">
                {title}
            </h1>
            {#if badge}
                <Badge variant="secondary" class="text-[10px] uppercase font-semibold">
                    {badge}
                </Badge>
            {/if}
        </div>

        {#if description}
            <p class="text-muted-foreground text-xs md:text-sm max-w-2xl font-normal leading-relaxed">
                {description}
            </p>
        {/if}
    </div>

    {#if actions}
        <div class="flex items-center gap-2">
            {@render actions()}
        </div>
    {:else if children}
        <div class="flex items-center gap-2">
            {@render children()}
        </div>
    {/if}
</div>
