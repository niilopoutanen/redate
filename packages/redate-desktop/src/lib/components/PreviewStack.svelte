<script>
    import onefile from "$lib/assets/onefile.png";
    import twofiles from "$lib/assets/twofiles.png";
    import manyfiles from "$lib/assets/manyfiles.png";
    import foldersandfiles from "$lib/assets/foldersandfiles.png";
    import manyfolders from "$lib/assets/manyfolders.png";
    import folder from "$lib/assets/folder.png";

    import { appState } from "$lib/state.svelte";

    let fileCount = $derived.by(() => appState.files.filter((f) => isFile(f)).length);
    let folderCount = $derived.by(() => appState.files.filter((f) => !isFile(f)).length);

    function isFile(pathname) {
        if (typeof pathname !== "string") return false;
        const name = pathname.split(/[/\\]/).pop();
        return name.includes(".");
    }

    // Helper to pick the right image
    let previewImage = $derived.by(() =>
        fileCount == 1 && folderCount == 0
            ? onefile
            : fileCount == 2 && folderCount == 0
              ? twofiles
              : fileCount > 2 && folderCount == 0
                ? manyfiles
                : fileCount > 0 && folderCount > 0
                  ? foldersandfiles
                  : fileCount == 0 && folderCount > 1
                    ? manyfolders
                    : fileCount == 0 && folderCount > 0
                      ? folder
                      : null,
    );
</script>

<div class="info">
    <div class="preview-stack">
        {#if previewImage}
            <img src={previewImage} alt="" />
        {/if}
    </div>
    <p class="details">
        {#if fileCount && folderCount}
            {fileCount} file{fileCount !== 1 ? "s" : ""} and {folderCount} folder{folderCount !== 1 ? "s" : ""} ready
        {:else if fileCount}
            {fileCount} file{fileCount !== 1 ? "s" : ""} ready for processing
        {:else if folderCount}
            {folderCount} folder{folderCount !== 1 ? "s" : ""} ready for processing
        {/if}
    </p>
</div>

<style lang="scss">
    .info {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        .preview-stack {
            width: 100%;
            height: 100%;
            flex-grow: 1;
            position: relative;

            img {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;

                width: 150px;
                height: 120px;
            }
        }

        p.details {
            font-size: 12px;
            text-align: center;
            margin: 0;
        }
    }
</style>
