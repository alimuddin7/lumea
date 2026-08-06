<script lang="ts">
    import { Sparkles, Send, Bot, User, Wand2, Lightbulb, Check, AlertCircle, Loader2 } from "lucide-svelte";
    import { slide, fade } from "svelte/transition";
    import { aiStore, generateAPISIXAIRecommendation } from "$lib/stores/aiStore";
    import Button from "./Button.svelte";
    import Input from "./Input.svelte";
    import Badge from "./Badge.svelte";

    let { pluginsJson = $bindable("{}") } = $props();

    let isOpen = $state(false);
    let query = $state("");
    let isTyping = $state(false);
    let lastSuggestedJson = $state<string | null>(null);

    let messages = $state<{ role: "assistant" | "user"; content: string; jsonPreview?: string }[]>([
        {
            role: "assistant",
            content: "Halo! Saya Lumea AI Assistant. Saya siap membantu mengonfigurasi rute dan plugin APISIX secara otomatis berdasarkan prompt bahasa alami Anda.",
        },
    ]);

    const suggestions = [
        "Tambahkan rate limiting 100 req/min",
        "Aktifkan CORS untuk semua origin",
        "Setup Key Authentication (key-auth)",
        "Tambahkan IP Restriction untuk whitelist"
    ];

    async function handleSend() {
        if (!query.trim() || isTyping) return;

        const userMsg = query;
        messages = [...messages, { role: "user", content: userMsg }];
        query = "";
        isTyping = true;
        lastSuggestedJson = null;

        try {
            if (!$aiStore.apiKey) {
                messages = [...messages, {
                    role: "assistant",
                    content: "⚠️ **API Key AI Belum Diatur**. Silakan buka menu **Setup AI Integration** di header / settings untuk memasukkan API Key dan memilih model AI (OpenAI, Gemini, Anthropic, atau DeepSeek)."
                }];
                isTyping = false;
                return;
            }

            const currentObj = JSON.parse(pluginsJson || "{}");
            const result = await generateAPISIXAIRecommendation(userMsg, [currentObj]);
            
            let jsonString = "";
            if (result.suggestedPlugins) {
                const merged = { ...currentObj, ...result.suggestedPlugins };
                jsonString = JSON.stringify(merged, null, 2);
                lastSuggestedJson = jsonString;
            }

            messages = [...messages, {
                role: "assistant",
                content: result.recommendation,
                jsonPreview: jsonString || undefined
            }];
        } catch (err: any) {
            messages = [...messages, {
                role: "assistant",
                content: `❌ Gagal memproses prompt AI: ${err.message || "Terjadi masalah koneksi"}`
            }];
        } finally {
            isTyping = false;
        }
    }

    function applyAIConfiguration(jsonStr: string) {
        if (jsonStr) {
            pluginsJson = jsonStr;
            messages = [...messages, {
                role: "assistant",
                content: "✅ Konfigurasi hasil rekomendasi AI berhasil diterapkan ke APISIX Plugin Manager!"
            }];
        }
    }

    function applySuggestion(s: string) {
        query = s;
        handleSend();
    }
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
    {#if isOpen}
        <div
            class="w-[420px] h-[540px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 opacity-100 rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
            transition:slide
        >
            <!-- Header -->
            <div class="p-4 bg-slate-100 dark:bg-slate-800 border-b border-border flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <div class="p-2 bg-rose-600/10 text-rose-600 rounded-xl">
                        <Sparkles class="w-5 h-5" />
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h3 class="text-sm font-bold tracking-tight text-foreground">
                                Lumea AI Assistant
                            </h3>
                            <Badge variant="outline" class="text-[9px] py-0 font-semibold">
                                {$aiStore.selectedModel || "AI Pilot"}
                            </Badge>
                        </div>
                        <p class="text-[10px] text-muted-foreground">
                            APISIX Route & Plugin Copilot
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onclick={() => (isOpen = false)}
                    class="p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                    ✕
                </button>
            </div>

            <!-- Messages Stream -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-950">
                {#each messages as msg}
                    <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                        <div class="max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed {msg.role === 'user' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'bg-slate-100 dark:bg-slate-800 border border-border text-foreground shadow-xs'}">
                            <div class="whitespace-pre-wrap">{msg.content}</div>

                            {#if msg.jsonPreview}
                                <div class="mt-3 pt-3 border-t border-border space-y-2">
                                    <div class="text-[10px] font-bold uppercase text-rose-600">Rekomendasi JSON APISIX:</div>
                                    <pre class="p-2.5 bg-slate-200 dark:bg-slate-900 rounded-lg text-[10px] font-mono text-foreground overflow-x-auto border border-border max-h-32">{msg.jsonPreview}</pre>
                                    <Button
                                        size="xs"
                                        variant="default"
                                        class="w-full gap-1.5 font-bold"
                                        onclick={() => applyAIConfiguration(msg.jsonPreview!)}
                                    >
                                        <Check class="w-3.5 h-3.5" />
                                        <span>Apply AI Configuration</span>
                                    </Button>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}

                {#if isTyping}
                    <div class="flex justify-start">
                        <div class="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-border text-xs flex items-center gap-2 text-muted-foreground">
                            <Loader2 class="w-4 h-4 animate-spin text-rose-600" />
                            <span>Menganalisis prompt & memproses model AI...</span>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Quick Suggestions -->
            <div class="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-t border-border flex items-center gap-1.5 overflow-x-auto">
                <span class="text-[10px] text-muted-foreground font-bold shrink-0">Saran:</span>
                {#each suggestions as s}
                    <button
                        type="button"
                        onclick={() => applySuggestion(s)}
                        class="text-[10px] px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-accent border border-border rounded-lg shrink-0 text-foreground font-medium transition-colors shadow-2xs"
                    >
                        {s}
                    </button>
                {/each}
            </div>

            <!-- Input Bar -->
            <div class="p-3 bg-white dark:bg-slate-900 border-t border-border flex items-center gap-2">
                <Input
                    bind:value={query}
                    onkeydown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Instruksikan AI untuk konfigurasi rute/plugin..."
                    class="h-9 text-xs flex-1 bg-slate-50 dark:bg-slate-950"
                />
                <Button size="sm" class="h-9 px-3" onclick={handleSend} disabled={isTyping || !query.trim()}>
                    <Send class="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    {/if}

    <!-- Toggle Floating Button -->
    <Button
        variant="default"
        size="lg"
        onclick={() => (isOpen = !isOpen)}
        class="shadow-xl rounded-full px-5 py-6 gap-2 text-white font-bold transition-all hover:scale-105"
    >
        <Sparkles class="w-5 h-5 text-amber-300" />
        <span class="font-bold text-xs">AI Copilot</span>
        {#if $aiStore.selectedModel}
            <span class="text-[10px] opacity-80 font-normal border-l border-white/30 pl-2">
                {$aiStore.selectedModel}
            </span>
        {/if}
    </Button>
</div>
