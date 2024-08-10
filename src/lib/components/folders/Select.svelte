<script lang="ts">
    import homeIcon from "$lib/assets/home.svg?raw";
    import backIcon from "$lib/assets/beforeNavigate.svg?raw";
    import historyIcon from "$lib/assets/history.svg?raw";
    import doneIcon from "$lib/assets/done.svg?raw";
    import { folderStore, states, tempStore } from "$lib/scripts/stores.svelte";
    import {
        disableScrolling,
        enableScorlling,
        fetchMultiple,
        fetchSingle,
        FOLDER_MIME_TYPE,
        getRoot,
        moveSingle,
    } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";

    let { onClose, onDone }: { onClose?: Function; onDone?: Function } =
        $props();

    let show = $state(false);
    let selected = $state<DriveFolder>({ id: "", name: "", parents: [] });
    let list = $state<DriveFolder[]>([]);
    let recents = $state<DriveFolder[]>([]);
    let home = getRoot();

    async function setList(parent: string, accessToken: string) {
        let pageToken = undefined;
        do {
            let res = await fetchMultiple(
                {
                    parent,
                    mimeType: FOLDER_MIME_TYPE,
                    pageSize: 500,
                    pageToken,
                },
                accessToken
            );
            if (selected.id !== parent) return;
            list.push(...res.files);
            pageToken = res.nextPageToken;
        } while (pageToken);
    }

    async function homeTap() {
        selected = { name: "Pocket_#Drive", id: home };
        list = [];
        await setList(selected.id, getToken());
    }

    async function historyTap() {
        selected = recents[0];
        list = recents.slice(1);
    }

    async function backTap() {
        let parent = selected.parents![0];
        let token = getToken();
        const f = await fetchSingle(parent, "FOLDER", token);
        selected = f;
        list = [];
        await setList(selected.id, token);
    }

    async function itemTap(e) {
        let { id } = e.target.dataset;
        if (!id) return;
        let found = list.find((i) => i.id === id);
        if (!found) return;
        selected = found;
        list = [];
        await setList(selected.id, getToken());
    }

    async function doneTap() {
        let index = recents.findIndex((i) => i.id === selected.id);
        index >= 0 && recents.splice(index, 1);
        recents.unshift(selected);
        if (onDone) onDone(selected.id);
        else move();
    }

    function closeTap() {
        if (onClose) onClose();
        else tempStore.folderAction = {};
    }

    async function move() {
        let parent = selected.id;
        states.progress = true;
        let accessToken = getToken();
        await moveSingle(parent, tempStore.folderAction.id, accessToken);
        let index = folderStore.files.findIndex(
            (i) => i.id === tempStore.folderAction.id
        );
        folderStore.files.splice(index, 1);
        try {
            fetchMultiple(
                { parent, mimeType: FOLDER_MIME_TYPE },
                accessToken,
                true
            );
            fetchMultiple(
                {
                    parent: tempStore.activeFolder!.id,
                    mimeType: FOLDER_MIME_TYPE,
                },
                accessToken,
                true
            );
            fetchMultiple(
                {
                    parent: tempStore.activeFolder!.id,
                    mimeType: FOLDER_MIME_TYPE,
                    pageSize: 500,
                },
                accessToken,
                true,
                true
            );
            tempStore.folderAction = {} as FolderAction;
            states.progress = false;
            return;
        } catch (error) {
            tempStore.folderAction = {} as FolderAction;
            states.progress = false;
        }
    }

    $effect(() => {
        if (!tempStore.activeFolder.id) return;
        selected = tempStore.activeFolder;
        list = folderStore.files;

        setTimeout(() => {
            let items = window.localStorage.getItem("recents");
            recents = JSON.parse(items);
            recents ?? (recents = []);
            disableScrolling();
        }, 0);

        return () => {
            enableScorlling();
            window.localStorage.setItem("recents", JSON.stringify(recents));
        };
    });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="popup" onclick={closeTap}>
    <div class="wrapper" onclick={(e) => e.stopPropagation()}>
        <nav>
            <button class="s-second btn" title="home" onclick={homeTap}
                >{@html homeIcon}</button
            >
            {#if selected.id !== home}
                <button class="s-second btn" title="level up" onclick={backTap}
                    >{@html backIcon}</button
                >
            {/if}
        </nav>
        <section>
            <span class="label">Select destination folder</span>
            <button
                class="selected item"
                title="selected"
                onclick={() => (show = !show)}>{selected.name}</button
            >
            {#if recents.length > 0}
                <button
                    class="btn s-second history"
                    title="recents"
                    onclick={historyTap}>{@html historyIcon}</button
                >
            {/if}
            <button
                class="btn s-second done"
                title="history"
                disabled={selected.id === tempStore.activeFolder.id}
                onclick={doneTap}>{@html doneIcon}</button
            >
            {#if show}
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <ul class="list" onclick={itemTap}>
                    {#each list as item}
                        <li class="item" data-id={item.id}>{item.name}</li>
                    {/each}
                </ul>
            {/if}
        </section>
    </div>
</div>

<style>
    .popup {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: grid;
        place-content: center;
        background-color: var(--color-backdrop);
        z-index: 1;
        font-size: var(--size-smaller);
    }

    .wrapper {
        padding: 4rem 2rem;
        border-radius: 1rem;
        display: flex;
        /* align-items: center; */
        box-shadow: 0 0 50px -10px var(--color-black);
        background-color: var(--color-bg-one);
        gap: 2rem;
    }

    nav {
        display: flex;
        flex-flow: column nowrap;
        gap: 1rem;
        justify-content: center;
        align-items: center;
    }

    section {
        position: relative;
        display: flex;
        flex-flow: column nowrap;
        gap: 1.5rem;
        width: 25rem;
    }

    .selected {
        padding: 1rem;
        padding-right: 3rem;
        width: 100%;
        background-color: var(--color-bg-two);
        border-radius: 0.5rem;
    }

    .list {
        background-color: var(--color-bg-two);
        max-height: 21rem;
        width: 100%;
        position: absolute;
        top: 7.2rem;
        left: 0rem;
        overflow-x: hidden;
        overflow-y: scroll;
    }

    li {
        padding: 1rem;
    }

    .item {
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: start;
    }
    .item:hover {
        background-color: var(--color-bg-three);
    }

    .done,
    .history {
        position: absolute;
        right: 0;
    }

    .done {
        top: 55%;
    }
    .history {
        top: 0%;
    }
    .done :global(svg) {
        fill: var(--color-green);
    }

    @media (max-width: 600px) {
        section {
            width: 20rem;
        }
        .done {
            top: 60%;
        }
    }
</style>
