<script lang="ts">
    import {
        Lock,
        User,
        ShieldCheck,
        Globe,
        Zap,
        Fingerprint,
        Sparkles,
        ArrowRight,
    } from "lucide-svelte";
    import { enhance } from "$app/forms";
    import { onMount } from "svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";

    let { form } = $props();
    let mounted = $state(false);

    onMount(() => {
        mounted = true;
    });
</script>

<div
    class="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans selection:bg-rose-600/30 p-4"
>
    <!-- Dynamic Background Glow -->
    <div
        class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/10 blur-[150px] rounded-full animate-pulse pointer-events-none"
    ></div>
    <div
        class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none"
    ></div>
    <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style="background-image: radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0); background-size: 40px 40px;"
    ></div>

    <div
        class="w-full max-w-[950px] grid lg:grid-cols-2 bg-card text-card-foreground rounded-3xl border border-border shadow-2xl overflow-hidden relative z-10 transition-all duration-700 {mounted
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'}"
    >
        <!-- Branding Section -->
        <div
            class="hidden lg:flex flex-col justify-between p-10 bg-muted/40 relative group overflow-hidden border-r border-border"
        >
            <div
                class="absolute -top-20 -left-20 w-56 h-56 bg-rose-600/20 blur-3xl rounded-full group-hover:bg-rose-600/30 transition-colors duration-1000"
            ></div>

            <div class="relative z-10">
                <div class="flex items-center gap-3 mb-12">
                    <img
                        src="/lumea.png"
                        alt="Lumea Logo"
                        class="h-8 w-auto object-contain"
                    />
                    <div class="h-5 w-[1px] bg-border mx-1"></div>
                    <span class="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                        System Core
                    </span>
                </div>

                <div class="space-y-6">
                    <h1 class="text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground">
                        Access <br />
                        <span class="text-rose-600 italic relative">
                            The Lumea
                            <span class="absolute -bottom-1 left-0 w-full h-1 bg-rose-600/30 rounded-full"></span>
                        </span> <br />
                        Interface.
                    </h1>

                    <p class="text-xs text-muted-foreground leading-relaxed font-medium max-w-[280px]">
                        Enterprise-grade control plane for Apache APISIX. Manage clusters with absolute precision.
                    </p>

                    <div class="grid grid-cols-2 gap-y-4 pt-6 border-t border-border">
                        <div class="flex items-center gap-2.5">
                            <div class="p-1.5 bg-rose-600/10 rounded-lg text-rose-600">
                                <Zap class="w-3.5 h-3.5" />
                            </div>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Ultra Latency
                            </span>
                        </div>
                        <div class="flex items-center gap-2.5">
                            <div class="p-1.5 bg-rose-600/10 rounded-lg text-rose-600">
                                <ShieldCheck class="w-3.5 h-3.5" />
                            </div>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Hardened Sec
                            </span>
                        </div>
                        <div class="flex items-center gap-2.5">
                            <div class="p-1.5 bg-rose-600/10 rounded-lg text-rose-600">
                                <Globe class="w-3.5 h-3.5" />
                            </div>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Edge Mesh
                            </span>
                        </div>
                        <div class="flex items-center gap-2.5">
                            <div class="p-1.5 bg-rose-600/10 rounded-lg text-rose-600">
                                <Fingerprint class="w-3.5 h-3.5" />
                            </div>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Smart Auth
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="relative z-10 flex items-center justify-between pt-6 border-t border-border/60">
                <div class="flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border">
                    <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-xs"></div>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Node Status: Operational
                    </span>
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    v2.4.0 Stable
                </span>
            </div>
        </div>

        <!-- Form Section -->
        <div class="p-8 lg:p-12 flex flex-col justify-center bg-card">
            <div class="mb-8">
                <div class="lg:hidden flex items-center gap-2 mb-6">
                    <img src="/lumea.png" alt="Lumea" class="h-6 w-auto" />
                    <span class="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                        Dashboard
                    </span>
                </div>
                <h2 class="text-2xl font-bold tracking-tight mb-1 text-foreground">
                    Welcome Back.
                </h2>
                <p class="text-xs text-muted-foreground font-medium">
                    Authentication required for APISIX cluster access
                </p>
            </div>

            <form
                class="space-y-4 relative"
                method="POST"
                use:enhance
            >
                <div class="space-y-3.5">
                    <div class="space-y-1.5">
                        <label for="username" class="text-xs font-bold text-foreground block">
                            Identity Profile
                        </label>
                        <div class="relative">
                            <User class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                placeholder="Username"
                                class="h-11 pl-10 text-xs"
                            />
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label for="password" class="text-xs font-bold text-foreground block">
                            Encrypted Token
                        </label>
                        <div class="relative">
                            <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                class="h-11 pl-10 text-xs"
                            />
                        </div>
                    </div>
                </div>

                {#if form?.error}
                    <div class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <Sparkles class="w-4 h-4 shrink-0" />
                        <span>{form.error}</span>
                    </div>
                {/if}

                <div class="pt-2">
                    <Button
                        type="submit"
                        class="w-full h-11 text-xs font-bold shadow-md gap-2"
                    >
                        <span>Establish Session</span>
                        <ArrowRight class="w-4 h-4" />
                    </Button>
                </div>
            </form>

            <div class="mt-10 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span class="font-semibold text-[11px]">Authorized Access Only</span>
                <div class="flex gap-3">
                    <a
                        href="https://apisix.apache.org/"
                        target="_blank"
                        class="hover:text-foreground transition-colors font-medium text-[11px]"
                    >Docs</a>
                    <a
                        href="https://github.com/apache/apisix"
                        target="_blank"
                        class="hover:text-foreground transition-colors font-medium text-[11px]"
                    >Repo</a>
                </div>
            </div>
        </div>
    </div>
</div>
