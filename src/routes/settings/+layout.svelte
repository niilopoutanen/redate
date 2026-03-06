<script>
    import { config } from "$lib/state.svelte.js";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import drive from "$lib/vector/drive.svg";
    import gear from "$lib/vector/gear.svg";
    import menu from "$lib/vector/menu.svg";
    import close from "$lib/vector/close.svg";
    import dash from "$lib/vector/dash.svg";
    let { children } = $props();

    onMount(async () => {
        const loaded = await window.electron.getConfig();
        config.fileHandling = loaded.fileHandling;
        config.format = loaded.format;
    });
</script>

<main>
    <section class="sidebar">
        <div class="drag">
            <img class="icon" src="" />
            <h1>ReDate</h1>
        </div>
        <a class="item" href="/settings" class:active={$page.url.pathname === "/settings"}>
            <img class="icon" src={gear} />
            <p>General</p>
        </a>
        <a class="item" href="/settings/files" class:active={$page.url.pathname === "/settings/files"}>
            <img class="icon" src={drive} />
            <p>File handling</p>
        </a>
    </section>
    <section class="content">
        <header>
            <div class="controls-windows">
                <button onclick={() => window.electron.minimize("settings")}> <img src={dash} alt="Minimize" /> </button>
                <button onclick={() => window.electron.close("settings")}> <img src={close} alt="Close" /> </button>
            </div>
        </header>
        <div class="page">
            {@render children?.()}
        </div>
    </section>
</main>

<style lang="scss">
    @use "$lib/styles/variables.scss" as *;
    $titlebar-height: 32px;
    main {
        display: flex;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        flex-grow: 1;
        font-family: "Inter", sans-serif;
        overflow: hidden;
        .sidebar {
            min-width: 200px;
            background-color: $layer-0;
            padding: 10px;
            border-right: 1px solid $layer-1-solid;
            display: flex;
            flex-direction: column;
            view-transition-name: settings-sidebar;
            box-sizing: border-box;
            .drag {
                width: 100%;
                -webkit-app-region: drag;
                display: flex;
                align-items: center;
                padding-left: 10px;
                gap: 10px;
                img.icon {
                    width: 30px;
                    height: 30px;
                    background-color: $layer-2-solid;
                    border-radius: 10px;
                }
                h1 {
                    font-size: 20px;
                }
            }
            .item {
                width: 100%;
                padding: 10px;
                box-sizing: border-box;
                border-radius: 10px;
                font-size: 14px;
                color: white;
                text-decoration: none;

                display: flex;
                align-items: center;
                gap: 10px;
                transition: background-color 0.1s;
                border: 1px solid transparent;
                p {
                    margin: 0;
                }

                &.active {
                    background-color: $layer-1;
                    border: 1px solid $layer-2;
                    box-sizing: border-box;
                }
            }
        }

        .content {
            width: 100%;
            height: 100%;
            position: relative;

            header {
                position: absolute;
                -webkit-app-region: drag;
                width: 100%;
                min-height: $titlebar-height;
                view-transition-name: settings-header;

                .controls-windows {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;

                    button {
                        -webkit-app-region: no-drag;
                        height: $titlebar-height;
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

            .page {
                height: 100%;
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                padding: 10px;
                padding-top: $titlebar-height + 10px;
                overflow-y: auto;

                :global(h1) {
                    margin-top: 0;
                }
                :global(p.label) {
                    margin: 0;
                    color: $text-secondary;
                    font-size: 14px;
                    margin-bottom: 5px;
                    margin-left: 5px;
                }
                :global(.container) {
                    background-color: $layer-1;
                    border: 1px solid $layer-2;
                    padding: 10px;
                    border-radius: 10px;
                }
            }
        }
    }

    :root::view-transition-old(root) {
        animation:
            90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
            300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
    }

    :root::view-transition-new(root) {
        animation:
            210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
            300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
    }
</style>
