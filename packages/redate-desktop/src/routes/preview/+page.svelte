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

    function removeFileFromCache(filename) {
        window.electron.getFiles().then((files) => {
            const updatedFiles = files.filter((file) => file !== filename);
            window.electron.setFiles(updatedFiles);
        });
    }
</script>

<div class="preview" class:mac={isMac}>
    <div class="handle"></div>
    <div class="files">
        {#if files && files.length > 0}
            {#each files as file}
                <div class="file">
                    <div class="icon">
                        <img src="thum:///{file}" alt="" />
                        <div class="remove" title="Remove from list" onclick={() => removeFileFromCache(file)}>
                            <img src={close} alt="Remove from list" />
                        </div>
                    </div>
                    <p class="name">{getFileNameFromPath(file)}</p>
                </div>
            {/each}
        {:else}
            <p>No files selected for processing.</p>
        {/if}
    </div>

    <div class="controls">
        <button class="primary" onclick={() => window.electron.close("preview")} title="Close">
            <p>Close</p>
        </button>
        <button onclick={() => window.electron.setFiles([])} title="Clear all">
            <p>Clear all</p>
        </button>
    </div>
</div>

<style lang="scss">
    @use "$lib/styles/variables.scss" as *;

    .preview {
        display: flex;
        background-color: transparent;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        box-sizing: border-box;
        padding: 0 5px 5px 5px;

        &.mac {
            padding-top: 20px;
        }
    }
    .handle {
        width: 100%;
        height: 40px;
        -webkit-app-region: drag;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 10;

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
                cursor: pointer;

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
        padding: 10px 5px 80px 5px;
        overflow-y: scroll;

        .file {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100px;
            min-width: 100px;
            position: relative;

            .icon {
                width: 100px;
                min-width: 60px;
                height: 100px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px;
                border-radius: 5px;
                box-sizing: border-box;

                img {
                    width: auto;
                    height: auto;
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    border-radius: 4px;
                }

                .remove {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    width: 30px;
                    height: 30px;
                    background-color: #00000046;
                    backdrop-filter: blur(10px);
                    padding: 8px;
                    box-sizing: border-box;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s ease, background-color 0.2s ease;
                    cursor: pointer;

                    img {
                        width: 100%;
                        height: 100%;
                        filter: brightness(2);
                    }

                    &:hover{
                        background-color: rgba(31, 31, 31, 0.275);
                    }
                }

                &:hover {
                    background-color: $layer-2;
                    .remove {
                        opacity: 1;
                        pointer-events: all;
                    }
                }
            }

            .name {
                margin: 0;
                font-size: 12px;
                text-align: center;
            }
        }

        &::-webkit-scrollbar {
            width: 10px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background: $layer-2;
            border-radius: 10px;
        }
    }

    .controls {
        position: absolute;
        left: 0;
        bottom: 0;
        background: linear-gradient(0deg, $layer-0 20%, #21212100 100%);
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
        border-radius: 0 0 10px 10px;

        button {
            padding: 10px;
            border-radius: 10px;
            border: none;
            outline: none;
            background-color: $layer-1;
            cursor: pointer;

            &.primary {
                background-color: $accent;
            }

            p {
                margin: 0;
            }
        }
    }
</style>
