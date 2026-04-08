<script>
    import { config, updateConfig } from "$lib/state.svelte.js";

</script>

<h1>Settings</h1>

<div class="container">
    <div class="control">
        <p class="label">Ask for confirmation before processing</p>
        <input type="checkbox" checked={config.gui.confirmProcessing} onchange={(e) => updateConfig('gui', 'confirmProcessing', e.currentTarget.checked)} />
    </div>

    <div class="separator"></div>

    <div class="control">
        <p class="label">Quit automatically after processing</p>
        <input type="checkbox" checked={config.gui.quitWhenDone} onchange={(e) => updateConfig('gui', 'quitWhenDone', e.currentTarget.checked)} />
    </div>
</div>

<div class="container">
    <div class="control">
        <p class="label">File handling method:</p>
        <select class="input" bind:value={config.cli.fileHandling} onchange={(e) => updateConfig('cli', 'fileHandling', e.currentTarget.value)}>
            <option value="rename">Rename</option>
            <option value="copy">Copy</option>
            <option value="copytofolder">Copy to subfolder</option>
        </select>
    </div>
</div>

<div class="container">
    <div class="control">
        <p class="label">Action on duplicate file names</p>
        <select class="input" bind:value={config.cli.duplicateAction} onchange={(e) => updateConfig('cli', 'duplicateAction', e.currentTarget.value)}>
            <option value="addindex">Add index</option>
            <option value="overwrite">Overwrite</option>
            <option value="skip">Skip</option>
        </select>
    </div>
</div>


<div class="container">
    <div class="control">
        <p class="label">Drop window size</p>
        <p class="small-label">{config.gui.dropWindowSize}px</p>
        <input type="range" min="200" step="50" max="600" bind:value={config.gui.dropWindowSize} onchange={(e) => updateConfig('gui', 'dropWindowSize', e.currentTarget.value)}/>
    </div>
</div>