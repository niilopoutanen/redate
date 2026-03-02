<script>
    import { onMount } from "svelte";
    import BottomControls from "$lib/components/BottomControls.svelte";
    import { appState, APP_STATES } from "$lib/state.svelte.js";

    let droparea = $state();

    $effect(() => {
        if (!droparea) return;

        const onDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            droparea.classList.add("active");
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
                const droppedPaths = Array.from(e.dataTransfer.files).map((f) => window.electron.showFilePath(f));
                console.log("Files dropped:", droppedPaths);
                appState.files.push(...droppedPaths);
            }
            document.startViewTransition(() => {
                appState.status = APP_STATES.FILES_READY;
            });
        };

        droparea.addEventListener("dragover", onDragOver);
        droparea.addEventListener("dragleave", onDragLeave);
        droparea.addEventListener("drop", onDrop);

        // cleanup if droparea changes
        return () => {
            droparea.removeEventListener("dragover", onDragOver);
            droparea.removeEventListener("dragleave", onDragLeave);
            droparea.removeEventListener("drop", onDrop);
        };
    });

    onMount(() => {
        window.electron.onProcessingComplete((result) => {
            if (result.success) {
                document.startViewTransition(() => {
                    appState.status = APP_STATES.DONE;
                });
            } else {
                console.log("Processing failed:", result.error);
                document.startViewTransition(() => {
                    appState.status = APP_STATES.ERROR;
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
            <div class="droparea active">
                <p>{appState.files.length} {appState.files.length === 1 ? "file" : "files"} ready</p>
            </div>
        {:else if appState.status === APP_STATES.PROCESSING}
            <div>
                <span class="loader"></span>
            </div>
        {:else if appState.status === APP_STATES.DONE}
            <div class="done">
                <p>Processing complete!</p>
            </div>
        {:else if appState.status === APP_STATES.ERROR}
            <div class="error">
                <p>Processing failed.</p>
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
        background-color: $layer-0-solid;
        border-radius: 15px;
        border: 2px solid $layer-1-solid;

        .header {
            -webkit-app-region: drag;
            view-transition-name: header;
            width: 100%;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;

            .handle {
                width: 50px;
                height: 5px;
                background-color: $layer-1;
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
            text-align: center;
        }
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
</style>
