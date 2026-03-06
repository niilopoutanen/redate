<script>
    import { onMount } from "svelte";
    import { guiConfig } from "$lib/state.svelte.js";
</script>

<h1>Settings</h1>

<div class="container">
    <div class="control">
        <p class="label">Ask for confirmation before processing</p>
        <input type="checkbox" bind:checked={guiConfig.confirmProcessing} />
    </div>

    <div class="separator"></div>

    <div class="control">
        <p class="label">Quit automatically after processing</p>
        <input type="checkbox" bind:checked={guiConfig.quitWhenDone} />
    </div>
</div>
