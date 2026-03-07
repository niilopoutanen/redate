<script>
    import BurstBG from "$lib/components/BurstBG.svelte";
    let { children } = $props();
</script>

<div class="onboarding">
    <div class="content">
        {@render children()}
    </div>

    <BurstBG colors={["#257cff"]} intensity={2} />
</div>

<style lang="scss">
    .onboarding {
        border-radius: 20px;
        overflow: hidden;
        width: 100%;
        height: 100%;
        position: relative;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;

        -webkit-app-region: drag;

        .content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
    }
    @keyframes onboarding-load {
        from {
            opacity: 0;
            transform: scale(0.4);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
</style>
