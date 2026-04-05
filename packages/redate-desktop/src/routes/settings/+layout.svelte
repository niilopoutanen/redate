<script>
    import { page } from "$app/stores";
    import drive from "$lib/vector/drive.svg";
    import gear from "$lib/vector/gear.svg";
    import menu from "$lib/vector/menu.svg";
    import close from "$lib/vector/close.svg";
    import dash from "$lib/vector/dash.svg";
    import icon from "$lib/assets/icon.png";
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { onMount } from "svelte";

    import "$lib/styles/settings.scss";
    let { children } = $props();
    let version = $state("");

    $effect(() => {
        console.log($page.url.pathname);
    });

    let isMac = $derived(() => {
        if (typeof window === "undefined") return false;
        return window.electron.isMac();
    });

    onMount(async () => {
        if (typeof window === "undefined") return "";
        const returned = await window.electron.getVersion();
        console.log(returned);
        version = "v " + returned;
    });
</script>

<main>
    <section class="sidebar" class:mac={isMac}>
        <div class="drag">
            <img class="icon" src={resolve("/icon.png")} alt="ReDate" />
            <h1>ReDate</h1>
        </div>
        <a class="item" href={resolve("/settings")} class:active={$page.url.pathname == "/settings/"}>
            <img class="icon" src={gear} alt="General settings" />
            <p>General</p>
        </a>
        <a class="item" href={resolve("/settings/files")} class:active={$page.url.pathname == "/settings/files/"}>
            <img class="icon" src={drive} alt="File handling settings" />
            <p>Rename format</p>
        </a>
        <p class="version">{version}</p>
    </section>
    <section class="content">
        <header>
            {#if !isMac}
                <div class="controls-windows">
                    <button onclick={() => window.electron.minimize("settings")}> <img src={dash} alt="Minimize" /> </button>
                    <button onclick={() => window.electron.close("settings")}> <img src={close} alt="Close" /> </button>
                </div>
            {/if}
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
        background-color: $layer-0;
        .sidebar {
            min-width: 200px;
            background-color: $layer-1;
            padding: 10px;
            border-right: 1px solid $layer-2;
            display: flex;
            flex-direction: column;
            view-transition-name: settings-sidebar;
            box-sizing: border-box;
            transition: min-width 0.2s ease;

            &.mac{
                padding-top: 30px;
            }
            .drag {
                width: 100%;
                -webkit-app-region: drag;
                display: flex;
                align-items: center;
                padding-left: 5px;
                gap: 10px;
                margin-top: 5px;
                margin-bottom: 20px;
                img.icon {
                    width: 50px;
                    height: 50px;
                    background-color: $layer-2;
                    border-radius: 10px;
                }
                h1 {
                    font-size: 20px;
                    margin: 0;
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
                    white-space: nowrap;
                }

                &.active {
                    background-color: $layer-2;
                    border: 1px solid $layer-3;
                    box-sizing: border-box;
                }
            }

            .version {
                margin-top: auto;
                color: $text-secondary;
                margin-bottom: 0;
                font-size: 12px;
            }

            @media (max-width: 450px) {
                min-width: 70px;
                width: 70px;

                .drag {
                    padding: 0;
                }
                .drag h1 {
                    display: none;
                }
                .item {
                    width: 100%;
                    justify-content: center;
                    p {
                        display: none;
                    }
                }
            }
        }

        .content {
            width: 100%;
            height: 100%;
            position: relative;
            overflow-y: scroll;
            header {
                position: fixed;
                left: 0;
                top: 0;
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
                height: auto;
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                padding: 15px;
                padding-top: $titlebar-height + 10px;

                :global(.header) {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 30px;
                    gap: 5px;
                }

                :global(.header h1) {
                    margin: 0;
                }
                :global(.header .desc) {
                    color: $text-secondary;
                    font-size: 14px;
                    margin: 0;
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
