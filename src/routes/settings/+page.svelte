<script>
    import { onMount } from "svelte";
    import { guiConfig, updateGuiConfig, config } from "$lib/state.svelte.js";

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

<div class="container">
    <div class="control">
        <p class="label">File handling method:</p>
        <select class="input" bind:value={config.fileHandling}>
            <option value="rename">Rename</option>
            <option value="copy">Copy</option>
            <option value="copytofolder">Copy to subfolder</option>
        </select>
    </div>
</div>

<div class="container">
    <div class="control">
        <p class="label">Action on duplicate file names</p>
        <select class="input" >
            <option value="rename">Add index</option>
            <option value="copy">Overwrite</option>
        </select>
    </div>
</div>