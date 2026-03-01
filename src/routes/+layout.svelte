<script>
    import "$lib/styles/global.scss";

    import { onNavigate } from "$app/navigation";
    /** @type {{children?: import('svelte').Snippet}} */
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
</script>

{@render children?.()}