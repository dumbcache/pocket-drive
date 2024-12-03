<script lang="ts">
    import {
        HOME_PATH,
        pocketStore,
        tempStore,
    } from "$lib/scripts/stores.svelte";
    import {
        fetchMultiple,
        FOLDER_MIME_TYPE,
        getRoot,
        toTitleCase,
        updateFolder,
    } from "$lib/scripts/utils";
    import homeIcon from "$lib/assets/home.svg?raw";
    import { getToken } from "$lib/scripts/login";

    let inputElement: HTMLInputElement;

    async function change() {
        let token = getToken();
        const data = await updateFolder(
            toTitleCase(inputElement.value),
            tempStore.activeFolder.id,
            token
        );
        inputElement.blur();
        if (data?.name) {
            tempStore.activeFolder.name = data.name;
            pocketStore.delete(tempStore.activeFolder.parents[0]);
            fetchMultiple(
                {
                    parent: tempStore?.activeFolder?.parents[0],
                    mimeType: FOLDER_MIME_TYPE,
                },
                token,
                true
            );
        }
    }
</script>

{#if tempStore.activeFolder?.name}
    <div class="crumbs">
        <a class="path" href={HOME_PATH}>
            <span class="icon s-second">
                {@html homeIcon}
            </span>
            <span>Home</span>
        </a>
        {#if tempStore.activeFolder?.id !== getRoot()}
            {#if tempStore.activeFolder?.parents[0] !== getRoot()}
                <span>/</span>
                <!-- <button
                    class="title-sub path"
                    title="level up"
                    onclick={() => history.back()}>.....</button
                > -->
                <a
                    class="title-sub path"
                    title="level up"
                    href={tempStore.activeFolder.parents[0]}>.....</a
                >
            {/if}

            <span>/</span>
            <span class="active">
                <input
                    type="text"
                    onkeydown={(e) => {
                        e.stopPropagation();
                    }}
                    value={tempStore.activeFolder.name}
                    onchange={change}
                    bind:this={inputElement}
                />
            </span>
        {/if}
    </div>
{/if}

<style>
    .crumbs {
        display: flex;
        align-items: center;
        gap: 1rem;
        width: fit-content;
        /* font-size: 1.3rem; */
    }
    .path {
        display: flex;
        align-items: center;
    }
    .path:hover {
        color: var(--color-focus);
    }
    .path:hover :global(svg) {
        fill: var(--color-focus);
    }
    .active {
        white-space: nowrap;
    }

    input {
        background: none;
        border: none;
        width: 100%;
        max-width: 30rem;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    input:focus {
        background-color: var(--color-bg-one);
        border-bottom: 1px solid var(--color-focus);
    }
    @media (max-width: 900px) {
        .active {
            max-width: 20rem;
        }
    }

    @media (max-width: 600px) {
        .crumbs {
            font-size: 1.3rem;
        }
        .active {
            max-width: 14rem;
        }
    }
</style>
