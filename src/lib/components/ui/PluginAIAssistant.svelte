<script lang="ts">
    import { Sparkles, Send, Bot, User, Wand2, Lightbulb } from "lucide-svelte";
    import { slide, fade } from "svelte/transition";

    let { pluginsJson = $bindable() } = $props();

    let isOpen = $state(false);
    let query = $state("");
    let isTyping = $state(false);

    let messages = $state([
        {
            role: "assistant",
            content:
                "Hello! I am Lumea AI. I can help you configure your APISIX plugins. What are you trying to achieve today?",
        },
    ]);

    const suggestions = [
        "Enable CORS for all origins",
        "Add key-auth with custom key",
        "Setup rate limiting for 100 req/min",
        "Add a proxy-rewrite for /api/v1",
    ];

    async function handleSend() {
        if (!query.trim()) return;

        const userMsg = query;
        messages = [...messages, { role: "user", content: userMsg }];
        query = "";
        isTyping = true;

        // Simulate AI thinking
        setTimeout(() => {
            isTyping = false;
            let response = "";
            let newJson = "";

            if (userMsg.toLowerCase().includes("cors")) {
                response =
                    "I've updated the configuration to enable CORS. It now allows all origins and common methods. You can see the changes in the Visual/JSON tabs.";
                newJson = JSON.stringify(
                    {
                        ...JSON.parse(pluginsJson),
                        cors: {
                            allow_origins: "*",
                            allow_methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
                            allow_headers: "*",
                            allow_credential: true,
                        },
                    },
                    null,
                    2,
                );
            } else if (userMsg.toLowerCase().includes("rate limit")) {
                response =
                    "I've added the limit-count plugin. It's configured for 100 requests per minute with a 503 error if exceeded.";
                newJson = JSON.stringify(
                    {
                        ...JSON.parse(pluginsJson),
                        "limit-count": {
                            count: 100,
                            time_window: 60,
                            rejected_code: 503,
                            key: "remote_addr",
                        },
                    },
                    null,
                    2,
                );
            } else if (
                userMsg.toLowerCase().includes("body") ||
                userMsg.toLowerCase().includes("pindahkan") ||
                userMsg.toLowerCase().includes("route")
            ) {
                response =
                    "I can help with advanced routing. I've configured a serverless-pre-function to check for specific keywords in the request body and set a routing marker. You can further customize this in the 'Smart Recipes' section of the Visual tab.";
                newJson = JSON.stringify(
                    {
                        ...JSON.parse(pluginsJson),
                        "serverless-pre-function": {
                            functions: [
                                'return function(conf, ctx)\n    local core = require("apisix.core")\n    local body = core.request.get_body()\n    if body and string.find(body, "premium") then\n        core.request.set_header(ctx, "X-Route-Premium", "true")\n    end\nend',
                            ],
                        },
                    },
                    null,
                    2,
                );
            } else {
                response =
                    "I'm sorry, I'm a specialized assistant for plugin configurations. I can help with CORS, Rate Limiting, Serverless Routing, and Authentication. Try asking for 'Route by body content'!";
            }

            if (newJson) pluginsJson = newJson;
            messages = [...messages, { role: "assistant", content: response }];
        }, 1500);
    }

    function applySuggestion(s: string) {
        query = s;
        handleSend();
    }
</script>

<div class="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
    {#if isOpen}
        <div
            class="w-[380px] h-[500px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-500"
            transition:slide
        >
            <!-- Header -->
            <div
                class="p-6 bg-slate-900 text-white flex items-center justify-between"
            >
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/20 rounded-xl">
                        <Sparkles class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 class="text-sm font-black tracking-tight">
                            Lumea AI Assistant
                        </h3>
                        <p
                            class="text-[8px] font-black uppercase tracking-widest text-primary"
                        >
                            Configuration Pilot
                        </p>
                    </div>
                </div>
                <button
                    onclick={() => (isOpen = false)}
                    class="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <Wand2 class="w-4 h-4 rotate-45" />
                </button>
            </div>

            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {#each messages as msg}
                    <div
                        class="flex {msg.role === 'user'
                            ? 'justify-end'
                            : 'justify-start'}"
                        transition:fade
                    >
                        <div
                            class="max-w-[85%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed {msg.role ===
                            'user'
                                ? 'bg-primary text-primary-content rounded-tr-none shadow-lg shadow-primary/10'
                                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'}"
                        >
                            {msg.content}
                        </div>
                    </div>
                {/each}

                {#if isTyping}
                    <div class="flex justify-start">
                        <div
                            class="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none"
                        >
                            <div class="flex gap-1.5">
                                <span
                                    class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"
                                ></span>
                                <span
                                    class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"
                                ></span>
                                <span
                                    class="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"
                                ></span>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Footer -->
            <div class="p-6 bg-white border-t border-slate-100">
                {#if messages.length === 1}
                    <div class="flex flex-wrap gap-1.5 mb-4">
                        {#each suggestions as s}
                            <button
                                onclick={() => applySuggestion(s)}
                                class="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:border-primary hover:text-primary transition-all"
                            >
                                {s}
                            </button>
                        {/each}
                    </div>
                {/if}
                <div
                    class="relative flex items-center group focus-within:ring-2 focus-within:ring-primary/20 rounded-2xl transition-all"
                >
                    <input
                        bind:value={query}
                        onkeydown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask for a configuration..."
                        class="w-full h-12 pl-4 pr-12 bg-slate-50 rounded-2xl border-none focus:ring-0 text-[11px] font-bold text-slate-900 placeholder:text-slate-300"
                    />
                    <button
                        onclick={handleSend}
                        class="absolute right-2 p-2 bg-primary text-primary-content rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
                    >
                        <Send class="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <button
        onclick={() => (isOpen = !isOpen)}
        class="h-16 w-16 rounded-full bg-slate-900 text-white shadow-2xl flex items-center justify-center group hover:scale-110 active:scale-95 transition-all relative overflow-hidden"
    >
        <div
            class="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"
        ></div>
        <Sparkles
            class="w-7 h-7 {isOpen
                ? 'rotate-45 text-primary'
                : 'text-white'} transition-all duration-500"
        />
    </button>
</div>
