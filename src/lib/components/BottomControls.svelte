<script context="module" lang="ts">
    export const STATE_INITIAL = "initial";
    export const STATE_FILESREADY = "files-ready";
    export const STATE_PROCESSING = "processing";
    export const STATE_DONE = "done";
</script>

<script lang="ts">
    import folder from "$lib/vector/folder.svg";
    import settings from "$lib/vector/settings.svg";
    import close from "$lib/vector/close.svg";
    import back from "$lib/vector/back.svg";

    import { onMount } from "svelte";
    import { goto } from "$app/navigation";


    let state = STATE_INITIAL;
    onMount(() => {
        window.electron.stateUpdate((value) => {
            console.log("New state: ", value);
            updateRoute(value);
        });
    });

    function updateRoute(value){
        state = value;
        if (state === STATE_FILESREADY) {
                goto("drop/preview");
            }
            if (state === STATE_PROCESSING) {
                goto("/drop/processing");
            }
            if (state === STATE_DONE) {
                goto("/drop/done");
            }
            if (state === STATE_INITIAL) {
                goto("/drop");
            }
    }
    function stopProcessing() {}
</script>

<div class="controls">
    {#if state === STATE_INITIAL}
        <button on:click={() => window.electron.settings()}>
            <img src={settings} alt="Settings" />
        </button>
    {/if}

    {#if state === STATE_FILESREADY}
        <button on:click={() => updateRoute(STATE_INITIAL)}>
            <img src={back} alt="Go back" />
        </button>
    {/if}

    {#if state === STATE_INITIAL}
        <button>
            <img src={folder} alt="Browse files" />
        </button>
    {/if}

    {#if state === STATE_FILESREADY}
        <button class="primary" >
            <p>Start</p>
        </button>
    {/if}

    {#if state === STATE_PROCESSING}
        <button on:click={stopProcessing}>
            <p>Cancel</p>
        </button>
    {/if}

    {#if state === STATE_DONE}
        <button class="primary" on:click={() => {updateRoute(STATE_INITIAL);}}>
            <p>Done</p>
        </button>
    {/if}

    {#if state != STATE_PROCESSING && state != STATE_DONE}
        <button >
            <img src={close} alt="Close app" />
        </button>
    {/if}
</div>

<style lang="scss">
    @use "$lib/styles/variables.scss" as *;
    @use 'sass:color';

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
