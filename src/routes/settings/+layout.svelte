<main>
    <section class="sidebar">
        <div class="drag"></div>
        <div class="item">
            <p>General</p>
        </div>
        <div class="item">
            <p>File handling</p>
        </div>
    </section>
    <section class="content">
        <header>
            <div class="controls-windows">
                <button on:click={() => window.electron.minimize()}> - </button>
                <button on:click={() => window.electron.close()}> x </button>
            </div>
        </header>
        <div class="page">
            <slot></slot>
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
        .sidebar {
            width: 200px;
            background-color: $layer-0-solid;
            padding: 10px;
            gap: 10px;
            display: flex;
            flex-direction: column;

            .drag{
                width: 100%;
                height: $titlebar-height;
                -webkit-app-region: drag;
            }
            .item {
                width: 100%;
                background-color: $layer-1-solid;
                padding: 10px;
                box-sizing: border-box;
                border-radius: 10px;
                font-size: 14px;
                p {
                    margin: 0;
                }
            }
        }

        .content {
            width: 100%;

            header {
                -webkit-app-region: drag;
                width: 100%;
                background-color: $layer-0-solid;
                min-height: $titlebar-height;

                .controls-windows {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 5px;

                    button {
                        -webkit-app-region: no-drag;
                        height: $titlebar-height;
                        aspect-ratio: 1;
                        background-color: transparent;
                        outline: none;
                        border: none;
                        transition: background-color 0.1s;

                        &:hover {
                            background-color: $layer-1-solid;
                        }
                    }
                }
            }

            .page {
                flex-grow: 1;
                display: flex;
                padding: 10px;

                :global(h1){
                    margin-top: 0;
                }
            }
        }
    }
</style>
