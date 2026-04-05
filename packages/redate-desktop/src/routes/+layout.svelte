<script>
    import "$lib/styles/global.scss";
    import { onNavigate } from "$app/navigation";
    import { onMount } from "svelte";
    import { config } from "$lib/state.svelte.js";
    let { children } = $props();

    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });

    onMount(async () => {
        const loaded = await window.electron.getConfig();
        Object.assign(config, loaded);
        
    })
</script>

{@render children?.()}
