<script lang="ts">
    import folder from "$lib/vector/folder.svg";
    import settings from "$lib/vector/settings.svg";
    import close from "$lib/vector/close.svg";
    import back from "$lib/vector/back.svg";

    import { appState, APP_STATES } from "$lib/state.svelte.js";

    function stopProcessing() {
        if (appState.status === APP_STATES.PROCESSING) {
            changeStatus(APP_STATES.FILES_READY);
        }
    }

    function startProcessing() {
        changeStatus(APP_STATES.PROCESSING);
        const filesToProcess = $state.snapshot(appState.files);
        console.log("Starting processing for files:", filesToProcess);
        window.electron.startProcessing(filesToProcess);
    }

    function changeStatus(newStatus) {
        document.startViewTransition(() => {
            appState.status = newStatus;
        });
    }
</script>

<div class="controls">
    {#if appState.status === APP_STATES.INITIAL}
        <button onclick={() => window.electron.settings()}>
            <img src={settings} alt="Settings" />
        </button>
    {/if}

    {#if appState.status === APP_STATES.FILES_READY}
        <button
            onclick={() => {
                changeStatus(APP_STATES.INITIAL);
                appState.files = [];
            }}
        >
            <img src={back} alt="Go back" />
        </button>
    {/if}

    {#if appState.status === APP_STATES.INITIAL}
        <button>
            <img src={folder} alt="Browse files" />
        </button>
    {/if}

    {#if appState.status === APP_STATES.FILES_READY}
        <button class="primary" onclick={startProcessing}>
            <p>Start</p>
        </button>
    {/if}

    {#if appState.status === APP_STATES.PROCESSING}
        <button onclick={stopProcessing}>
            <p>Cancel</p>
        </button>
    {/if}

    {#if appState.status === APP_STATES.DONE}
        <button
            class="primary"
            onclick={() => {
                changeStatus(APP_STATES.INITIAL);
            }}
        >
            <p>Done</p>
        </button>
    {/if}

    {#if appState.status != APP_STATES.PROCESSING && appState.status != APP_STATES.DONE}
        <button onclick={() => window.electron.close()}>
            <img src={close} alt="Close app" />
        </button>
    {/if}
</div>

<style lang="scss">
    @use "$lib/styles/variables.scss" as *;
    @use "sass:color";

    .controls {
        view-transition-name: bottom-controls;
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding: 15px;

        button {
            background-color: $layer-2;

            width: 60px;
            min-width: 35px;
            height: 35px;
            border-radius: 10px;
            flex-shrink: 1;
            flex-grow: 1;
            border: none;
            outline: none;

            display: flex;
            align-items: center;
            justify-content: center;
            flex-basis: min-content;
            transition:
                transform 0.2s ease,
                background-color 0.3s ease,
                flex-grow 0.3s ease,
                flex-basis 0.3s ease;

            &:global(.primary) {
                background-color: $accent;
                flex-grow: 2;
                flex-basis: 1;

                &:hover {
                    background-color: color.scale($accent, $lightness: -5%);
                }
            }
            &:hover {
                background-color: #ffffff20;
            }
            &:active {
                transform: scale(0.95);
            }
        }
    }
</style>
