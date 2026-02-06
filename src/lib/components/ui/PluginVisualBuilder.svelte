<script lang="ts">
    import {
        Settings,
        Trash2,
        Plus,
        Info,
        ChevronRight,
        ChevronDown,
        Wand2,
        BookOpen,
        Code2 as CodeIcon,
    } from "lucide-svelte";
    import { PLUGIN_TEMPLATES } from "$lib/utils/pluginTemplates";
    import Editor from "../Editor.svelte";

    let { pluginsJson = $bindable(), language = "json" } = $props();

    // Internal state parsed from JSON
    let plugins = $state<Record<string, any>>({});
    let expandedPlugin = $state<string | null>(null);

    // Sync from JSON string to object
    $effect(() => {
        try {
            const parsed = JSON.parse(pluginsJson);
            if (JSON.stringify(parsed) !== JSON.stringify(plugins)) {
                plugins = parsed;
            }
        } catch (e) {
            // Keep existing plugins if JSON is invalid during typing
        }
    });

    // Sync from object back to JSON string
    function updateJson() {
        pluginsJson = JSON.stringify(plugins, null, 2);
    }

    function togglePlugin(name: string) {
        if (plugins[name]) {
            delete plugins[name];
        } else {
            plugins[name] = (PLUGIN_TEMPLATES as any)[name] || {};
        }
        updateJson();
    }

    function removePlugin(name: string) {
        delete plugins[name];
        updateJson();
        if (expandedPlugin === name) expandedPlugin = null;
    }

    // Helper to get common plugins not yet added
    const commonPlugins = [
        "proxy-rewrite",
        "response-rewrite",
        "key-auth",
        "cors",
        "limit-count",
        "prometheus",
        "serverless-pre-function",
    ];
    let availablePlugins = $derived(commonPlugins.filter((p) => !plugins[p]));
    let showMarketplace = $state(false);
    let allPlugins = Object.keys(PLUGIN_TEMPLATES);

    const serverlessRecipes = [
        {
            name: "Route by Body Content",
            description:
                "Check if body contains keywords and set route header.",
            code: `return function(conf, ctx)
    local core = require("apisix.core")
    local body = core.request.get_body()
    local keywords = {"kata_a", "kata_b", "kata_c"}
    
    if body then
        for _, word in ipairs(keywords) do
            if string.find(body, word) then
                core.request.set_header(ctx, "X-Move-Traffic", "yes")
                break
            end
        end
    end
end`,
        },
        {
            name: "Inject Custom Header",
            description: "Add a static header to the request.",
            code: `return function(conf, ctx)
    local core = require("apisix.core")
    core.request.set_header(ctx, "X-Custom-Header", "lumea-dashboard")
end`,
        },
        {
            name: "Block Specific Agents",
            description: "Reject requests from specific User-Agents.",
            code: `return function(conf, ctx)
    local core = require("apisix.core")
    local ua = core.request.header(ctx, "User-Agent")
    if ua and string.find(ua, "BadBot") then
        core.response.exit(403, "Bots not allowed")
    end
end`,
        },
    ];

    function applyRecipe(pluginName: string, code: string) {
        if (!plugins[pluginName]) plugins[pluginName] = { functions: [] };
        plugins[pluginName].functions[0] = code;
        updateJson();
    }
</script>

