<script lang="ts">
    import UpstreamForm from "$lib/components/forms/UpstreamForm.svelte";
    import { page } from "$app/state";

    const id = $derived(page.params.id);
</script>

<UpstreamForm {id} />
