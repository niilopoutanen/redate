<script>
    import { config } from "$lib/state.svelte.js";

    import { onMount } from "svelte";


</script>

<h1>Files</h1>

<p class="label">File handling method:</p>
<div class="container">
    <select bind:value={config.fileHandling}>
        <option value="rename">Rename</option>
        <option value="copy">Copy</option>
        <option value="copytofolder">Copy to subfolder</option>
    </select>
</div>
