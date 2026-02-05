<script lang="ts">
    import type { Component } from "svelte";

    interface Props {
        title: string;
        value: string | number;
        description?: string;
        icon?: Component<any>;
        type?:
            | "primary"
            | "secondary"
            | "accent"
            | "success"
            | "warning"
            | "error"
            | "info";
        trend?: string;
        trendType?: "success" | "error" | "warning";
    }

    let {
        title,
        value,
        description,
        icon: Icon,
        type = "primary",
        trend,
        trendType = "success",
    }: Props = $props();
</script>

<div
    class="stats bg-base-100 border border-base-300 rounded-2xl w-full shadow-sm"
>
    <div class="stat p-6 overflow-hidden">
        <div
            class="stat-title text-[9px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-2"
        >
            {title}
        </div>

        <div class="flex items-center justify-between">
            <div
                class="stat-value text-2xl font-black tracking-tighter text-base-content italic"
            >
                {value}
            </div>

            {#if Icon}
                <div class="opacity-10 text-primary">
                    <Icon class="w-6 h-6" />
                </div>
            {/if}
        </div>

        {#if description || trend}
            <div class="stat-desc font-bold mt-2.5 flex items-center gap-2">
                {#if trend}
                    <span
                        class="text-{trendType} text-[9px] uppercase font-black tracking-widest leading-none bg-base-200 px-1.5 py-1 rounded"
                    >
                        {trend}
                    </span>
                {/if}
                {#if description}
                    <span
                        class="text-[9px] font-black opacity-20 uppercase tracking-widest"
                    >
                        {description}
                    </span>
                {/if}
            </div>
        {/if}
    </div>
</div>
