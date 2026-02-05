<script lang="ts">
    import type { Snippet } from "svelte";
    import { Search, ChevronLeft, ChevronRight } from "lucide-svelte";

    interface Props {
        columns: string[];
        loading?: boolean;
        loadingMessage?: string;
        emptyMessage?: string;
        items: any[];
        rowSnippet: Snippet<[any]>;

        // Search
        showSearch?: boolean;
        searchPlaceholder?: string;
        searchValue?: string;
        onSearch?: (value: string) => void;

        // Pagination
        totalItems?: number;
        pageSize?: number;
        currentPage?: number;
        onPageChange?: (page: number) => void;

        // Snippets
        headerActions?: Snippet;
        footerSnippet?: Snippet;
    }

    let {
        columns,
        loading = false,
        loadingMessage = "Loading...",
        emptyMessage = "No data available.",
        items,
        rowSnippet,
        showSearch = false,
        searchPlaceholder = "Search results...",
        searchValue = $bindable(""),
        onSearch,
        totalItems = 0,
        pageSize = $bindable(10),
        currentPage = 1,
        onPageChange,
        headerActions,
        footerSnippet,
    }: Props = $props();

    let totalPages = $derived(Math.ceil(totalItems / pageSize));
</script>

<div
    class="w-full bg-base-100/50 rounded-2xl border border-base-300/50 overflow-hidden flex flex-col"
>
    {#if showSearch || headerActions}
        <div
            class="px-6 py-4 border-b border-base-300/50 flex items-center justify-between gap-4"
        >
            <div class="flex items-center gap-3 flex-1">
                {#if showSearch}
                    <div class="relative w-full max-w-xs">
                        <Search
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-20"
                        />
                        <input
                            type="text"
                            bind:value={searchValue}
                            oninput={(e) => onSearch?.(e.currentTarget.value)}
                            placeholder={searchPlaceholder}
                            class="input-minimal !pl-10"
                        />
                    </div>
                {/if}

                <div class="flex items-center gap-2">
                    <span
                        class="text-[9px] font-black uppercase tracking-widest opacity-20 whitespace-nowrap"
                        >Show</span
                    >
                    <select
                        class="select select-bordered select-xs h-8 rounded-lg bg-base-200/50 border-base-300 text-[10px] font-bold outline-none"
                        bind:value={pageSize}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            {#if headerActions}
                <div class="flex items-center gap-2">
                    {@render headerActions()}
                </div>
            {/if}
        </div>
    {/if}

    <div class="overflow-x-auto">
        <table class="table table-md table-zebra-zebra">
            <thead>
                <tr class="border-b border-base-300 select-none">
                    {#each columns as col}
                        <th
                            class="py-4 px-6 text-[10px] font-black uppercase tracking-[0.1em] opacity-40"
                            >{col}</th
                        >
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#if loading}
                    <tr>
                        <td colspan={columns.length} class="py-20 text-center">
                            <span
                                class="loading loading-spinner loading-md opacity-20"
                            ></span>
                            <p
                                class="mt-3 text-[10px] font-black uppercase tracking-widest opacity-20"
                            >
                                {loadingMessage}
                            </p>
                        </td>
                    </tr>
                {:else if items.length === 0}
                    <tr>
                        <td colspan={columns.length} class="py-20 text-center">
                            <p class="text-sm font-medium opacity-30 italic">
                                {emptyMessage}
                            </p>
                        </td>
                    </tr>
                {:else}
                    {#each items as item}
                        <tr
                            class="hover:bg-base-200/50 transition-colors border-b border-base-300 last:border-0 group"
                        >
                            {@render rowSnippet(item)}
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>

    {#if totalItems > 0 || footerSnippet}
        <div
            class="px-6 py-4 border-t border-base-300/50 flex items-center justify-between"
        >
            <div class="flex items-center gap-4">
                <div
                    class="text-[10px] font-black uppercase tracking-[0.15em] opacity-30"
                >
                    Total: <span class="text-base-content opacity-100"
                        >{totalItems}</span
                    > Records
                </div>
                {#if footerSnippet}
                    {@render footerSnippet()}
                {/if}
            </div>

            {#if totalPages > 1}
                <div class="flex items-center gap-1">
                    <button
                        onclick={() => onPageChange?.(currentPage - 1)}
                        disabled={currentPage === 1}
                        class="btn btn-ghost btn-square btn-xs disabled:opacity-10"
                    >
                        <ChevronLeft class="w-3.5 h-3.5" />
                    </button>

                    <div class="flex items-center gap-1.5 mx-2">
                        {#each Array(totalPages) as _, i}
                            {#if i + 1 === currentPage}
                                <div
                                    class="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary text-[10px] font-black border border-primary/20 shadow-[0_0_12px_rgba(var(--p),0.1)]"
                                >
                                    {i + 1}
                                </div>
                            {:else if Math.abs(i + 1 - currentPage) < 2 || i === 0 || i === totalPages - 1}
                                <button
                                    onclick={() => onPageChange?.(i + 1)}
                                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-base-200 text-[10px] font-black opacity-30 hover:opacity-100 transition-all font-mono"
                                >
                                    {i + 1}
                                </button>
                            {:else if Math.abs(i + 1 - currentPage) === 2}
                                <span class="text-[10px] opacity-10 font-black"
                                    >•••</span
                                >
                            {/if}
                        {/each}
                    </div>

                    <button
                        onclick={() => onPageChange?.(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        class="btn btn-ghost btn-square btn-xs disabled:opacity-10"
                    >
                        <ChevronRight class="w-3.5 h-3.5" />
                    </button>
                </div>
            {/if}
        </div>
    {/if}
</div>
