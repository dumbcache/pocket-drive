<script lang="ts">
    import closeIcon from "$lib/assets/close.svg?raw";
    import ColorScheme from "$lib/components/utils/ColorScheme.svelte";
    import Options from "$lib/components/profile/Options.svelte";
    import Logout from "$lib/components/profile/Logout.svelte";
    import SessionInfo from "$lib/components/profile/SessionInfo.svelte";
    import { states } from "$lib/scripts/state.svelte";
</script>

<div class="profile">
    <div class="container">
        <section class="one">
            <h2>Settings</h2>
            <button class="btn s-prime" onclick={() => (states.profile = false)}
                >{@html closeIcon}</button
            >
        </section>
        <section class="two">
            <Options />
        </section>
        <section class="three">
            {#key states.sessionTimeoutId}
                <SessionInfo />
            {/key}
        </section>
        <section class="four">
            <div class="scheme">
                <ColorScheme />
            </div>
            <Logout />
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
        background-color: var(--color-backdrop);
    }
    .container {
        display: flex;
        flex-flow: column nowrap;
        width: 40rem;
        height: 50%;
        border-radius: 1rem;
        box-shadow: 0 0 50px -10px var(--color-black);
        background-color: var(--color-bg-one);
    }

    .one {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        padding: 2rem 2rem 1rem 2rem;
    }

    .two {
        flex: 1;
        padding: 1rem 2rem;
    }

    .four {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        /* border-top: 1px solid var(--color-border); */
    }

    .scheme {
        padding: 0rem 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        /* border-right: 1px solid var(--color-border); */
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
            height: 60%;
            border-bottom-left-radius: unset;
            border-bottom-right-radius: unset;
            transform: perspective(50px);
        }
        .scheme {
            padding: 0rem 1.5rem;
        }
    }
</style>
