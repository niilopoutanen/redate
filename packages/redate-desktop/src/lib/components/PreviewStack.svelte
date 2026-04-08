<script>
    import folder from "$lib/assets/folder.png";
    import placeholder from "$lib/assets/placeholder.png";
    import { onMount } from "svelte";

    let files = $state([]);

    onMount(() => {
        window.electron.getFiles().then((fileCache) => {
            files = fileCache;
        });
        window.electron.on("files:updated", (fileCache) => {
            files = fileCache;
        });
    });
    let fileCount = $derived.by(() => files.filter((f) => isFile(f)).length);
    let folderCount = $derived.by(() => files.filter((f) => !isFile(f)).length);

    function isFile(pathname) {
        if (typeof pathname !== "string") return false;

        const name = pathname.split(/[/\\]/).pop();
        if (!name) return false;

        const lastDot = name.lastIndexOf(".");
        return lastDot > 0 && lastDot < name.length - 1;
    }

    let previewFiles = $derived.by(() => files.slice(0, 3));
</script>

<div class="info">
    <div class="preview-stack">
        {#each previewFiles as file, i}
            {#if file == null || file === ""}
                <img src={placeholder} alt="" />
            {:else if isFile(file)}
                <img src="thum:///{file}" alt="" class={"thumb thumb-" + i} />
            {:else}
                <img src={folder} alt="" />
            {/if}
        {/each}
        <button class="preview" onclick={() => window.electron.preview()} title="Preview">
            <p>Preview</p>
        </button>
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
        width: 100%;
        .preview-stack {
            width: 100%;
            height: 100%;
            flex-grow: 1;
            position: relative;

            img {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                transform-origin: center center;
                height: 100%;
                width: auto;
                object-fit: cover;
                border-radius: 5px;
                user-select: none;
                pointer-events: none;
                transition: transform 0.3s ease;
                &.thumb {
                    border: 1px solid #ffffff1b;
                    width: 60%;
                    height: 70%;
                }

                &:nth-child(1) {
                    transform: translate(-50%, -50%) rotate(0deg);
                    z-index: 4;
                }

                &:nth-child(2) {
                    transform: translate(-50%, -50%) translate(10%, 10%) rotate(-5deg);
                    z-index: 3;
                }

                &:nth-child(3) {
                    transform: translate(-50%, -50%) translate(-10%, -10%) rotate(5deg);
                    z-index: 2;
                }
            }

            button.preview {
                opacity: 0;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 5;
                pointer-events: none;
                background-color: #00000046;
                backdrop-filter: blur(10px);
                border: none;
                outline: none;
                border-radius: 10px;
                padding: 10px;
                cursor: pointer;

                transition: opacity 0.1s ease;

                p {
                    margin: 0;
                }
            }
            &:hover {
                button.preview {
                    opacity: 1;
                    pointer-events: all;
                }

                img {
                    &:nth-child(1) {
                        transform: translate(-50%, -50%) rotate(0deg) scale(1.05);
                    }
                    &:nth-child(2) {
                        transform: translate(-50%, -50%) translate(10%, 10%) rotate(-10deg);
                    }
                    &:nth-child(3) {
                        transform: translate(-50%, -50%) translate(-10%, -10%) rotate(10deg);
                    }
                }
            }
        }

        p.details {
            font-size: 12px;
            text-align: center;
            margin: 0;
        }
    }
</style>
