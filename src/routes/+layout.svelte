<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import favicon from "$lib/assets/favicon.svg";
	import {
		Globe,
		Users,
		Settings,
		Database,
		ShieldCheck,
		RefreshCw,
		Server,
		Download,
		LayoutGrid,
		Menu as MenuIcon,
		Sun,
		Moon,
		LogOut,
		Layout,
		PanelLeftClose,
		PanelLeft,
		Sparkles,
		Bot,
		Activity,
		Search,
		Bell,
		X
	} from "lucide-svelte";
	import { config, connectionStatus } from "$lib/stores/config";
	import { checkConnection } from "$lib/api/client";
	import { page } from "$app/state";
	import AISettingsDialog from "$lib/components/ui/AISettingsDialog.svelte";
	import Button from "$lib/components/ui/Button.svelte";
	import Badge from "$lib/components/ui/Badge.svelte";
	import { aiStore } from "$lib/stores/aiStore";

	let { children } = $props();

	const isLoginPage = $derived(page.url.pathname === "/login");

	const navItems = [
		{ href: "/", icon: Activity, label: "Dashboard", exact: true },
		{ href: "/routes", icon: Globe, label: "Routes" },
		{ href: "/services", icon: Server, label: "Services" },
		{ href: "/upstreams", icon: Database, label: "Upstreams" },
		{ href: "/consumers", icon: Users, label: "Consumers" },
		{ href: "/consumer-groups", icon: LayoutGrid, label: "Consumer Groups" },
		{ href: "/plugins", icon: LayoutGrid, label: "Plugins" },
		{ href: "/plugins/custom", icon: Layout, label: "Custom Plugins" },
		{ href: "/ssl", icon: ShieldCheck, label: "Certificates" },
		{ href: "/import-export", icon: Download, label: "Import/Export" },
		{ href: "/settings", icon: Settings, label: "Settings" }
	];

	let isExpanded = $state(true);
	let mobileSidebarOpen = $state(false);
	let theme = $state("dark");
	let aiDialogOpen = $state(false);

	function toggleTheme() {
		theme = theme === "light" ? "dark" : "light";
		applyTheme(theme);
	}

	function applyTheme(newTheme: string) {
		if (newTheme === "light") {
			document.documentElement.classList.add("light");
			document.documentElement.classList.remove("dark");
		} else {
			document.documentElement.classList.add("dark");
			document.documentElement.classList.remove("light");
		}
		localStorage.setItem("theme", newTheme);
	}

	async function performHealthCheck() {
		connectionStatus.set("checking");
		const isConnected = await checkConnection();
		connectionStatus.set(isConnected ? "connected" : "disconnected");
	}

	onMount(() => {
		const savedTheme =
			localStorage.getItem("theme") ||
			(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
		theme = savedTheme;
		applyTheme(theme);

		aiStore.init();

		const savedSidebar = localStorage.getItem("sidebar_expanded");
		if (savedSidebar !== null) {
			isExpanded = savedSidebar === "true";
		}

		if ($config.baseUrl && $config.apiKey) {
			performHealthCheck();
		} else {
			connectionStatus.set("disconnected");
		}

		const interval = setInterval(() => {
			if ($config.baseUrl && $config.apiKey) {
				performHealthCheck();
			}
		}, 30000);

		return () => clearInterval(interval);
	});

	function toggleSidebar() {
		isExpanded = !isExpanded;
		localStorage.setItem("sidebar_expanded", String(isExpanded));
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Lumea — Modern APISIX Control Center</title>
</svelte:head>

{#if isLoginPage}
	<!-- Standalone Fullscreen Container for Login Page -->
	<div class="min-h-screen bg-background text-foreground font-sans antialiased">
		{@render children()}
	</div>
{:else}
	<!-- Full Dashboard Layout with Header, Sidebar, and Main Area -->
	<div class="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
		<!-- Top Navigation Header -->
		<header class="h-16 border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-40 px-4 flex items-center justify-between shadow-xs">
			<div class="flex items-center gap-3">
				<button
					type="button"
					onclick={() => mobileSidebarOpen = !mobileSidebarOpen}
					class="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent lg:hidden border border-border"
					aria-label="Open Mobile Menu"
				>
					<MenuIcon class="w-5 h-5" />
				</button>

				<button
					type="button"
					onclick={toggleSidebar}
					class="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent hidden lg:flex border border-border/50"
					title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
				>
					{#if isExpanded}
						<PanelLeftClose class="w-4 h-4" />
					{:else}
						<PanelLeft class="w-4 h-4" />
					{/if}
				</button>

				<!-- Global Search Bar -->
				<div class="relative hidden sm:block w-72">
					<Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<input
						type="text"
						placeholder="Search routes, services, upstreams..."
						class="w-full h-8 pl-9 pr-3 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all"
					/>
				</div>
			</div>

			<!-- Right Header Tools -->
			<div class="flex items-center gap-3">
				<!-- AI Integration Quick Pill -->
				<button
					type="button"
					onclick={() => aiDialogOpen = true}
					class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-bold shadow-xs"
				>
					<Sparkles class="w-3.5 h-3.5" />
					<span>{$aiStore.selectedModel || "Setup AI Key"}</span>
				</button>

				<!-- Theme Switcher -->
				<button
					type="button"
					onclick={toggleTheme}
					class="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent border border-border/50 transition-colors"
					title="Toggle Theme"
				>
					{#if theme === "light"}
						<Moon class="w-4 h-4" />
					{:else}
						<Sun class="w-4 h-4" />
					{/if}
				</button>

				<!-- User Profile Avatar Pill -->
				<div class="flex items-center gap-2 pl-2 border-l border-border">
					<div class="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-xs">
						AP
					</div>
				</div>
			</div>
		</header>

		<div class="flex-1 flex overflow-hidden">
			<!-- Desktop Sidebar Container -->
			<aside
				class="hidden lg:flex flex-col border-r border-border bg-card/80 backdrop-blur-md transition-all duration-300 z-30 {isExpanded
					? 'w-64'
					: 'w-20'}"
			>
				<!-- Logo Header -->
				<div class="h-16 px-4 flex items-center gap-3 border-b border-border/40">
					<div class="p-2 rounded-xl bg-primary/10 text-primary">
						<img src="/lumea.png" alt="Lumea" class="h-5 w-auto" />
					</div>
					{#if isExpanded}
						<div>
							<h1 class="font-bold text-sm leading-none text-foreground tracking-tight">Lumea</h1>
							<p class="text-[10px] text-muted-foreground font-medium mt-0.5">APISIX Manager</p>
						</div>
					{/if}
				</div>

				<!-- Navigation Links with Pill Style -->
				<nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
					{#each navItems as item}
						{@const isActive = item.exact ? page.url.pathname === item.href : page.url.pathname.startsWith(item.href)}
						<a
							href={item.href}
							class="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs transition-all group relative {isActive
								? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
								: 'text-muted-foreground hover:bg-accent hover:text-foreground font-semibold'}"
							title={!isExpanded ? item.label : undefined}
						>
							<item.icon class="w-4 h-4 shrink-0" />
							{#if isExpanded}
								<span class="truncate">{item.label}</span>
							{/if}
						</a>
					{/each}
				</nav>

				<!-- Sidebar Footer -->
				<div class="p-3 border-t border-border/40 shrink-0">
					{#if isExpanded}
						<form method="POST" action="/logout" class="w-full">
							<button
								type="submit"
								class="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
							>
								<LogOut class="w-4 h-4" />
								<span>Sign Out</span>
							</button>
						</form>
					{/if}
				</div>
			</aside>

			<!-- Mobile Sidebar Overlay Drawer -->
			{#if mobileSidebarOpen}
				<div class="fixed inset-0 z-[100] flex lg:hidden">
					<button
						type="button"
						onclick={() => mobileSidebarOpen = false}
						class="fixed inset-0 bg-black/70 backdrop-blur-xs"
						aria-label="Close sidebar overlay"
					></button>

					<div class="relative w-72 bg-card h-full flex flex-col border-r border-border p-4 shadow-2xl z-[101]">
						<div class="flex items-center justify-between pb-4 border-b border-border">
							<div class="flex items-center gap-3">
								<img src="/lumea.png" alt="Lumea" class="h-6 w-auto" />
								<span class="font-bold text-sm text-foreground">Lumea APIM</span>
							</div>
							<button type="button" onclick={() => mobileSidebarOpen = false} class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
								<X class="w-5 h-5" />
							</button>
						</div>

						<nav class="flex-1 py-4 space-y-1.5 overflow-y-auto">
							{#each navItems as item}
								{@const isActive = item.exact ? page.url.pathname === item.href : page.url.pathname.startsWith(item.href)}
								<a
									href={item.href}
									onclick={() => mobileSidebarOpen = false}
									class="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs {isActive ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30' : 'text-muted-foreground hover:bg-accent hover:text-foreground font-semibold'}"
								>
									<item.icon class="w-4 h-4" />
									<span>{item.label}</span>
								</a>
							{/each}
						</nav>

						<div class="pt-4 border-t border-border">
							<form method="POST" action="/logout" class="w-full">
								<button
									type="submit"
									class="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
								>
									<LogOut class="w-4 h-4" />
									<span>Sign Out</span>
								</button>
							</form>
						</div>
					</div>
				</div>
			{/if}

			<!-- Main Content Area -->
			<main class="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
				{@render children()}
			</main>
		</div>
	</div>

	<AISettingsDialog bind:open={aiDialogOpen} />
{/if}
