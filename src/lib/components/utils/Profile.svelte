<script lang="ts">
    import closeIcon from "$lib/assets/close.svg?raw";
    import {
        isLoggedin,
        preferences,
        profile,
        updatePreferences,
    } from "$lib/scripts/stores";
    import { signUserOut } from "$lib/scripts/utils";
    import { goto } from "$app/navigation";
    import ToggleButton from "./ToggleButton.svelte";
    import { onDestroy } from "svelte";
    import ColorScheme from "./ColorScheme.svelte";

    let showFileNames = false;

    const unsubscribePreferences = preferences.subscribe((val) => {
        showFileNames = val?.showFileNames;
    });

    async function signoutHandler() {
        profile.set(false);
        isLoggedin.set(false);
        await signUserOut();
        goto("/");
    }
    onDestroy(() => {
        window.localStorage.setItem(
            "preferences",
            JSON.stringify($preferences)
        );
        unsubscribePreferences();
    });
</script>

<div class="profile" on:wheel|stopPropagation|preventDefault>
    <div class="container">
        <section class="one">
            <h2>Settings</h2>
            <button class="btn s-prime" on:click={() => ($profile = false)}
                >{@html closeIcon}</button
            >
        </section>
        <section class="two">
            <ul>
                <li>
                    <div>Display filenames</div>
                    <button
                        on:click={() =>
                            updatePreferences({
                                showFileNames: !showFileNames,
                            })}
                    >
                        <ToggleButton bool={showFileNames} />
                    </button>
                </li>
            </ul>
        </section>
        <section class="three">
            <div class="scheme">
                <ColorScheme />
            </div>
            <button class="logout" on:click={signoutHandler}>Logout</button>
        </section>
    </div>
</div>

<style>
    .profile {
        font-size: var(--size-smaller);
        position: fixed;
        margin: auto;
        width: 100%;
        height: 100vh;
        z-index: 1;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;
        background-color: #0005;
        background-color: var(--color-backdrop);
    }
    .container {
        display: flex;
        flex-flow: column nowrap;
        width: 40rem;
        height: 50%;
        border-radius: 1rem;
        box-shadow: 0 0 50px -10px #000;
        background-color: var(--color-bg-one);
    }
    ul {
        display: flex;
        flex-flow: column;
        gap: 1rem;
    }

    li {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .one {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        /* border-bottom: 1px solid var(--color-border); */
        padding: 1rem;
    }

    .two {
        flex: 1;
        padding: 1rem;
    }

    .three {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
    }

    .scheme {
        margin: 0rem 2rem;
    }

    .logout {
        width: 100%;
        padding: 1rem;
        background-color: var(--color-bg-two);
    }
    .logout:hover {
        background-color: var(--color-bg-three);
    }

    h2 {
        font-size: var(--size-medium);
        font-weight: 900;
    }

    @media (max-width: 600px) {
        .profile {
            bottom: 0;
            justify-content: end;
        }
        .container {
            border-bottom: none;
            width: 100%;
            border-bottom-left-radius: unset;
            border-bottom-right-radius: unset;
            transform: perspective(50px);
        }
    }
</style>
