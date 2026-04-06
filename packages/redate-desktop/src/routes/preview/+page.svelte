<script>
    import { onMount } from "svelte";
    import close from "$lib/vector/close.svg";
    import dash from "$lib/vector/dash.svg";

    let files = $state([]);
    let isMac = $state(false);
    onMount(async () => {
        window.electron.getFiles().then((fileCache) => {
            files = fileCache;
        });
        window.electron.on("files:updated", (fileCache) => {
            files = fileCache;
        });

        isMac = await window.electron.isMac();
    });

    function getFileNameFromPath(path) {
        return path.split(/[/\\]/).pop();
    }
</script>

<div class="preview">
    <div class="handle">
        {#if !isMac}
            <div class="controls-windows">
                <button onclick={() => window.electron.minimize("preview")}> <img src={dash} alt="Minimize" /> </button>
                <button onclick={() => window.electron.close("preview")}> <img src={close} alt="Close" /> </button>
            </div>
        {/if}
    </div>
    <div class="files">
        {#each files as file}
            <div class="file">
                <div class="icon">
                    <img src="thum:///{file}" alt="" />
                </div>
                <p class="name">{getFileNameFromPath(file)}</p>
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
    @use "$lib/styles/variables.scss" as *;

    .preview {
        display: flex;
        background-color: $layer-0;
        flex-direction: column;
        border-radius: 10px;
        height: 100%;
        overflow: hidden;
        border: 2px solid $layer-1;
        box-sizing: border-box;
    }
    .handle {
        width: 100%;
        height: 40px;
        -webkit-app-region: drag;

        .controls-windows {
            height: 100%;
            width: 100%;
            display: flex;
            justify-content: flex-end;
            align-items: center;

            button {
                -webkit-app-region: no-drag;
                height: 100%;
                aspect-ratio: 1;
                background-color: transparent;
                outline: none;
                border: none;
                transition: background-color 0.1s;
                display: flex;
                align-items: center;
                justify-content: center;

                &:hover {
                    background-color: $layer-1;
                }

                img {
                    width: 10px;
                    height: 10px;
                }
            }
        }
    }

    .files {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 0 20px 20px 20px;

        .file {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            img {
                background-color: $layer-2;
                width: 100px;
                height: 80px;
                border-radius: 4px;
                object-fit: cover;
            }

            .name {
                margin: 0;
                font-size: 12px;
            }
        }
    }
</style>
