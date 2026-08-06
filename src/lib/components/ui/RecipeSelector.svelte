<script lang="ts">
    import { APISIX_RECIPES, type Recipe } from "$lib/utils/recipes";
    import { BookOpen, Sparkles, ChevronRight, X } from "lucide-svelte";

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
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans"
    >
        <!-- Backdrop -->
        <button
            type="button"
            class="absolute inset-0 w-full h-full cursor-default bg-transparent border-none"
            onclick={() => (show = false)}
            aria-label="Close modal"
        ></button>

        <!-- 100% Solid Opaque Card Modal -->
        <div
            class="relative z-[101] w-full max-w-2xl bg-card text-card-foreground rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        >
            <!-- Header -->
            <div
                class="px-6 py-4 border-b border-border bg-muted/50 flex items-center justify-between"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="p-2.5 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center"
                    >
                        <Sparkles class="w-5 h-5" />
                    </div>
                    <div>
                        <h2 class="text-base font-bold tracking-tight text-foreground">
                            APISIX Recipes & Best Practices
                        </h2>
                        <p class="text-xs text-muted-foreground">
                            Ready-to-use production gateway policies and snippets
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onclick={() => (show = false)}
                    class="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
                >
                    <X class="w-4 h-4" />
                </button>
            </div>

            <!-- Categories Tabs -->
            <div class="px-6 py-3 bg-muted/30 border-b border-border flex gap-2">
                {#each ["all", "plugin", "vars"] as cat}
                    <button
                        type="button"
                        onclick={() => (selectedCategory = cat as any)}
                        class="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                        {selectedCategory === cat
                            ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
                            : 'bg-card text-foreground border border-border hover:bg-accent'}"
                    >
                        {cat}
                    </button>
                {/each}
            </div>

            <!-- List of Recipes -->
            <div class="flex-1 overflow-y-auto p-5 space-y-3 bg-card">
                {#each filteredRecipes as recipe}
                    <button
                        type="button"
                        onclick={() => selectRecipe(recipe)}
                        class="w-full text-left p-4 rounded-2xl border border-border hover:border-rose-600/50 hover:bg-muted/50 transition-all group flex items-center justify-between bg-card text-card-foreground shadow-2xs"
                    >
                        <div class="space-y-1 max-w-[85%]">
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-bold tracking-tight text-foreground"
                                    >{recipe.name}</span
                                >
                                <span
                                    class="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold uppercase text-muted-foreground"
                                >
                                    {recipe.type}
                                </span>
                            </div>
                            <p class="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                {recipe.description}
                            </p>
                        </div>
                        <div
                            class="p-2 rounded-xl bg-muted group-hover:bg-rose-600 group-hover:text-white transition-all text-muted-foreground"
                        >
                            <ChevronRight class="w-4 h-4" />
                        </div>
                    </button>
                {/each}
            </div>

            <!-- Pro Tip Footer -->
            <div class="p-5 bg-muted/50 border-t border-border">
                <div class="flex items-start gap-3">
                    <BookOpen class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div class="space-y-0.5">
                        <p class="text-xs font-bold text-foreground">Pro Tip:</p>
                        <p class="text-xs text-muted-foreground leading-relaxed">
                            These snippets provide proven, production-grade gateway rules. Once inserted, you can fine-tune parameters directly inside the JSON Editor.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
