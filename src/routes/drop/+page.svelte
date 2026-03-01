<script>
    import { onMount } from "svelte";
    import BottomControls from "$lib/components/BottomControls.svelte";
    import { appState, APP_STATES } from "$lib/state.svelte.js";

    let droparea = $state();
    onMount(() => {
        droparea.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.stopPropagation();
            droparea.classList.add("active");
        });
        droparea.addEventListener("dragleave", (e) => {
            e.preventDefault();
            e.stopPropagation();
            droparea.classList.remove("active");
        });
        droparea.addEventListener("drop", (e) => {
            e.preventDefault();
            e.stopPropagation();
            droparea.classList.remove("active");

            if (e.dataTransfer != null) {
                const droppedPaths = Array.from(e.dataTransfer.files).map((f) => window.electron.showFilePath(f));

                console.log("Files dropped:", droppedPaths);

                appState.files.push(...droppedPaths);
            }
            appState.status = APP_STATES.FILES_READY;
        });

        window.electron.onProcessingComplete((result) => {
            if (result.success) {
                appState.status = APP_STATES.DONE;
            } else {
                console.log("Processing failed:", result.error);
                appState.status = APP_STATES.ERROR;
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
            <div class="droparea active">
                <p>Processing...</p>
            </div>
        {:else if appState.status === APP_STATES.DONE}
            <div class="done">
                <p>Processing complete!</p>
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
</style>
