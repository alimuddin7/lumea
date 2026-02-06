<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import {
        Code2,
        Braces,
        FileJson,
        Wand2,
        Maximize2,
        Minimize2,
    } from "lucide-svelte";

    let {
        value = $bindable(),
        language = $bindable("json"),
        readonly = false,
        onchange = undefined,
    }: {
        value: string;
        language?: string;
        readonly?: boolean;
        onchange?: () => void;
    } = $props();
    let container: HTMLElement;
    let editor: any;
    let currentModel: any;
    let monaco: any;

    onMount(async () => {
        // Dynamically import monaco only on client side
        monaco = await import("monaco-editor");

        // Disable Monaco web workers to prevent 404 errors
        (window as any).MonacoEnvironment = {
            getWorker: () => {
                return {
                    postMessage: () => {},
                    addEventListener: () => {},
                    removeEventListener: () => {},
                    terminate: () => {},
                    dispatchEvent: () => true,
                };
            },
        };

        // Create model once
        currentModel = monaco.editor.createModel(value, language);

        editor = monaco.editor.create(container, {
            model: currentModel,
            theme: "vs",
            automaticLayout: true,
            readOnly: readonly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        });

        editor.onDidChangeModelContent(() => {
            const val = editor.getValue();
            if (val !== value) {
                value = val;
                if (onchange) onchange();
            }
        });
    });

    // Reactive sync
    $effect(() => {
        if (!currentModel || !editor) return;

        // Sync value
        if (value !== currentModel.getValue()) {
            try {
                currentModel.setValue(value);
            } catch (e) {
                // Ignore cancellation errors
            }
        }

        // Sync language
        if (language) {
            try {
                monaco.editor.setModelLanguage(currentModel, language);
            } catch (e) {
                // Ignore cancellation errors
            }
        }
    });

    function toggleFormat() {
        if (language === "json") {
            try {
                value = JSON.stringify(JSON.parse(value), null, 2);
            } catch (e) {}
        }
    }

    onDestroy(() => {
        if (currentModel) {
            currentModel.dispose();
        }
        if (editor) {
            editor.dispose();
        }
    });
</script>

<div
    class="flex flex-col h-full bg-base-100 rounded-xl border border-base-300 overflow-hidden shadow-sm group"
>
    <!-- Toolbar -->
    <div
        class="flex items-center justify-between px-4 py-2 bg-base-200 border-b border-base-300"
    >
        <div class="flex items-center gap-3">
            <div
                class="flex items-center bg-base-100 px-3 py-1 rounded-lg border border-base-300 gap-2"
            >
                <FileJson class="w-3 h-3 text-primary opacity-50" />
                <span
                    class="text-[9px] font-black uppercase tracking-widest opacity-60"
                    >JSON</span
                >
            </div>
            <span
                class="text-[9px] font-black uppercase tracking-widest opacity-20 italic"
                >Config Editor</span
            >
        </div>
        <div
            class="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity"
        >
            <button
                onclick={toggleFormat}
                title="Auto-format JSON"
                class="p-1.5 hover:bg-base-300 rounded-lg transition-colors text-primary"
            >
                <Wand2 class="w-3.5 h-3.5" />
            </button>
        </div>
    </div>

    <!-- Editor Surface -->
    <div bind:this={container} class="flex-1 min-h-0"></div>
</div>
