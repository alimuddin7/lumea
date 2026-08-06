<script lang="ts">
  import type { Snippet } from "svelte";
  import { X } from "lucide-svelte";
  import { cn } from "$lib/utils/cn";

  interface Props {
    open: boolean;
    title?: string;
    description?: string;
    onClose?: () => void;
    class?: string;
    children?: Snippet;
    footer?: Snippet;
  }

  let {
    open = $bindable(false),
    title = "",
    description = "",
    onClose,
    class: className = "",
    children,
    footer
  }: Props = $props();

  function handleClose() {
    open = false;
    onClose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      handleClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop Overlay -->
    <button
      type="button"
      tabindex="-1"
      onclick={handleClose}
      class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs animate-in fade-in-0 duration-200 border-0 cursor-default"
      aria-label="Close dialog backdrop"
    ></button>

    <!-- 100% Solid Opaque Content Card -->
    <div
      class={cn(
        "relative z-[101] grid w-full max-w-lg gap-4 border border-border p-6 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto bg-card text-card-foreground opacity-100",
        className
      )}
    >
      <div class="flex flex-col space-y-1.5 text-left pr-6">
        {#if title}
          <h2 class="text-lg font-bold leading-none tracking-tight text-foreground">{title}</h2>
        {/if}
        {#if description}
          <p class="text-xs text-muted-foreground leading-relaxed">{description}</p>
        {/if}
      </div>

      <button
        type="button"
        onclick={handleClose}
        class="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </button>

      <div class="py-2">
        {#if children}
          {@render children()}
        {/if}
      </div>

      {#if footer}
        <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-3 border-t border-border">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
