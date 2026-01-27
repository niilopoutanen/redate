<script>
    import { onMount } from "svelte";

    let droparea;

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
            if (e != null && e.dataTransfer != null) {
                let jsonArray = [];
                console.log(e.dataTransfer.files);
                for (const file of e.dataTransfer.files) {
                    jsonArray.push(window.electron.showFilePath(file));
                }
                window.electron.setFileCache(jsonArray);
            }
        });
    });
</script>

<div class="droparea" bind:this={droparea}>
    <p>Drop files or <br /> folders here</p>
</div>

<style lang="scss">
    @use "$lib/styles/variables.scss" as *;

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