<div class="space-y-4 relative">
    {#if showMarketplace}
        <!-- Marketplace Modal Overlay -->
        <div
            class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onclick={() => (showMarketplace = false)}
        >
            <div
                class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300"
                onclick={(e) => e.stopPropagation()}
            >
                <div
                    class="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"
                >
                    <div>
                        <h2
                            class="text-xl font-black tracking-tight text-slate-900"
                        >
                            Plugin Library
                        </h2>
                        <p
                            class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5"
                        >
                            Select a capability to extend your gateway
                        </p>
                    </div>
                    <button
                        onclick={() => (showMarketplace = false)}
                        class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                    >
                        <Settings class="w-5 h-5 rotate-45" />
                    </button>
                </div>

                <div
                    class="p-8 max-h-[60vh] overflow-y-auto grid grid-cols-2 gap-4"
                >
                    {#each allPlugins as name}
                        <button
                            onclick={() => {
                                togglePlugin(name);
                                showMarketplace = false;
                            }}
                            class="flex flex-col text-left p-4 rounded-2xl border transition-all {plugins[
                                name
                            ]
                                ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20'
                                : 'bg-slate-50 border-slate-200 hover:border-primary/40 hover:bg-white hover:shadow-lg hover:shadow-primary/5'}"
                        >
                            <div class="flex items-center justify-between mb-2">
                                <div
                                    class="p-2 rounded-lg {plugins[name]
                                        ? 'bg-primary text-primary-content'
                                        : 'bg-slate-200 text-slate-500'} transition-colors"
                                >
                                    <Settings class="w-4 h-4" />
                                </div>
                                {#if plugins[name]}
                                    <span
                                        class="text-[8px] font-black uppercase tracking-widest text-primary px-1.5 py-0.5 bg-primary/10 rounded"
                                        >Active</span
                                    >
                                {/if}
                            </div>
                            <h3
                                class="text-xs font-black uppercase tracking-widest text-slate-900"
                            >
                                {name}
                            </h3>
                            <p
                                class="text-[9px] font-medium text-slate-400 mt-1 leading-relaxed line-clamp-2"
                            >
                                Standard APISIX capability for routing and
                                traffic control.
                            </p>
                        </button>
                    {/each}
                </div>

                <div
                    class="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end"
                >
                    <button
                        onclick={() => (showMarketplace = false)}
                        class="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <!-- Active Plugins -->
    <div class="space-y-2">
        {#each Object.keys(plugins) as name}
            <!-- content remains same -->
            <div
                class="bg-base-100 rounded-xl border border-base-300 overflow-hidden shadow-sm transition-all {expandedPlugin ===
                name
                    ? 'ring-1 ring-primary'
                    : ''}"
            >
                <!-- ... existing active plugin content ... -->
                <div
                    class="flex items-center justify-between p-3 bg-base-100/50"
                >
                    <button
                        onclick={() =>
                            (expandedPlugin =
                                expandedPlugin === name ? null : name)}
                        class="flex items-center gap-2.5 flex-1 text-left"
                    >
                        <div
                            class="p-1.5 bg-primary/10 rounded-lg text-primary"
                        >
                            <Settings class="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <h3
                                class="text-[10px] font-black uppercase tracking-widest"
                            >
                                {name}
                            </h3>
                        </div>
                        {#if expandedPlugin === name}
                            <ChevronDown class="w-3 h-3 opacity-20 ml-auto" />
                        {:else}
                            <ChevronRight class="w-3 h-3 opacity-20 ml-auto" />
                        {/if}
                    </button>
                    <button
                        onclick={() => removePlugin(name)}
                        class="p-1.5 hover:bg-error/10 hover:text-error rounded-lg transition-colors ml-2 opacity-30 hover:opacity-100"
                        title="Deactivate Plugin"
                    >
                        <Trash2 class="w-3.5 h-3.5" />
                    </button>
                </div>

                {#if expandedPlugin === name}
                    <div
                        class="p-4 bg-base-200/30 border-t border-base-300 space-y-4"
                    >
                        <!-- Plugin Specific Forms -->
                        {#if name === "proxy-rewrite"}
                            <div class="grid grid-cols-1 gap-4">
                                <div class="space-y-1">
                                    <label
                                        for="{name}-uri"
                                        class="label-minimal"
                                        >Target URI Path</label
                                    >
                                    <input
                                        id="{name}-uri"
                                        type="text"
                                        bind:value={plugins[name].uri}
                                        oninput={updateJson}
                                        placeholder="/new-path"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                                <div class="space-y-1">
                                    <label
                                        for="{name}-host"
                                        class="label-minimal">Target Host</label
                                    >
                                    <input
                                        id="{name}-host"
                                        type="text"
                                        bind:value={plugins[name].host}
                                        oninput={updateJson}
                                        placeholder="backend.prod"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                            </div>
                        {:else if name === "response-rewrite"}
                            <div class="grid grid-cols-1 gap-4">
                                <div class="space-y-1">
                                    <label
                                        for="{name}-status"
                                        class="label-minimal"
                                        >Override Status Code</label
                                    >
                                    <input
                                        id="{name}-status"
                                        type="number"
                                        bind:value={plugins[name].status_code}
                                        oninput={updateJson}
                                        placeholder="e.g. 403"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                                <div class="space-y-1">
                                    <label
                                        for="{name}-body"
                                        class="label-minimal"
                                        >Response Body (Text/JSON)</label
                                    >
                                    <textarea
                                        id="{name}-body"
                                        bind:value={plugins[name].body}
                                        oninput={updateJson}
                                        placeholder={'{"message": "Forbidden"}'}
                                        class="input-minimal bg-base-100 h-20 py-2"
                                    ></textarea>
                                </div>
                            </div>
                        {:else if name === "limit-count"}
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1">
                                    <label
                                        for="{name}-count"
                                        class="label-minimal"
                                        >Request Limit</label
                                    >
                                    <input
                                        id="{name}-count"
                                        type="number"
                                        bind:value={plugins[name].count}
                                        oninput={updateJson}
                                        placeholder="100"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                                <div class="space-y-1">
                                    <label
                                        for="{name}-window"
                                        class="label-minimal"
                                        >Time Window (sec)</label
                                    >
                                    <input
                                        id="{name}-window"
                                        type="number"
                                        bind:value={plugins[name].time_window}
                                        oninput={updateJson}
                                        placeholder="60"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                            </div>
                        {:else if name === "cors"}
                            <div class="space-y-4">
                                <div class="space-y-1">
                                    <label
                                        for="{name}-origin"
                                        class="label-minimal"
                                        >Allow Origins</label
                                    >
                                    <input
                                        id="{name}-origin"
                                        type="text"
                                        bind:value={plugins[name].allow_origins}
                                        oninput={updateJson}
                                        placeholder="*"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                                <div class="space-y-1">
                                    <label
                                        for="{name}-methods"
                                        class="label-minimal"
                                        >Allow Methods</label
                                    >
                                    <input
                                        id="{name}-methods"
                                        type="text"
                                        bind:value={plugins[name].allow_methods}
                                        oninput={updateJson}
                                        placeholder="GET,POST,PUT"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                            </div>
                        {:else if name === "serverless-pre-function"}
                            <div class="space-y-4">
                                <!-- Smart Recipes -->
                                <div class="space-y-2">
                                    <div
                                        class="flex items-center gap-2 mb-1 px-1"
                                    >
                                        <BookOpen
                                            class="w-3 h-3 text-primary opacity-50"
                                        />
                                        <span
                                            class="text-[9px] font-black uppercase tracking-widest opacity-40"
                                            >Quick Recipes</span
                                        >
                                    </div>
                                    <div class="grid grid-cols-1 gap-2">
                                        {#each serverlessRecipes as recipe}
                                            <button
                                                onclick={() =>
                                                    applyRecipe(
                                                        name,
                                                        recipe.code,
                                                    )}
                                                class="flex flex-col text-left p-3 rounded-xl border border-base-300 bg-base-100 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                            >
                                                <div
                                                    class="flex items-center justify-between mb-0.5"
                                                >
                                                    <span
                                                        class="text-[10px] font-black uppercase tracking-tight text-slate-700"
                                                        >{recipe.name}</span
                                                    >
                                                    <Plus
                                                        class="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                    />
                                                </div>
                                                <p
                                                    class="text-[8px] font-medium text-slate-400 leading-tight"
                                                >
                                                    {recipe.description}
                                                </p>
                                            </button>
                                        {/each}
                                    </div>
                                </div>

                                <!-- Lua Editor -->
                                <div class="space-y-1 mt-6">
                                    <div
                                        class="flex items-center justify-between px-1 mb-2"
                                    >
                                        <div class="flex items-center gap-2">
                                            <CodeIcon
                                                class="w-3 h-3 text-primary"
                                            />
                                            <label
                                                for="{name}-functions"
                                                class="text-[9px] font-black uppercase tracking-widest text-slate-400"
                                                >Lua Script</label
                                            >
                                        </div>
                                        <span
                                            class="text-[8px] font-bold opacity-20 uppercase tracking-widest italic"
                                            >Phase: access</span
                                        >
                                    </div>
                                    <div
                                        class="h-[200px] rounded-xl overflow-hidden border border-base-300 shadow-sm"
                                    >
                                        <Editor
                                            bind:value={
                                                plugins[name].functions[0]
                                            }
                                            language="lua"
                                            onchange={updateJson}
                                        />
                                    </div>
                                    <p
                                        class="text-[8px] opacity-30 italic mt-1.5 px-1 leading-relaxed"
                                    >
                                        Executed at the transition between
                                        access and content phases. Use 'core'
                                        module for advanced gateway
                                        interactions.
                                    </p>
                                </div>
                            </div>
                        {:else if name === "traffic-split"}
                            <div class="space-y-6">
                                {#each plugins[name].rules as rule, i}
                                    <div
                                        class="p-4 rounded-2xl bg-base-100 border border-base-300 space-y-4"
                                    >
                                        <div
                                            class="flex items-center justify-between mb-2"
                                        >
                                            <span
                                                class="text-[9px] font-black uppercase tracking-widest opacity-40"
                                                >Rule #{i + 1}</span
                                            >
                                            <button
                                                onclick={() => {
                                                    plugins[name].rules.splice(
                                                        i,
                                                        1,
                                                    );
                                                    updateJson();
                                                }}
                                                class="text-error opacity-40 hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 class="w-3 h-3" />
                                            </button>
                                        </div>

                                        <!-- Matching Vars (Nested) -->
                                        <div class="space-y-2">
                                            <div
                                                class="flex items-center justify-between"
                                            >
                                                <span
                                                    class="text-[8px] font-black uppercase tracking-widest opacity-30"
                                                    >Matching Conditions (vars)</span
                                                >
                                                <button
                                                    onclick={() => {
                                                        if (!rule.match)
                                                            rule.match = [
                                                                { vars: [] },
                                                            ];
                                                        rule.match[0].vars.push(
                                                            [
                                                                "http_header",
                                                                "==",
                                                                "value",
                                                            ],
                                                        );
                                                        updateJson();
                                                    }}
                                                    class="btn btn-ghost btn-xs h-6 px-2 text-[8px] font-black uppercase tracking-widest border border-dashed border-base-300"
                                                >
                                                    <Plus
                                                        class="w-2.5 h-2.5 mr-1"
                                                    /> Add Var
                                                </button>
                                            </div>
                                            {#if rule.match && rule.match[0]?.vars}
                                                <div class="space-y-1.5">
                                                    {#each rule.match[0].vars as v, vi}
                                                        <div
                                                            class="flex items-center gap-1.5"
                                                        >
                                                            <input
                                                                type="text"
                                                                bind:value={
                                                                    v[0]
                                                                }
                                                                oninput={updateJson}
                                                                placeholder="Variable"
                                                                class="input-minimal flex-[1.5] bg-base-200/50"
                                                            />
                                                            <select
                                                                bind:value={
                                                                    v[1]
                                                                }
                                                                onchange={updateJson}
                                                                class="select-minimal bg-base-200/50"
                                                            >
                                                                <option
                                                                    value="=="
                                                                    >==</option
                                                                >
                                                                <option
                                                                    value="~="
                                                                    >~=</option
                                                                >
                                                                <option
                                                                    value="~~"
                                                                    >Regex</option
                                                                >
                                                                <option
                                                                    value="~~*"
                                                                    >Regex*</option
                                                                >
                                                                <option
                                                                    value=">"
                                                                    >&gt;</option
                                                                >
                                                                <option
                                                                    value="<"
                                                                    >&lt;</option
                                                                >
                                                            </select>
                                                            <input
                                                                type="text"
                                                                bind:value={
                                                                    v[2]
                                                                }
                                                                oninput={updateJson}
                                                                placeholder="Value"
                                                                class="input-minimal flex-[1.5] bg-base-200/50"
                                                            />
                                                            <button
                                                                onclick={() => {
                                                                    rule.match[0].vars.splice(
                                                                        vi,
                                                                        1,
                                                                    );
                                                                    updateJson();
                                                                }}
                                                                class="p-1 opacity-20 hover:opacity-100"
                                                                ><Trash2
                                                                    class="w-2.5 h-2.5"
                                                                /></button
                                                            >
                                                        </div>
                                                    {/each}
                                                </div>
                                            {/if}
                                        </div>

                                        <!-- Weighted Upstreams -->
                                        <div
                                            class="space-y-2 pt-2 border-t border-base-300/50"
                                        >
                                            <label
                                                class="text-[8px] font-black uppercase tracking-widest opacity-30"
                                                >Weighted Upstreams</label
                                            >
                                            <div class="space-y-1.5">
                                                {#each rule.weighted_upstreams as up, ui}
                                                    <div
                                                        class="flex items-center gap-2"
                                                    >
                                                        <input
                                                            type="text"
                                                            bind:value={
                                                                up.upstream_id
                                                            }
                                                            oninput={updateJson}
                                                            placeholder="Upstream ID"
                                                            class="input-minimal flex-1 bg-base-200/50"
                                                        />
                                                        <div
                                                            class="flex items-center gap-2 w-24"
                                                        >
                                                            <span
                                                                class="text-[8px] font-bold opacity-30 uppercase tracking-tighter"
                                                                >W:</span
                                                            >
                                                            <input
                                                                type="number"
                                                                bind:value={
                                                                    up.weight
                                                                }
                                                                oninput={updateJson}
                                                                class="input-minimal w-12 bg-base-200/50 text-center"
                                                            />
                                                        </div>
                                                    </div>
                                                {/each}
                                            </div>
                                        </div>
                                    </div>
                                {/each}
                                <button
                                    onclick={() => {
                                        plugins[name].rules.push({
                                            match: [
                                                {
                                                    vars: [
                                                        [
                                                            "http_new_header",
                                                            "==",
                                                            "value",
                                                        ],
                                                    ],
                                                },
                                            ],
                                            weighted_upstreams: [
                                                { upstream_id: "", weight: 1 },
                                            ],
                                        });
                                        updateJson();
                                    }}
                                    class="btn btn-outline btn-block btn-xs h-8 border-dashed text-[9px] font-black uppercase tracking-widest"
                                >
                                    <Plus class="w-3 h-3 mr-1" /> Add New Routing
                                    Rule
                                </button>
                            </div>
                        {:else if name === "jwt-auth"}
                            <div class="grid grid-cols-1 gap-4">
                                <div class="space-y-1">
                                    <label
                                        for="{name}-header"
                                        class="label-minimal"
                                        >Header Name (optional)</label
                                    >
                                    <input
                                        id="{name}-header"
                                        type="text"
                                        bind:value={plugins[name].header}
                                        oninput={updateJson}
                                        placeholder="Authorization"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                                <div class="space-y-1">
                                    <label
                                        for="{name}-cookie"
                                        class="label-minimal"
                                        >Cookie Name (optional)</label
                                    >
                                    <input
                                        id="{name}-cookie"
                                        type="text"
                                        bind:value={plugins[name].cookie}
                                        oninput={updateJson}
                                        placeholder="jwt"
                                        class="input-minimal bg-base-100"
                                    />
                                </div>
                            </div>
                        {:else if name === "key-auth"}
                            <div class="space-y-1">
                                <label for="{name}-header" class="label-minimal"
                                    >Header Name</label
                                >
                                <input
                                    id="{name}-header"
                                    type="text"
                                    bind:value={plugins[name].header}
                                    oninput={updateJson}
                                    placeholder="apikey"
                                    class="input-minimal bg-base-100"
                                />
                            </div>
                        {:else}
                            <div
                                class="p-8 flex flex-col items-center justify-center opacity-30 text-center"
                            >
                                <Wand2 class="w-8 h-8 mb-2" />
                                <p
                                    class="text-[10px] font-black uppercase tracking-widest"
                                ></p>
                                <p
                                    class="text-[8px] uppercase tracking-widest max-w-[200px] mt-1 italic"
                                >
                                    Use the code editor on the right for this
                                    specific plugin's detailed settings.
                                </p>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    <div class="pt-4 mt-2 border-t border-base-300/30">
        <p
            class="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 mb-3 px-1"
        >
            Library
        </p>
        <div class="flex flex-wrap gap-1.5 px-0.5">
            {#each availablePlugins as p}
                <button
                    onclick={() => togglePlugin(p)}
                    class="group flex items-center gap-1.5 h-7 px-3 rounded-lg bg-base-200/50 hover:bg-primary/10 border border-base-300/50 hover:border-primary/30 transition-all"
                >
                    <Plus
                        class="w-2.5 h-2.5 opacity-30 group-hover:text-primary group-hover:opacity-100"
                    />
                    <span
                        class="text-[9px] font-bold uppercase tracking-widest opacity-60 group-hover:text-primary group-hover:opacity-100"
                        >{p}</span
                    >
                </button>
            {/each}
            <button
                onclick={() => (showMarketplace = true)}
                class="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-base-200/20 border border-dashed border-base-300/50 text-[9px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100 transition-all italic hover:bg-primary/5 hover:border-primary/30 hover:text-primary"
            >
                More...
            </button>
        </div>
    </div>
</div>
