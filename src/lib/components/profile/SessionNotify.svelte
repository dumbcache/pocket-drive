<script>
    import { requestToken } from "$lib/scripts/login";
    import { signUserOut } from "$lib/scripts/utils";
    import { onMount } from "svelte";
    import { disableScrolling, enableScorlling } from "$lib/scripts/utils";

    onMount(() => {
        disableScrolling();
        return () => enableScorlling();
    });
</script>

<div class="session-notify">
    <div class="session-wrapper">
        <p>Your session has been expired. Click login to continue</p>
        <div class="button-wrapper">
            <button class="cancel" onclick={signUserOut}>cancel</button>
            <button class="login" onclick={requestToken}>login</button>
        </div>
    </div>
</div>

<style>
    .session-notify {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        display: grid;
        place-content: center;
        z-index: 100;
        font-size: var(--size-smaller);
        background-color: var(--color-backdrop);
        /* backdrop-filter: blur(0.1rem);
        -webkit-backdrop-filter: blur(0.1rem); */
    }
    .session-wrapper {
        display: flex;
        flex-flow: column;
        gap: 2rem;
        padding: 5rem;
        border-radius: 1rem;
        box-shadow: 0 0 15px 0px var(--color-shadow);
        background-color: var(--color-popup);
    }

    p {
        width: fit-content;
        margin: auto;
    }
    .button-wrapper {
        display: flex;
        gap: 1rem;
        justify-content: end;
    }
    button {
        padding: 0.5rem;
        width: 8rem;
        border-radius: 0.5rem;
        color: var(--color-white-one);
    }

    .login {
        /* background-color: hwb(180 0 35); */
        background-color: var(--color-green);
    }
    .login:hover {
        /* background-color: hwb(180 0 28); */
        background-color: var(--color-green);
        filter: brightness(0.9);
    }
    .cancel {
        /* background-color: hwb(340 0 7); */
        background-color: var(--color-red);
    }
    .cancel:hover {
        /* background-color: hwb(340 0 0); */
        background-color: var(--color-red);
        filter: brightness(0.9);
    }

    @media (max-width: 600px) {
        button {
            width: 6rem;
        }
        .session-wrapper {
            padding: 3rem;
            width: 90%;
            margin: auto;
        }
    }
</style>
