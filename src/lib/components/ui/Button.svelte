<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { cn } from "$lib/utils/cn";

  interface Props extends HTMLButtonAttributes {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon" | "xs";
    class?: string;
    children?: Snippet;
  }

  let {
    variant = "default",
    size = "default",
    class: className = "",
    children,
    type = "button",
    ...rest
  }: Props = $props();

  const variantClasses = {
    default: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 border border-rose-500/40 font-bold",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md font-bold",
    outline: "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground shadow-xs font-semibold",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-secondary/40 shadow-xs font-bold",
    ghost: "hover:bg-accent hover:text-accent-foreground font-semibold",
    link: "text-rose-600 underline-offset-4 hover:underline font-semibold"
  };

  const sizeClasses = {
    default: "h-9 px-4 py-2 text-sm rounded-xl",
    xs: "h-7 px-2.5 text-xs rounded-lg",
    sm: "h-8 px-3.5 text-xs rounded-xl",
    lg: "h-11 px-8 text-base rounded-2xl",
    icon: "h-9 w-9 rounded-xl"
  };
</script>

<button
  {type}
  class={cn(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
    variantClasses[variant],
    sizeClasses[size],
    className
  )}
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</button>
