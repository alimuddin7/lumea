<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        title: string;
        description?: string;
        badge?: string;
        badgeType?:
            | "primary"
            | "secondary"
            | "accent"
            | "error"
            | "success"
            | "warning"
            | "info";
        actions?: Snippet;
        breadcrumbs?: Snippet;
    }

    let {
        title,
        description,
        badge,
        badgeType = "primary",
        actions,
        breadcrumbs,
    }: Props = $props();
</script>

<div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
    <div class="space-y-1">
        {#if breadcrumbs}
            <div
                class="text-[10px] breadcrumbs mb-2 opacity-30 font-black uppercase tracking-[0.15em]"
            >
                {@render breadcrumbs()}
            </div>
        {/if}

        <div class="flex items-center gap-3">
            <h1 class="text-3xl font-black tracking-tighter">
                {title}
            </h1>
            {#if badge}
                <div
                    class="badge badge-{badgeType} badge-ghost border-base-300 font-black tracking-widest text-[9px] h-5 px-2 uppercase opacity-60"
                >
                    {badge}
                </div>
            {/if}
        </div>

        {#if description}
            <p
                class="text-base-content/40 mt-1 max-w-xl text-sm font-medium leading-relaxed"
            >
                {description}
            </p>
        {/if}
    </div>

    {#if actions}
        <div class="flex items-center gap-2">
            {@render actions()}
        </div>
    {/if}
</div>
