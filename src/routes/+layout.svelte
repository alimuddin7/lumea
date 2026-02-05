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
		ChevronRight,
		ChevronLeft,
		Layout,
		PanelLeftClose,
		PanelLeft,
	} from "lucide-svelte";
	import { config, connectionStatus } from "$lib/stores/config";
	import { checkConnection } from "$lib/api/client";
	import { page } from "$app/state";

	let { children } = $props();

	const navItems = [
		{ href: "/routes", icon: Globe, label: "Routes" },
		{ href: "/services", icon: Server, label: "Services" },
		{ href: "/upstreams", icon: Database, label: "Upstreams" },
		{ href: "/consumers", icon: Users, label: "Consumers" },
		{
			href: "/consumer-groups",
			icon: LayoutGrid,
			label: "Consumer Groups",
		},
		{ href: "/plugins", icon: LayoutGrid, label: "Plugins" },
		{ href: "/ssl", icon: ShieldCheck, label: "Certificates" },
		{ href: "/import-export", icon: Download, label: "Import/Export" },
		{ href: "/settings", icon: Settings, label: "Settings" },
	];

	let isExpanded = $state(true);
	let drawerChecked = $state(false);
	let theme = $state("dark");

	function toggleTheme() {
		theme = theme === "light" ? "dark" : "light";
		applyTheme(theme);
	}

	function applyTheme(newTheme: string) {
		document.documentElement.setAttribute("data-theme", newTheme);
		localStorage.setItem("theme", newTheme);
	}

	// Logout is now handled via form submission to /logout

	async function performHealthCheck() {
		connectionStatus.set("checking");
		const isConnected = await checkConnection();
		connectionStatus.set(isConnected ? "connected" : "disconnected");
	}

	onMount(() => {
		// Initialize theme
		const savedTheme =
			localStorage.getItem("theme") ||
			(window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light");
		theme = savedTheme;
		applyTheme(theme);

		// Initialize sidebar state from local storage
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

	$effect(() => {
		localStorage.setItem("sidebar_expanded", isExpanded.toString());
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Lumea - Modern APISIX Control Center</title>
</svelte:head>

{#if page.url.pathname === "/login"}
	<main class="min-h-screen">
		{@render children()}
	</main>
{:else}
	<div class="drawer lg:drawer-open font-sans min-h-screen bg-base-200">
		<input
			id="main-drawer"
			type="checkbox"
			class="drawer-toggle"
			bind:checked={drawerChecked}
		/>

		<div class="drawer-content flex flex-col min-h-screen">
			<!-- Navbar -->
			<nav
				class="navbar w-full bg-base-100/80 backdrop-blur-md border-b border-base-300 px-4 lg:px-6 sticky top-0 z-30 h-16"
			>
				<div class="flex-none lg:hidden">
					<label
						for="main-drawer"
						aria-label="open sidebar"
						class="btn btn-square btn-ghost"
					>
						<MenuIcon class="w-6 h-6" />
					</label>
				</div>

				<div class="flex-1 flex items-center gap-3 px-2">
					<div class="hidden lg:flex">
						<button
							onclick={() => (isExpanded = !isExpanded)}
							class="btn btn-ghost btn-xs btn-square opacity-40 hover:opacity-100 transition-opacity"
							title={isExpanded
								? "Collapse Sidebar"
								: "Expand Sidebar"}
						>
							{#if isExpanded}
								<PanelLeftClose class="w-4 h-4" />
							{:else}
								<PanelLeft class="w-4 h-4" />
							{/if}
						</button>
					</div>

					<!-- Lumea Branding (Mobile Only) -->
					<div class="flex lg:hidden items-center gap-3">
						<img
							src="/lumea.png"
							alt="Lumea"
							class="h-6 w-auto object-contain"
						/>
						<span
							class="hidden md:block text-[9px] font-bold uppercase tracking-widest opacity-30 italic mt-1"
						>
							APISIX Dashboard
						</span>
					</div>

					<div
						class="flex items-center gap-2 px-3 py-1 bg-base-200/50 rounded-full border border-base-300/50 h-8"
					>
						<div
							class="w-1.5 h-1.5 rounded-full {$connectionStatus ===
							'connected'
								? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]'
								: $connectionStatus === 'checking'
									? 'bg-warning'
									: 'bg-error'}"
						></div>
						<span
							class="text-[10px] font-black uppercase tracking-[0.15em] opacity-40"
						>
							{$connectionStatus}
						</span>
					</div>
				</div>

				<div class="flex-none gap-3">
					<!-- Theme Toggle -->
					<button
						class="btn btn-ghost btn-circle btn-sm"
						onclick={toggleTheme}
					>
						{#if theme === "light"}
							<Moon class="w-4 h-4 opacity-60" />
						{:else}
							<Sun class="w-4 h-4 opacity-60" />
						{/if}
					</button>

					<button
						onclick={performHealthCheck}
						class="btn btn-ghost btn-circle btn-sm"
						aria-label="Refresh status"
					>
						<RefreshCw
							class={"w-4 h-4 opacity-60 " +
								($connectionStatus === "checking"
									? "animate-spin"
									: "")}
						/>
					</button>

					<!-- User Dropdown -->
					<div class="dropdown dropdown-end ml-1">
						<div
							tabindex="0"
							role="button"
							class="btn btn-ghost btn-circle avatar border border-base-300 shadow-sm"
						>
							<div
								class="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center font-black text-xs uppercase tracking-tighter italic"
							>
								AP
							</div>
						</div>
						<ul
							class="mt-3 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100 rounded-2xl w-52 border border-base-300"
						>
							<li
								class="menu-title px-4 py-2 opacity-40 font-black text-[9px] uppercase tracking-[0.2em]"
							>
								Management
							</li>
							<li>
								<a href="/settings" class="py-3 font-bold"
									>System Settings</a
								>
							</li>
							<div class="divider my-0 opacity-10"></div>
							<li>
								<form
									method="POST"
									action="/logout"
									class="w-full"
								>
									<button
										type="submit"
										class="py-3 text-error font-black italic w-full text-left"
										>Terminate Session</button
									>
								</form>
							</li>
						</ul>
					</div>
				</div>
			</nav>

			<!-- Page Content -->
			<main
				class="flex-1 p-4 lg:p-10 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-auto"
			>
				{@render children()}
			</main>
		</div>

		<!-- Sidebar -->
		<div class="drawer-side z-40 overflow-visible">
			<label
				for="main-drawer"
				aria-label="close sidebar"
				class="drawer-overlay"
			></label>
			<aside
				class="flex h-full flex-col bg-base-100 border-r border-base-300 transition-all duration-300 ease-in-out {isExpanded
					? 'w-64'
					: 'w-20'}"
			>
				<!-- Brand Header -->
				<div
					class="h-16 flex items-center px-6 mb-6 border-b border-base-200 overflow-hidden whitespace-nowrap"
				>
					<div class="flex flex-col gap-1 w-full">
						<!-- Logo -->
						<div class="flex items-center justify-start">
							<img
								src="/lumea.png"
								alt="Lumea"
								class="{isExpanded
									? 'h-7'
									: 'h-6'} w-auto object-contain transition-all duration-200"
							/>
						</div>
						<!-- Tagline -->
						{#if isExpanded}
							<span
								class="text-[9px] font-bold uppercase tracking-[0.15em] opacity-40"
							>
								APISIX Dashboard
							</span>
						{/if}
					</div>
				</div>

				<!-- Navigation Menu -->
				<ul class="menu w-full grow px-3 gap-2 overflow-x-hidden">
					{#each navItems as item}
						<li>
							<a
								href={item.href}
								onclick={() => (drawerChecked = false)}
								class="flex items-center gap-4 py-3 px-4 rounded-xl transition-all font-bold group relative {page.url.pathname.startsWith(
									item.href,
								)
									? 'bg-primary/10 text-primary shadow-[inset_0_0_12px_rgba(var(--p),0.05)]'
									: 'hover:bg-base-200/50 text-base-content/50 hover:text-base-content hover:opacity-100'}"
								class:justify-center={!isExpanded}
							>
								{#if page.url.pathname.startsWith(item.href)}
									<div
										class="absolute left-0 w-1 h-5 bg-primary rounded-r-full animate-in slide-in-from-left-full duration-500"
									></div>
								{/if}
								<div
									class="min-w-[20px] flex justify-center {isExpanded
										? ''
										: 'group-hover:scale-110 transition-transform'}"
								>
									<item.icon class="w-5 h-5" />
								</div>
								{#if isExpanded}
									<span
										class="animate-in fade-in slide-in-from-left-2 duration-300"
										>{item.label}</span
									>
								{:else}
									<div
										class="tooltip tooltip-right absolute left-full ml-4 font-black text-[10px] uppercase tracking-widest px-2 py-1"
										data-tip={item.label}
									></div>
								{/if}
							</a>
						</li>
					{/each}
				</ul>

				<!-- Footer -->
				<div class="p-6 border-t border-base-200">
					{#if isExpanded}
						<div class="flex flex-col gap-3">
							<div
								class="text-xs text-base-content/70 leading-relaxed"
							>
								<div class="font-black text-sm mb-0.5">
									Lumea
								</div>
								<div class="text-[10px] opacity-60 font-medium">
									Modern APISIX Control Center
								</div>
							</div>
							<div
								class="pt-4 border-t border-base-200/50 flex flex-col gap-2"
							>
								<form
									method="POST"
									action="/logout"
									class="w-full"
								>
									<button
										type="submit"
										class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-error/10 text-error/60 hover:text-error transition-all group/logout w-full"
									>
										<LogOut
											class="w-3.5 h-3.5 group-hover/logout:-translate-x-0.5 transition-transform"
										/>
										<span
											class="text-[10px] font-black uppercase tracking-widest"
											>Sign Out</span
										>
									</button>
								</form>
								<div
									class="text-[9px] text-base-content/40 pt-2"
								>
									© 2026 Lumea. All rights reserved.
								</div>
							</div>
						</div>
					{:else}
						<div class="flex justify-center">
							<div
								class="w-8 h-8 rounded-lg bg-base-200/50 flex items-center justify-center opacity-30"
							>
								<Layout class="w-3.5 h-3.5" />
							</div>
						</div>
					{/if}
				</div>
			</aside>
		</div>
	</div>
{/if}

<style>
	/* @reference "tailwindcss"; */

	:global(.lucide) {
		width: 1.15rem !important;
		height: 1.15rem !important;
	}

	:global(html) {
		scroll-behavior: smooth;
	}

	/* Minimalist overrides */
	.drawer-side aside {
		scrollbar-width: none;
	}
	.drawer-side aside::-webkit-scrollbar {
		display: none;
	}
</style>
