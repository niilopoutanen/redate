<script>
    import { onMount } from "svelte";
    import { guiConfig, updateGuiConfig } from "$lib/state.svelte.js";
</script>

<h1>Settings</h1>

<div class="container">
    <div class="control">
        <p class="label">Ask for confirmation before processing</p>
        <input type="checkbox" checked={guiConfig.confirmProcessing} onchange={(e) => updateGuiConfig({ confirmProcessing: e.currentTarget.checked })} />
    </div>

    <div class="separator"></div>

    <div class="control">
        <p class="label">Quit automatically after processing</p>
        <input type="checkbox" checked={guiConfig.quitWhenDone} onchange={(e) => updateGuiConfig({ quitWhenDone: e.currentTarget.checked })} />
    </div>
</div>