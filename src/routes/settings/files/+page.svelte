<script>
    import { onMount } from "svelte";

    let config = $state(null);

    onMount(async () => {
        config = await window.electron.getConfig();
        console.log(config);
    });
</script>

<h1>Files</h1>


<p class="label">File handling method:</p>
<div class="container">
    <p class="nomargin">{config?.fileHandling}</p>
</div>
