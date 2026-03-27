<script>
    import { TOKENS } from "redate-cli/defaults";
    import { config } from "$lib/state.svelte.js";
    import { onMount } from "svelte";
    let formatInput = null;
    const now = new Date();
    
    let currentFormat = $state("");
    let currentFormatPreview = $state("");

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

        currentFormatPreview = value + ".jpg";
    }
    function parse(format) {
        const sortedTokens = Object.keys(TOKENS).sort((a, b) => b.length - a.length);

        for (const key of sortedTokens) {
            format = format.replaceAll(key, TOKENS[key].value(now));
        }

        return format + ".jpg";
    }

    

    onMount(() => {
        currentFormat = "{yyyy}-{mm}-{dd} {hh}-{min}-{ss}";
        formatInput.value = currentFormat;
        updatePreview();
    });
</script>

<div class="formatbuilder">
    <p class="label">Current format:</p>
    <p class="current nomargin">{currentFormatPreview}</p>

    <div class="controls">
        <input type="text" class="input" bind:this={formatInput} oninput={updatePreview} placeholder="Edit format here" />
        <button class="save input">Save</button>
        <button class="input">Reset</button>
    </div>
    <p class="label">Available blocks:</p>
    <div class="available container">
        {#each Object.entries(TOKENS) as [key, token]}
            <button class="block input" onclick={() => insertToken(key)}>
                <p class="value">{token.value(now)}</p>
                <p class="desc">{token.desc}</p>
            </button>
        {/each}
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
            flex-direction: row;
            gap: 10px;
            flex-wrap: wrap;
            button.block {
                display: flex;
                flex-direction: column;
                cursor: pointer;
                transition: background-color 0.2s ease;
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

                &:hover {
                    background-color: $layer-3;
                }
            }
        }
        .preview {
            font-size: 13px;

            &.empty {
                color: $text-secondary;
            }
        }
        .controls {
            display: flex;
            gap: 10px;
            width: 100%;

            input{
                flex-grow: 1;
            }
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
