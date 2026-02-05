<script lang="ts">
    import {
        Lock,
        User,
        ShieldCheck,
        Activity,
        Globe,
        Zap,
        Fingerprint,
        Sparkles,
        ArrowRight,
    } from "lucide-svelte";
    import { enhance } from "$app/forms";
    import { onMount } from "svelte";

    let { form } = $props();
    let mounted = $state(false);

    onMount(() => {
        mounted = true;
    });
</script>

<div
    class="min-h-screen flex items-center justify-center bg-slate-100 relative overflow-hidden font-sans selection:bg-primary/30"
    data-theme="light"
>
    <!-- Dynamic Background Elements -->
    <div
        class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full animate-pulse"
    ></div>
    <div
        class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"
    ></div>
    <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.05] pointer-events-none"
        style="background-image: radial-gradient(circle at 2px 2px, #000 1px, transparent 0); background-size: 40px 40px;"
    ></div>

    <div
        class="w-full max-w-[950px] mx-4 grid lg:grid-cols-2 bg-white rounded-[2rem] border border-slate-200 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] overflow-hidden relative z-10 transition-all duration-700 {mounted
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'}"
    >
        <!-- Modern Branding Section -->
        <div
            class="hidden lg:flex flex-col justify-between p-12 bg-slate-50 relative group overflow-hidden border-r border-slate-200"
        >
            <!-- Decorative light beam -->
            <div
                class="absolute -top-20 -left-20 w-56 h-56 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors duration-1000"
            ></div>

            <div class="relative z-10">
                <div
                    class="flex items-center gap-4 mb-16 animate-in fade-in slide-in-from-left-4 duration-700"
                >
                    <img
                        src="/lumea.png"
                        alt="Lumea Logo"
                        class="h-8 w-auto object-contain"
                    />
                    <div class="h-6 w-[1px] bg-slate-200 mx-1"></div>
                    <span
                        class="text-[10px] font-black tracking-[0.4em] uppercase opacity-40 text-slate-900"
                        >System Core</span
                    >
                </div>

                <div class="space-y-6">
                    <h1
                        class="text-5xl font-black leading-[0.95] tracking-tighter text-slate-900"
                    >
                        Access <br />
                        <span class="text-primary italic relative">
                            The Lumea
                            <span
                                class="absolute -bottom-1.5 left-0 w-full h-1 bg-primary/20 rounded-full"
                            ></span>
                        </span> <br />
                        Interface.
                    </h1>

                    <p
                        class="text-base text-slate-500 leading-relaxed font-medium max-w-[280px]"
                    >
                        Enterprise-grade control plane for Apache APISIX. Manage
                        clusters with absolute precision.
                    </p>

                    <div
                        class="grid grid-cols-2 gap-y-4 pt-8 border-t border-slate-200"
                    >
                        <div class="flex items-center gap-3 group/item">
                            <div
                                class="p-1.5 bg-primary/5 rounded-lg border border-primary/10 group-hover/item:border-primary/50 transition-colors"
                            >
                                <Zap class="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span
                                class="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover/item:opacity-100 transition-opacity text-slate-900"
                                >Ultra Latency</span
                            >
                        </div>
                        <div class="flex items-center gap-3 group/item">
                            <div
                                class="p-1.5 bg-primary/5 rounded-lg border border-primary/10 group-hover/item:border-primary/50 transition-colors"
                            >
                                <ShieldCheck class="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span
                                class="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover/item:opacity-100 transition-opacity text-slate-900"
                                >Hardened Sec</span
                            >
                        </div>
                        <div class="flex items-center gap-3 group/item">
                            <div
                                class="p-1.5 bg-primary/5 rounded-lg border border-primary/10 group-hover/item:border-primary/50 transition-colors"
                            >
                                <Globe class="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span
                                class="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover/item:opacity-100 transition-opacity text-slate-900"
                                >Edge Mesh</span
                            >
                        </div>
                        <div class="flex items-center gap-3 group/item">
                            <div
                                class="p-1.5 bg-primary/5 rounded-lg border border-primary/10 group-hover/item:border-primary/50 transition-colors"
                            >
                                <Fingerprint class="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span
                                class="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover/item:opacity-100 transition-opacity text-slate-900"
                                >Smart Auth</span
                            >
                        </div>
                    </div>
                </div>
            </div>

            <div class="relative z-10 flex items-center justify-between">
                <div
                    class="flex items-center gap-3 p-1 px-3 bg-slate-900/5 border border-slate-900/10 rounded-full"
                >
                    <div
                        class="w-1.5 h-1.5 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                    ></div>
                    <span
                        class="text-[8px] font-black uppercase tracking-widest text-slate-900/40"
                        >Node Status: Operational</span
                    >
                </div>
                <span
                    class="text-[8px] font-bold uppercase tracking-[0.2em] opacity-20 text-slate-900"
                    >v2.4.0 Stable</span
                >
            </div>
        </div>

        <!-- Sleek Login Form Section -->
        <div class="p-10 lg:p-14 flex flex-col justify-center bg-white">
            <div
                class="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
            >
                <div class="lg:hidden flex items-center gap-2 mb-8">
                    <img src="/lumea.png" alt="Lumea" class="h-5 w-auto" />
                    <span
                        class="text-[10px] font-black tracking-widest opacity-30 uppercase text-slate-900"
                        >Dashboard</span
                    >
                </div>
                <h2
                    class="text-3xl font-black tracking-tighter mb-2 text-slate-900"
                >
                    Welcome Back.
                </h2>
                <p
                    class="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em]"
                >
                    Authentication Required for Cluster Access
                </p>
            </div>

            <form
                class="space-y-5 relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
                method="POST"
                use:enhance
            >
                <div class="space-y-3.5">
                    <div class="space-y-1.5 group">
                        <label
                            for="username"
                            class="text-[9px] font-black uppercase tracking-[0.15em] opacity-30 group-focus-within:opacity-100 group-focus-within:text-primary transition-all ml-1"
                            >Identity Profile</label
                        >
                        <div class="relative">
                            <User
                                class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-20 group-focus-within:opacity-100 group-focus-within:text-primary transition-all"
                            />
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                placeholder="Username"
                                class="input w-full pl-12 h-14 rounded-xl bg-base-200 border-none focus:ring-2 focus:ring-primary focus:bg-base-100 transition-all font-bold placeholder:opacity-20 text-base shadow-sm"
                            />
                        </div>
                    </div>

                    <div class="space-y-1.5 group">
                        <div class="flex justify-between items-center ml-1">
                            <label
                                for="password"
                                class="text-[9px] font-black uppercase tracking-[0.15em] opacity-30 group-focus-within:opacity-100 group-focus-within:text-primary transition-all"
                                >Encrypted Token</label
                            >
                        </div>
                        <div class="relative">
                            <Lock
                                class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-20 group-focus-within:opacity-100 group-focus-within:text-primary transition-all"
                            />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                class="input w-full pl-12 h-14 rounded-xl bg-base-200 border-none focus:ring-2 focus:ring-primary focus:bg-base-100 transition-all font-bold placeholder:opacity-20 text-base shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {#if form?.error}
                    <div
                        class="alert alert-error bg-error/10 border border-error/20 text-error rounded-xl text-[10px] font-black uppercase tracking-widest gap-3 animate-shake py-3"
                    >
                        <Sparkles class="w-3.5 h-3.5" />
                        <span>{form.error}</span>
                    </div>
                {/if}

                <div class="pt-4">
                    <button
                        type="submit"
                        class="btn btn-primary w-full h-14 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_12px_24px_-8px_rgba(var(--p),0.3)] hover:shadow-[0_16px_32px_-4px_rgba(var(--p),0.4)] hover:scale-[1.01] active:scale-[0.98] transition-all group overflow-hidden"
                    >
                        <span
                            class="relative z-10 flex items-center justify-center gap-2"
                        >
                            Establish Session
                            <ArrowRight
                                class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
                            />
                        </span>
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"
                        ></div>
                    </button>
                </div>
            </form>

            <div
                class="mt-12 pt-10 border-t border-slate-100 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity"
            >
                <span
                    class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-900"
                    >Authorized Access Only</span
                >
                <div class="flex gap-4">
                    <a
                        href="https://apisix.apache.org/"
                        target="_blank"
                        class="text-[8px] font-black uppercase tracking-widest hover:text-primary transition-colors text-slate-500"
                        >Docs</a
                    >
                    <a
                        href="https://github.com/apache/apisix"
                        target="_blank"
                        class="text-[8px] font-black uppercase tracking-widest hover:text-primary transition-colors text-slate-500"
                        >Repo</a
                    >
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    :global(.animate-shake) {
        animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }

    @keyframes shake {
        10%,
        90% {
            transform: translate3d(-1px, 0, 0);
        }
        20%,
        80% {
            transform: translate3d(2px, 0, 0);
        }
        30%,
        50%,
        70% {
            transform: translate3d(-4px, 0, 0);
        }
        40%,
        60% {
            transform: translate3d(4px, 0, 0);
        }
    }

    @keyframes shimmer {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }

    .animate-shimmer {
        animation: shimmer 1.5s infinite;
    }
</style>
