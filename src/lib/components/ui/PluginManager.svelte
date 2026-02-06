<script lang="ts">
    import { Code2, LayoutPanelLeft } from "lucide-svelte";
    import PluginVisualBuilder from "./PluginVisualBuilder.svelte";
    import PluginAIAssistant from "./PluginAIAssistant.svelte";
    import Editor from "../Editor.svelte";

    let {
        pluginsJson = $bindable("{}"),
        contextLabel = "Plugin Manifest",
    }: {
        pluginsJson?: string;
        contextLabel?: string;
    } = $props();

    let editorMode = $state<"visual" | "code">("visual");
</script>

<div class="space-y-4">
    <!-- Switcher Tabs -->
    <div
        class="flex items-center gap-1.5 p-1 bg-base-200/50 rounded-xl w-fit border border-base-300/30"
    >
        <button
            onclick={() => (editorMode = "visual")}
            class="flex items-center gap-2 h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all {editorMode ===
            'visual'
                ? 'bg-base-100 text-primary shadow-sm border border-base-300'
                : 'opacity-40 hover:opacity-100'}"
        >
            <LayoutPanelLeft class="w-3 h-3" />
            Visual
        </button>
        <button
            onclick={() => (editorMode = "code")}
            class="flex items-center gap-2 h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all {editorMode ===
            'code'
                ? 'bg-base-100 text-primary shadow-sm border border-base-300'
                : 'opacity-40 hover:opacity-100'}"
        >
            <Code2 class="w-3 h-3" />
            JSON
        </button>
    </div>

    <!-- Content Area -->
    {#if editorMode === "visual"}
        <!-- Full-Width Visual Builder -->
        <div class="animate-in fade-in duration-300">
            <PluginVisualBuilder bind:pluginsJson />
        </div>
    {:else}
        <!-- Full-Width JSON Editor -->
        <div class="space-y-4 animate-in fade-in duration-300">
            <div class="flex items-center justify-between mb-2 px-1">
                <span
                    class="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 italic"
                    >{contextLabel}</span
                >
                <div class="flex gap-2">
                    <span class="w-2 h-2 rounded-full bg-success animate-pulse"
                    ></span>
                    <span
                        class="text-[8px] font-bold opacity-20 uppercase tracking-widest"
                        >Direct Edit Mode</span
                    >
                </div>
            </div>
            <div
                class="h-[550px] rounded-2xl overflow-hidden border border-base-300 shadow-2xl"
            >
                <Editor bind:value={pluginsJson} />
            </div>
        </div>
    {/if}

    <PluginAIAssistant bind:pluginsJson />
</div>
