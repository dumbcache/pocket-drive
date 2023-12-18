<script lang="ts">
    import Nav from "$lib/components/Nav.svelte";
    import Header from "$lib/components/Header.svelte";
    import { navigating } from "$app/stores";
    import LoadIndicator from "$lib/components/actions/LoadIndicator.svelte";
    import Preview from "$lib/components/Preview.svelte";
    import Drop from "$lib/components/Drop.svelte";
    import {
        previewAndSetDropItems,
        updateRecents,
        shortcutHandler,
        dropOkHandler,
    } from "$lib/scripts/utils";
    import { signUserOut } from "$lib/scripts/shared/utils";
    import {
        autosave,
        dropFull,
        dropMini,
        editMode,
        mode,
        previewItem,
        refreshClicked,
        sessionTimeout,
        shortcuts,
    } from "$lib/scripts/stores";
    import BackButton from "$lib/components/actions/BackButton.svelte";
    import { onMount } from "svelte";
    import Search from "$lib/components/actions/Search.svelte";
    import Confirm from "$lib/components/actions/Confirm.svelte";
    import { goto } from "$app/navigation";
    import Move from "$lib/components/actions/Move.svelte";
    import EditUrl from "$lib/components/actions/EditUrl.svelte";
    import Shortcuts from "$lib/components/Shortcuts.svelte";
    import View from "$lib/components/View.svelte";
    import {
        checkRefreshTimeout,
        checkSessionTimeout,
    } from "$lib/scripts/shared/utils";
    import { googleClient } from "$lib/scripts/login";
    let draggedOver = false;
    export function imgDropHandler(e: DragEvent) {
        e.preventDefault();
        draggedOver = false;
        $dropMini = false;
        previewItem.set(undefined);
        if (e.dataTransfer?.files) {
            previewAndSetDropItems(e.dataTransfer.files);
        }
        if ($autosave) dropOkHandler();
    }
    onMount(() => {
        try {
            updateRecents();
            checkSessionTimeout();
            checkRefreshTimeout();
            $refreshClicked = false;
        } catch (error) {
            console.warn(error);
        }
    });
</script>

<svelte:window
    on:offline={() => {
        window.alert("You're offline");
    }}
    on:keydown={shortcutHandler}
/>

<div class="layout">
    <Header />
    {#if $navigating}
        <div class="loading">
            <LoadIndicator />
        </div>
    {:else}
        <main
            class="main {draggedOver === true ? 'dragover' : ''}"
            on:dragstart
            on:dragover|preventDefault
            on:dragenter={() => (draggedOver = true)}
            on:dragleave={() => (draggedOver = false)}
            on:drop={imgDropHandler}
        >
            <div class="content {$dropFull === true ? 'content-hidden' : ''}">
                {#if !$editMode}
                    <div class="nav">
                        <Nav />
                    </div>
                {/if}
                {#if !$editMode}
                    <div class="back">
                        <BackButton />
                    </div>
                {/if}
                {#if $mode === "search"}
                    <div class="search">
                        <Search />
                    </div>
                {/if}
                {#if $mode === "move"}
                    <Move />
                {/if}
                {#if $mode === "edit"}
                    <EditUrl />
                {/if}
                {#if $shortcuts}
                    <Shortcuts />
                {/if}
                <slot />
            </div>
            <Preview />
            <Drop />
            <!-- <View /> -->
            {#if $sessionTimeout}
                <Confirm
                    text={"Session timeout. You want to continue?"}
                    closeOnClick={false}
                    on:confirmCloseNO={() => {
                        signUserOut();
                        goto("/");
                    }}
                    on:confirmCloseOK={() => {
                        googleClient.requestToken();
                    }}
                />
            {/if}
        </main>
    {/if}
</div>

<style>
    .layout {
        display: flex;
        background-color: inherit;
    }
    .main {
        background-color: inherit;
        display: flex;
        width: 100%;
        min-height: 100vh;
    }
    .back {
        position: sticky;
        top: 1.5rem;
        z-index: 1;
    }
    .search {
        max-width: 30rem;
        margin: auto;
        position: sticky;
        top: 1.5rem;
        z-index: 1;
    }
    .content {
        background-color: inherit;
        width: 100%;
    }
    .content-hidden {
        display: none;
    }
    .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .dragover {
        background-color: #55f5;
    }
    .nav {
        background-color: inherit;
        display: none;
        z-index: 1;
    }
    @media (max-width: 800px) {
        .main :global(.preview),
        .main :global(.drop) {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            border: none;
            max-width: 100%;
        }
    }
    @media (max-width: 600px) {
        .main {
            min-height: initial;
        }
        .search {
            top: 5rem;
            max-width: 80%;
        }
        .nav {
            display: initial;
        }
        .back {
            display: none;
        }
        .layout {
            display: initial;
        }
    }
</style>
