<script lang="ts">
    import RouteForm from "$lib/components/forms/RouteForm.svelte";
    import { page } from "$app/state";

    const id = $derived(page.params.id);
</script>

<RouteForm {id} />
