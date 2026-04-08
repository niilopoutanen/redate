<script>
    import { TOKENS } from "redate-cli/defaults";
    import { config, updateConfig } from "$lib/state.svelte.js";
    import { DEFAULT_CONFIG } from "redate-cli/defaults";
    import { onMount } from "svelte";
    let formatInput = null;
    const now = new Date();

    let currentFormat = $state("");
    let currentFormatPreview = $state("");

    function insertToken(tokenKey) {
        const token = `<${tokenKey}>`; // wrap token
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
        currentFormatPreview = parse(formatInput.value) + ".jpg";
    }

    function parse(format) {
        const sortedTokens = Object.keys(TOKENS).sort((a, b) => b.length - a.length);

        for (const key of sortedTokens) {
            const regex = new RegExp(`<${key}>`, "g"); // use <> here as well
            format = format.replace(regex, TOKENS[key].value(now));
        }

        return format;
    }

    function resetFormat() {
        currentFormat = DEFAULT_CONFIG.cli.format;

        updateConfig("cli", "format", currentFormat);
        formatInput.value = currentFormat;
        updatePreview();
    }

    function saveFormat() {
        updateConfig("cli", "format", formatInput.value);
    }

    onMount(() => {
        currentFormat = config.cli.format;
        formatInput.value = currentFormat;
        updatePreview();
    });

    const commonFormats = ["<yyyy>-<mm>-<dd> <hh>-<min>-<ss>", "<yyyy>.<mm>.<dd> <hh>.<min>", "<dd>-<mm>-<yyyy>", "<dd>-<mm>-<yyyy> <hh>-<min>-<ss>"];
</script>

<div class="formatbuilder">
    <p class="label">Current format:</p>
    <p class="current nomargin">{currentFormatPreview}</p>

    <div class="controls">
        <input type="text" class="input" bind:this={formatInput} oninput={updatePreview} placeholder="Edit format here" />
        <button class="save input" onclick={() => saveFormat()}>Save</button>
        <button class="input" onclick={() => resetFormat()}>Reset</button>
    </div>
    <p class="label">Available blocks:</p>
    <div class="available container">
        {#each Object.entries(TOKENS) as [key, token]}
            <button class="block input" onclick={() => insertToken(key)}>
                <p class="value key">{key}</p>
                <p class="value now">{token.value(now)}</p>
                <p class="desc">{token.desc}</p>
            </button>
        {/each}
    </div>

    <p class="label">Common formats:</p>
    <div class="common">
        {#each commonFormats as format}
            <button
                class="button"
                title="Click to use this format"
                onclick={() => {
                    formatInput.value = format;
                    updatePreview();
                }}
            >
                <p class="value now">{parse(format)}</p>
                <p class="value key">{format}</p>
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
            justify-content: start;
            
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
                    transition: opacity 0.2s ease;
                }

                .value.now {
                    opacity: 0;
                    position: absolute;
                }

                .desc {
                    color: $text-secondary;
                    font-size: 12px;
                }

                &:hover {
                    background-color: $layer-3;

                    .value.now {
                        opacity: 1;
                    }

                    .value.key {
                        opacity: 0;
                    }
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

            input {
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

        .common {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 10px;

            button {
                background-color: $layer-1;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                .value.now{
                    font-weight: 600;
                    font-size: 16px;
                }

                .value.key {
                    color: $text-secondary;
                    font-size: 12px;
                }
            }
        }
    }
</style>
