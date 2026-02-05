<script lang="ts">
    import { Search } from "lucide-svelte";

    interface Props {
        value: string;
        placeholder?: string;
        className?: string;
        onInput?: (val: string) => void;
    }

    let {
        value = $bindable(),
        placeholder = "Search...",
        className = "",
        onInput,
    }: Props = $props();
</script>

<div class="relative w-full group {className}">
    <Search
        class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:text-primary transition-colors"
    />
    <input
        type="text"
        bind:value
        {placeholder}
        oninput={(e) => onInput?.(e.currentTarget.value)}
        class="input input-lg w-full pl-12 rounded-2xl bg-base-100 border-none shadow-sm focus:outline-primary transition-all font-medium"
    />
</div>
