<script lang="ts">
    import RouteForm from "$lib/components/forms/RouteForm.svelte";
    import { page } from "$app/state";

    const initialPlugin = page.url.searchParams.get("plugin");
</script>

<RouteForm id="new" {initialPlugin} />
