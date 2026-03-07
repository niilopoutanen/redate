<script>
    let formatInput = $state(null);

</script>

<div class="formatbuilder">
    <div class="available">

    </div>
    <input type="text" bind:this={formatInput} />
</div>

<style lang="scss">
    @use "$lib/styles/variables.scss" as *;

    .formatbuilder {
        input {
            padding: 10px;
        }
    }
</style>
