<script lang="ts">
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
        trueType = "success",
        falseType = "base-300",
        subtitle,
    }: Props = $props();

    const isActive = $derived(
        status === true || status === 1 || status === "active",
    );
</script>

<div
    class="flex items-center gap-2.5 {isActive
        ? ''
        : 'opacity-40 grayscale'} transition-all duration-300"
>
    <div class="relative flex items-center justify-center">
        {#if isActive}
            <div
                class="absolute w-2.5 h-2.5 rounded-full bg-{trueType} animate-ping opacity-20"
            ></div>
            <div class="absolute w-4 h-4 rounded-full bg-{trueType}/10"></div>
        {/if}
        <div
            class="w-2 h-2 rounded-full bg-{isActive
                ? trueType
                : falseType} relative shadow-[0_0_8px_rgba(var(--{isActive
                ? 'p'
                : 'bc'}),0.3)]"
        ></div>
    </div>
    <div class="flex flex-col">
        <div class="flex items-center gap-1.5">
            <span
                class="text-[10px] font-black uppercase tracking-[0.1em] {isActive
                    ? 'text-base-content'
                    : 'text-base-content/60'}"
            >
                {isActive ? trueLabel : falseLabel}
            </span>
            {#if isActive}
                <span class="flex h-1 w-1">
                    <span
                        class="animate-ping absolute inline-flex h-1 w-1 rounded-full bg-success opacity-75"
                    ></span>
                    <span
                        class="relative inline-flex rounded-full h-1 w-1 bg-success"
                    ></span>
                </span>
            {/if}
        </div>
        {#if subtitle}
            {@render subtitle()}
        {/if}
    </div>
</div>
