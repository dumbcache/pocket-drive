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
    let search = $state<HTMLInputElement>();
    let searchValue = $state("");
    let selected = $state<DriveFolder>({ id: "", name: "", parents: [] });
    let recents = $state<DriveFolder[]>([]);
    let home = getRoot();
    let list = $state<DriveFolder[]>([]);
    let tempList = $state<DriveFolder[]>([]);

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
        tempList = [...list];
    }

    async function homeTap() {
        selected = { name: "Pocket_#Drive", id: home };
        list = [];
        await setList(selected.id, getToken());
        show = true;
        search?.focus();
    }

    async function historyTap() {
        selected = recents[0];
        list = recents.slice(1);
        show = true;
        searchValue = "";
        search?.focus();
    }

    async function backTap() {
        let parent = selected.parents![0];
        let token = getToken();
        const f = await fetchSingle(parent, "FOLDER", token);
        selected = f;
        list = [];
        await setList(selected.id, token);
        show = true;
        searchValue = "";
        search?.focus();
    }

    async function itemTap(e) {
        let { id } = e.target.dataset;
        if (!id) return;
        let found = list.find((i) => i.id === id);
        if (!found) return;
        selected = found;
        list = [];
        await setList(selected.id, getToken());
        show = true;
        searchValue = "";
        search?.focus();
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

    function selectedTap() {
        show = !show;
        search?.focus();
    }

    function handle() {
        if (searchValue.length === 0) list = tempList || [];
        list = tempList?.filter((i) =>
            i.name.toLowerCase().includes(searchValue.toLowerCase())
        );
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
        tempList = folderStore.files;

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
            <button class="selected item" title="selected" onclick={selectedTap}
                >{selected.name}</button
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
                disabled={states.view === "FOLDER" &&
                    selected.id === tempStore.activeFolder.id}
                onclick={doneTap}>{@html doneIcon}</button
            >
            <!-- {#if show} -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <ul
                class="list"
                onclick={itemTap}
                style:display={show ? "initial" : "none"}
            >
                {#if list?.length > 0 || searchValue.length > 0}
                    <input
                        class="search"
                        type="search"
                        bind:this={search}
                        bind:value={searchValue}
                        onchange={handle}
                        oninput={handle}
                        onkeydown={(e) => e.stopPropagation()}
                    />
                {/if}
                {#each list as item}
                    <li class="item" data-id={item.id}>{item.name}</li>
                {/each}
            </ul>
            <!-- {/if} -->
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
        contain: content;
    }

    .wrapper {
        max-width: 30rem;
        padding: 4rem 2rem;
        border-radius: 1rem;
        display: flex;
        gap: 2rem;
        /* align-items: center; */
        box-shadow: 0 0 15px 0px var(--color-shadow);
        background-color: var(--color-popup);
    }

    nav {
        display: flex;
        flex-flow: column nowrap;
        gap: 1.5rem;
        justify-content: center;
        align-items: center;
    }

    section {
        position: relative;
        display: flex;
        flex-flow: column nowrap;
        gap: 2rem;
        width: 25rem;
    }

    .selected {
        padding: 1rem;
        padding-right: 3rem;
        width: 100%;
        background-color: var(--color-bg-one);
        filter: invert(0.1);
        border-radius: 0.5rem;
    }

    .list {
        background-color: var(--color-bg-one);
        filter: invert(0.1);
        max-height: 21rem;
        width: 100%;
        position: absolute;
        top: 7.7rem;
        left: 0rem;
        overflow-x: hidden;
        overflow-y: scroll;
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
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
        background-color: var(--color-lite);
    }

    .done,
    .history {
        position: absolute;
        right: 0;
    }

    .done {
        top: 60%;
    }
    .history {
        top: 0%;
        padding: 0.2rem;
    }
    .done :global(svg) {
        fill: var(--color-focus);
    }
    .done:disabled :global(svg) {
        fill: var(--color);
    }

    .search {
        width: 100%;
        padding: 1rem 0rem 1rem 1rem;
        outline: none;
        border: none;
        border-bottom: 1px solid var(--color-focus);
    }
    .search:focus {
        border-bottom: 2px solid var(--color-focus);
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
    }
    @media (max-width: 600px) {
        section {
            width: 20rem;
        }
        .done {
            top: 60%;
        }
        .history {
            padding: 0rem;
        }
    }
</style>
