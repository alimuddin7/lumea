<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import {
        AlertTriangle,
        Home,
        RefreshCw,
        Zap,
        WifiOff,
    } from "lucide-svelte";

    const status = $derived($page.status);
    const message = $derived(
        $page.error?.message || "An unexpected error occurred",
    );

    const errorConfig = $derived.by(() => {
        switch (status) {
            case 404:
                return {
                    title: "Lost in the Gateway",
                    subtitle: "404 - Route Not Found",
                    description:
                        "The route you're looking for doesn't exist in our API gateway. It might have been removed or the path is incorrect.",
                    icon: WifiOff,
                    gradient:
                        "from-purple-500/20 via-pink-500/20 to-red-500/20",
                };
            case 500:
                return {
                    title: "Gateway Overload",
                    subtitle: "500 - Internal Server Error",
                    description:
                        "Our gateway encountered an unexpected error. Our team has been notified and is working on it.",
                    icon: Zap,
                    gradient:
                        "from-red-500/20 via-orange-500/20 to-yellow-500/20",
                };
            default:
                return {
                    title: "Something Went Wrong",
                    subtitle: `Error ${status}`,
                    description: message,
                    icon: AlertTriangle,
                    gradient: "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
                };
        }
    });

    function handleRetry() {
        window.location.reload();
    }

    function handleGoHome() {
        goto("/");
    }
</script>

<div
    class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-base-100"
>
    <!-- Animated Background Gradient -->
    <div
        class="absolute inset-0 bg-gradient-to-br {errorConfig.gradient} animate-pulse opacity-50"
    ></div>

    <!-- Floating Orbs -->
    <div
        class="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"
    ></div>
    <div
        class="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float-delayed"
    ></div>

    <!-- Error Content -->
    <div
        class="relative z-10 max-w-2xl w-full text-center space-y-8 animate-in fade-in duration-700"
    >
        <!-- Icon -->
        <div class="flex justify-center">
            <div class="relative">
                <div
                    class="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"
                ></div>
                <div
                    class="relative bg-base-200 p-8 rounded-full border-4 border-primary/30 shadow-2xl"
                >
                    {#if errorConfig.icon === WifiOff}
                        <WifiOff
                            class="w-24 h-24 text-primary animate-bounce-slow"
                        />
                    {:else if errorConfig.icon === Zap}
                        <Zap
                            class="w-24 h-24 text-primary animate-bounce-slow"
                        />
                    {:else}
                        <AlertTriangle
                            class="w-24 h-24 text-primary animate-bounce-slow"
                        />
                    {/if}
                </div>
            </div>
        </div>

        <!-- Error Code -->
        <div class="space-y-2">
            <h1
                class="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary animate-gradient-x"
            >
                {status}
            </h1>
            <h2
                class="text-4xl font-black uppercase tracking-wider text-base-content/80"
            >
                {errorConfig.title}
            </h2>
            <p
                class="text-sm font-bold uppercase tracking-widest text-primary/60"
            >
                {errorConfig.subtitle}
            </p>
        </div>

        <!-- Description -->
        <p
            class="text-base-content/60 text-lg max-w-md mx-auto leading-relaxed"
        >
            {errorConfig.description}
        </p>

        <!-- Actions -->
        <div
            class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
        >
            <button
                onclick={handleGoHome}
                class="btn btn-primary btn-lg gap-2 px-8 shadow-lg hover:shadow-xl transition-all"
            >
                <Home class="w-5 h-5" />
                Back to Dashboard
            </button>

            {#if status === 500}
                <button
                    onclick={handleRetry}
                    class="btn btn-outline btn-lg gap-2 px-8"
                >
                    <RefreshCw class="w-5 h-5" />
                    Retry
                </button>
            {/if}
        </div>

        <!-- Footer Info -->
        <div
            class="pt-8 text-xs text-base-content/30 uppercase tracking-widest"
        >
            Lumea • Modern APISIX Control Center
        </div>
    </div>
</div>

<style>
    @keyframes float {
        0%,
        100% {
            transform: translateY(0px) scale(1);
        }
        50% {
            transform: translateY(-20px) scale(1.05);
        }
    }

    @keyframes float-delayed {
        0%,
        100% {
            transform: translateY(0px) scale(1);
        }
        50% {
            transform: translateY(20px) scale(0.95);
        }
    }

    @keyframes gradient-x {
        0%,
        100% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }

    @keyframes bounce-slow {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    .animate-float {
        animation: float 6s ease-in-out infinite;
    }

    .animate-float-delayed {
        animation: float-delayed 8s ease-in-out infinite;
    }

    .animate-gradient-x {
        background-size: 200% 200%;
        animation: gradient-x 3s ease infinite;
    }

    .animate-bounce-slow {
        animation: bounce-slow 2s ease-in-out infinite;
    }
</style>
