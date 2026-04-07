<script>
    import { onMount } from "svelte";
    import BottomControls from "$lib/components/BottomControls.svelte";
    import { appState, APP_STATES, config } from "$lib/state.svelte.js";
    import PreviewStack from "$lib/components/PreviewStack.svelte";

    let droparea = $state();

    $effect(() => {
        if (!droparea) return;

        const onDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!e.dataTransfer) return;

            const hasFiles = Array.from(e.dataTransfer.items).some((item) => item.kind === "file");

            if (hasFiles) {
                droparea.classList.add("active");
            }
        };
        const onDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            droparea.classList.remove("active");
        };
        const onDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            droparea.classList.remove("active");

            if (e.dataTransfer) {
                const items = Array.from(e.dataTransfer.items);
                const fileItems = items
                    .filter((item) => item.kind === "file") // only allow files/folders
                    .map((item) => {
                        const file = item.getAsFile();
                        return file ? window.electron.showFilePath(file) : null;
                    })
                    .filter(Boolean); // remove nulls

                if (fileItems.length > 0) {
                    window.electron.setFiles(fileItems);

                    if (config.gui.confirmProcessing == false) {
                        document.startViewTransition(() => {
                            appState.status = APP_STATES.PROCESSING;
                        });
                        window.electron.startProcessing();
                    } else {
                        document.startViewTransition(() => {
                            appState.status = APP_STATES.FILES_READY;
                        });
                    }
                }
            }
        };

        droparea.addEventListener("dragover", onDragOver);
        droparea.addEventListener("dragleave", onDragLeave);
        droparea.addEventListener("drop", onDrop);

        return () => {
            if (!droparea) return;
            droparea.removeEventListener("dragover", onDragOver);
            droparea.removeEventListener("dragleave", onDragLeave);
            droparea.removeEventListener("drop", onDrop);
        };
    });

    onMount(() => {
        window.electron.onProcessingComplete((result) => {
            appState.latestResult = result.result;
            console.log(result);
            if (result.success) {
                document.startViewTransition(() => {
                    appState.status = APP_STATES.DONE;
                });
            } else {
                console.log("Processing failed:", result.errors);
                document.startViewTransition(() => {
                    appState.status = APP_STATES.ERROR;
                });
            }
        });

        window.electron.on("files:updated", (fileCache) => {
            if (fileCache.length === 0) {
                document.startViewTransition(() => {
                    appState.status = APP_STATES.INITIAL;
                });
            }
        });
    });
</script>

<div class="dropwindow">
    <div class="header">
        <div class="handle"></div>
    </div>

    <div class="content">
        {#if appState.status === APP_STATES.INITIAL}
            <div class="droparea" bind:this={droparea}>
                <p>Drop files or <br /> folders here</p>
            </div>
        {:else if appState.status === APP_STATES.FILES_READY}
            <PreviewStack />
        {:else if appState.status === APP_STATES.PROCESSING}
            <div>
                <span class="loader"></span>
            </div>
        {:else if appState.status === APP_STATES.DONE}
            <div class="done">
                <p class="title">Processing complete!</p>
                {#if appState.latestResult}
                    <p class="details">
                        {appState.latestResult.processed} files processed
                        {#if appState.latestResult.skippedNoDate > 0}
                            , {appState.latestResult.skippedNoDate} skipped (no date information)
                        {/if}
                    </p>
                {/if}
            </div>
        {:else if appState.status === APP_STATES.ERROR}
            <div class="error">
                <p class="title">Processing failed.</p>
                <p class="cause">{appState.latestResult?.errors}</p>
            </div>
        {/if}
    </div>

    <BottomControls />
</div>

<style lang="scss">
    @use "$lib/styles/variables.scss" as *;
    .dropwindow {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        height: 100%;
        color: #818181;
        font-family: "Inter", sans-serif;
        background-color: $layer-0;
        border-radius: 15px;
        border: 2px solid $layer-2;
        animation: app-load 400ms ease forwards;
        overflow: hidden;

        @keyframes app-load {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        .header {
            -webkit-app-region: drag;
            view-transition-name: header;
            width: 100%;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;

            .handle {
                width: 50px;
                height: 5px;
                background-color: $layer-3;
                border-radius: 1000px;
            }
        }

        .content {
            flex-grow: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0px 15px 0px 15px;
            view-transition-name: content;
        }
    }

    .droparea {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        border-radius: 10px;

        transition:
            background-color 0.2s ease,
            color 0.2s ease;

        &:global(.active) {
            background-color: $layer-2;
            color: white;
        }
        p {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
            text-align: center;
            user-select: none;
        }
    }
    .details {
        font-size: 13px;
        text-align: center;
    }
    .title {
        color: white;
        text-align: center;
    }

    .loader {
        width: 60px;
        height: 60px;
        border: 5px solid $accent;
        border-bottom-color: transparent;
        border-radius: 50%;
        display: inline-block;
        box-sizing: border-box;
        animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .error {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow-y: scroll;
        overflow-x: hidden;
        gap: 5px;
        .title {
            margin: 0;
        }
        .cause {
            margin: 0;
            color: $text-secondary;
            font-size: 12px;
            text-align: center;
            white-space: normal;
            word-break: break-all;
        }
    }
</style>
