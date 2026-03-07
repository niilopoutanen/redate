<script>
    import { TOKENS } from "redate-cli/defaults";
    let formatInput = null;
    const now = new Date();
    let previewText = "";

    function insertToken(tokenKey) {
        const token = `{${tokenKey}}`; // wrap token
        const start = formatInput.selectionStart;
        const end = formatInput.selectionEnd;
        const value = formatInput.value;
        formatInput.value = value.slice(0, start) + token + value.slice(end);
        formatInput.setSelectionRange(start + token.length, start + token.length);
        updatePreview();
        formatInput.focus();
    }

    function updatePreview() {
        if (!formatInput) return;
        let value = formatInput.value;

        // Replace only wrapped tokens
        Object.entries(TOKENS).forEach(([key, token]) => {
            const regex = new RegExp(`\\{${key}\\}`, "g");
            value = value.replace(regex, token.value(now));
        });

        previewText = value + ".jpg";
    }
</script>

<div class="formatbuilder">
    <p class="label">Available blocks:</p>
    <div class="available">
        {#each Object.entries(TOKENS) as [key, token]}
            <button class="block input" on:click={() => insertToken(key)}>
                <p class="value">{token.value(now)}</p>
                <p class="desc">{token.desc}</p>
            </button>
        {/each}
    </div>

    <p class="label">Preview:</p>
    <div class="preview input" class:empty={previewText == ""}>
        <p>
            {#if previewText}
                {previewText}
            {:else}
                Start adding blocks
            {/if}
        </p>
    </div>

    <div class="controls">
        <input type="text" class="input" bind:this={formatInput} on:input={updatePreview} placeholder="Edit format here" />
        <button class="save input">Save</button>
        <button class="input">Reset</button>
    </div>
</div>

<style lang="scss">
    @use "$lib/styles/variables.scss" as *;

    .formatbuilder {
        display: flex;
        flex-direction: column;
        gap: 10px;
        input {
            padding: 10px;
        }

        .available {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            button.block {
                display: flex;
                flex-direction: column;
                cursor: pointer;
                p {
                    margin: 0;
                }
                .value {
                    font-weight: 600;
                    font-size: 16px;
                }
                .desc {
                    color: $text-secondary;
                    font-size: 12px;
                }

                &:hover{
                    background-color: $layer-2;
                }
            }
        }
        .preview{
            font-size: 13px;

            &.empty{
                color: $text-secondary;
            }
        }
        .controls {
            display: flex;
            gap: 10px;

            button {
                padding: 10px 15px;
                cursor: pointer;
                &.save {
                    background-color: $accent;
                    border: 1px solid $accent;
                }
            }
        }
    }
</style>
