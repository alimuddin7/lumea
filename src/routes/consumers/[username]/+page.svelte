<script lang="ts">
    import ConsumerForm from "$lib/components/forms/ConsumerForm.svelte";
    import { page } from "$app/state";

    const username = page.params.username;
</script>

<ConsumerForm {username} />
