<script>
    import FormatBuilder from "$lib/components/FormatBuilder.svelte";
</script>

<div class="header">
    <h1>Rename format</h1>
    <p class="desc">Define the format for renamed files using the tokens below. Click on a token to insert it at the cursor position. Wrap the available tokens with '&lt;&gt;' to parse it.</p>
</div>

<FormatBuilder />
