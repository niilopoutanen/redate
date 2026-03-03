<script>
    import { config } from "$lib/state.svelte.js";
</script>

<h1>File handling</h1>
<p class="label">File handling method:</p>
<div class="container">
    <select bind:value={config.fileHandling}>
        <option value="rename">Rename</option>
        <option value="copy">Copy</option>
        <option value="copytofolder">Copy to subfolder</option>
    </select>
</div>
