<script>
    import { config } from "$lib/state.svelte.js";
    import FormatBuilder from "$lib/components/FormatBuilder.svelte";
</script>

<h1>File handling</h1>
<div class="container">
    <div class="control">
        <p class="label">File handling method:</p>
        <select bind:value={config.fileHandling}>
            <option value="rename">Rename</option>
            <option value="copy">Copy</option>
            <option value="copytofolder">Copy to subfolder</option>
        </select>
    </div>
</div>

<div class="container">
    <p class="label">Date format: </p>
    <FormatBuilder/>
</div>
