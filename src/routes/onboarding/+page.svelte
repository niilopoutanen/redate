<script>
    import icon from "$lib/assets/icon.png";
</script>

<img src={icon} class="icon" alt="ReDate" />
<h1>ReDate</h1>
<a class="button primary">Get started</a>

<style lang="scss">
    @use "$lib/styles/variables.scss" as *;
    .icon {
        width: 200px;
        height: 200px;
    }

    .button.primary {
        background-color: $accent;
        padding: 10px 20px;
        border-radius: 10px;
        -webkit-app-region: no-drag;
    }
</style>
