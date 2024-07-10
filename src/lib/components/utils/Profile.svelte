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

    let showFileNames = false;

    const unsubscribePreferences = preferences.subscribe((val) => {
        showFileNames = val.showFileNames;
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
            <button class="logout" on:click={signoutHandler}>Logout</button>
        </section>
    </div>
</div>

<style>
    .profile {
        font-size: 1.5rem;
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
        /* backdrop-filter: blur(5px); */
        background-color: var(--primary-backdrop-color);
    }
    .container {
        display: flex;
        flex-flow: column nowrap;
        width: 40rem;
        height: 50%;
        /* margin: 0 auto; */
        /* background-color: var(--bg-color); */
        /* border: 1px solid var(--color-outline); */
        border-radius: 0.5rem;
        /* padding: 1rem; */
        /* box-shadow: 0 0 100px 5px #000; */
        box-shadow: 0 0 50px -10px #000;
        background-color: var(--bg-color-one);
    }
    ul {
        display: flex;
        flex-flow: column;
        gap: 1rem;
    }

    li {
        display: flex;
        justify-content: space-between;
    }
    .one {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        border-bottom: 1px solid var(--color-outline);
        padding: 1rem;
    }

    .two {
        flex: 1;
        padding: 1rem;
        /* border-bottom: 1px solid var(--color-outline); */
    }

    .three {
        display: flex;
        justify-content: space-evenly;
    }
    .logout {
        width: 100%;
        padding: 1rem;
        background-color: var(--bg-color-four);
    }
    .logout:hover {
        /* color: var(--color-focus); */
        background-color: var(--bg-color-five);
    }

    h2 {
        font-size: 2.5rem;
    }

    @media (max-width: 600px) {
        .profile {
            bottom: 0;
            justify-content: end;
            /* left: 0; */
        }
        .container {
            border-bottom: none;
            width: 100%;
            border-radius: unset;
            border-top-left-radius: 1rem;
            border-top-right-radius: 1rem;
            transform: perspective(50px);
        }
    }
</style>
