<script lang="ts">
    import SSLForm from "$lib/components/forms/SSLForm.svelte";
    import { page } from "$app/state";

    const id = $derived(page.params.id);
</script>

<SSLForm {id} />
