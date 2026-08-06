<script lang="ts">
    import type { Snippet } from "svelte";
    import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-svelte";
    import Button from "./Button.svelte";
    import Input from "./Input.svelte";

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

    let totalPages = $derived(Math.ceil(totalItems / pageSize) || 1);
</script>

<div
    class="w-full bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden flex flex-col"
>
    {#if showSearch || headerActions}
        <div
            class="px-5 py-3.5 border-b border-border/60 flex flex-wrap items-center justify-between gap-4 bg-muted/20"
        >
            <div class="flex items-center gap-3 flex-1 min-w-[240px]">
                {#if showSearch}
                    <div class="relative w-full max-w-xs">
                        <Search
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                        />
                        <Input
                            type="text"
                            bind:value={searchValue}
                            oninput={(e) => onSearch?.(e.currentTarget.value)}
                            placeholder={searchPlaceholder}
                            class="pl-9 h-8 text-xs bg-background/80"
                        />
                    </div>
                {/if}

                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase whitespace-nowrap">Show</span>
                    <select
                        class="h-8 rounded-md bg-background border border-input px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
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

    <div class="overflow-x-auto w-full">
        <table class="w-full text-left border-collapse text-xs">
            <thead>
                <tr class="border-b border-border bg-muted/40 text-muted-foreground select-none">
                    {#each columns as col}
                        <th class="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider">{col}</th>
                    {/each}
                </tr>
            </thead>
            <tbody class="divide-y divide-border/50">
                {#if loading}
                    <tr>
                        <td colspan={columns.length} class="py-16 text-center">
                            <div class="flex flex-col items-center justify-center gap-2">
                                <Loader2 class="w-6 h-6 animate-spin text-primary opacity-80" />
                                <p class="text-xs font-medium text-muted-foreground">
                                    {loadingMessage}
                                </p>
                            </div>
                        </td>
                    </tr>
                {:else if items.length === 0}
                    <tr>
                        <td colspan={columns.length} class="py-16 text-center">
                            <p class="text-xs font-medium text-muted-foreground italic">
                                {emptyMessage}
                            </p>
                        </td>
                    </tr>
                {:else}
                    {#each items as item}
                        <tr class="hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0">
                            {@render rowSnippet(item)}
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>

    {#if totalItems > 0 || footerSnippet}
        <div
            class="px-5 py-3 border-t border-border/60 flex items-center justify-between bg-muted/10 text-xs text-muted-foreground"
        >
            <div class="flex items-center gap-4">
                <div class="font-medium">
                    Total: <span class="text-foreground font-semibold">{totalItems}</span> Records
                </div>
                {#if footerSnippet}
                    {@render footerSnippet()}
                {/if}
            </div>

            {#if totalPages > 1}
                <div class="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        class="h-7 w-7"
                        onclick={() => onPageChange?.(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft class="w-4 h-4" />
                    </Button>

                    <div class="flex items-center gap-1 mx-1">
                        {#each Array(totalPages) as _, i}
                            {#if i + 1 === currentPage}
                                <div class="w-7 h-7 flex items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold shadow-xs">
                                    {i + 1}
                                </div>
                            {:else if Math.abs(i + 1 - currentPage) < 2 || i === 0 || i === totalPages - 1}
                                <button
                                    onclick={() => onPageChange?.(i + 1)}
                                    class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {i + 1}
                                </button>
                            {:else if Math.abs(i + 1 - currentPage) === 2}
                                <span class="text-xs text-muted-foreground px-1">•••</span>
                            {/if}
                        {/each}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        class="h-7 w-7"
                        onclick={() => onPageChange?.(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight class="w-4 h-4" />
                    </Button>
                </div>
            {/if}
        </div>
    {/if}
</div>
