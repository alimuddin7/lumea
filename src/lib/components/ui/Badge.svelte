<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils/cn";

  interface Props {
    variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning";
    class?: string;
    children?: Snippet;
  }

  let {
    variant = "default",
    class: className = "",
    children
  }: Props = $props();

  const variantClasses = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "text-foreground border-border",
    destructive: "border-transparent bg-destructive/20 text-destructive border-destructive/30",
    success: "border-transparent bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "border-transparent bg-amber-500/15 text-amber-400 border-amber-500/30"
  };
</script>

<div
  class={cn(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variantClasses[variant],
    className
  )}
>
  {#if children}
    {@render children()}
  {/if}
</div>
