<script lang="ts">
    import Badge from "./Badge.svelte";

    interface Props {
        status: boolean | number | string;
        trueLabel?: string;
        falseLabel?: string;
        trueType?: string;
        falseType?: string;
        subtitle?: import("svelte").Snippet;
    }

    let {
        status,
        trueLabel = "Active",
        falseLabel = "Inactive",
        trueType,
        falseType,
        subtitle,
    }: Props = $props();

    const isActive = $derived(
        status === true || status === 1 || status === "active" || status === "Enabled"
    );
</script>

<div class="flex items-center gap-2">
    {#if isActive}
        <Badge variant="success" class="gap-1.5 py-0.5">
            <span class="relative flex h-1.5 w-1.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            {trueLabel}
        </Badge>
    {:else}
        <Badge variant="secondary" class="gap-1.5 py-0.5 opacity-70">
            <span class="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"></span>
            {falseLabel}
        </Badge>
    {/if}

    {#if subtitle}
        <span class="text-xs text-muted-foreground">
            {@render subtitle()}
        </span>
    {/if}
</div>
