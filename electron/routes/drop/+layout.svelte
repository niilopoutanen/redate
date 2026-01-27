<div class="dropwindow">
    <div class="header">
        <div class="handle" />
    </div>

    <div class="content">
        <slot />
    </div>

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
            padding: 0px 10px 0px 10px;
        }
    }

</style>