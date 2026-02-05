<script lang="ts">
    import { APISIX_RECIPES, type Recipe } from "$lib/utils/recipes";
    import { BookOpen, Sparkles, Copy, ChevronRight, X } from "lucide-svelte";
    import { fade, slide } from "svelte/transition";

    let { onSelect, show = $bindable() } = $props();

    let selectedCategory = $state<"all" | "plugin" | "route" | "vars">("all");

    const filteredRecipes = $derived(
        selectedCategory === "all"
            ? APISIX_RECIPES
            : APISIX_RECIPES.filter((r) => r.type === selectedCategory),
    );

    function selectRecipe(recipe: Recipe) {
        onSelect(recipe);
        show = false;
    }
</script>

{#if show}
    <div
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-base-300/80 backdrop-blur-sm"
    >
        <!-- Backdrop -->
        <button
            type="button"
            class="absolute inset-0 w-full h-full cursor-default bg-transparent border-none"
            onclick={() => (show = false)}
            aria-label="Close modal"
        ></button>

        <!-- Modal -->
        <div
            class="relative w-full max-w-2xl bg-base-100 rounded-3xl shadow-2xl border border-base-300 overflow-hidden flex flex-col max-h-[80vh]"
        >
            <!-- Header -->
            <div
                class="px-6 py-5 border-b border-base-200 flex items-center justify-between"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"
                    >
                        <Sparkles class="w-5 h-5" />
                    </div>
                    <div>
                        <h2 class="text-lg font-black tracking-tight italic">
                            APISIX Recipes
                        </h2>
                        <p
                            class="text-[10px] uppercase font-bold tracking-widest opacity-40"
                        >
                            Ready-to-use Gateway Patterns
                        </p>
                    </div>
                </div>
                <button
                    onclick={() => (show = false)}
                    class="p-2 hover:bg-base-200 rounded-full transition-colors opacity-40 hover:opacity-100"
                >
                    <X class="w-5 h-5" />
                </button>
            </div>

            <!-- Categories -->
            <div class="px-6 py-3 bg-base-200/50 flex gap-2">
                {#each ["all", "plugin", "vars"] as cat}
                    <button
                        onclick={() => (selectedCategory = cat as any)}
                        class="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                        {selectedCategory === cat
                            ? 'bg-primary text-primary-content shadow-lg shadow-primary/20'
                            : 'bg-base-100 border border-base-300 opacity-50 hover:opacity-100'}"
                    >
                        {cat}
                    </button>
                {/each}
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
                {#each filteredRecipes as recipe}
                    <button
                        onclick={() => selectRecipe(recipe)}
                        class="w-full text-left p-4 rounded-2xl border border-base-300/50 hover:border-primary/40 hover:bg-primary/5 transition-all group flex items-center justify-between"
                    >
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-black tracking-tight"
                                    >{recipe.name}</span
                                >
                                <span
                                    class="px-2 py-0.5 rounded-lg bg-base-200 text-[8px] font-black uppercase tracking-widest opacity-40"
                                >
                                    {recipe.type}
                                </span>
                            </div>
                            <p class="text-[11px] opacity-50 line-clamp-1">
                                {recipe.description}
                            </p>
                        </div>
                        <div
                            class="p-2 rounded-xl bg-base-200 group-hover:bg-primary group-hover:text-primary-content transition-all"
                        >
                            <ChevronRight class="w-4 h-4" />
                        </div>
                    </button>
                {/each}
            </div>

            <!-- Footer -->
            <div class="p-6 bg-base-200/30 border-t border-base-200">
                <div class="flex items-start gap-4">
                    <BookOpen class="w-5 h-5 text-primary opacity-40 mt-1" />
                    <div class="space-y-1">
                        <p class="text-[11px] font-black italic">Pro Tip:</p>
                        <p class="text-[10px] opacity-60 leading-relaxed">
                            These snippets provide the core logic for common
                            gateway tasks. After inserting, you can further
                            customize them in the JSON editor to match your
                            specific backend environment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
