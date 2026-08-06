<script lang="ts">
    import Card from "./Card.svelte";

    interface Props {
        title: string;
        value: string | number;
        description?: string;
        icon?: any;
        trend?: string;
        trendType?: "success" | "error" | "warning";
    }

    let {
        title,
        value,
        description,
        icon: Icon,
        trend,
        trendType = "success",
    }: Props = $props();
</script>

<Card class="p-5">
    <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
        </span>
        {#if Icon}
            <div class="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon class="w-4 h-4" />
            </div>
        {/if}
    </div>

    <div class="mt-3 flex items-baseline justify-between">
        <div class="text-2xl font-bold tracking-tight text-foreground">
            {value}
        </div>
    </div>

    {#if description || trend}
        <div class="mt-2.5 flex items-center gap-2 text-xs">
            {#if trend}
                <span
                    class="font-semibold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide
                    {trendType === 'success' ? 'bg-emerald-500/15 text-emerald-400' : ''}
                    {trendType === 'error' ? 'bg-red-500/15 text-red-400' : ''}
                    {trendType === 'warning' ? 'bg-amber-500/15 text-amber-400' : ''}"
                >
                    {trend}
                </span>
            {/if}
            {#if description}
                <span class="text-muted-foreground text-xs">
                    {description}
                </span>
            {/if}
        </div>
    {/if}
</Card>
