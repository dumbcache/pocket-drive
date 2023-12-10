<script lang="ts">
    import { loadGSIScript } from "$lib/scripts/utils";
    import { onMount } from "svelte";
    import { getOauthToken } from "$lib/scripts/utils";
    import googleIcon from "$lib/assets/google.png";

    // console.log($isLoggedin);
    onMount(() => {
        try {
            loadGSIScript();
        } catch (error) {
            console.warn(error);
        }
    });
</script>

<button on:click={getOauthToken} class="login"
    ><img src={googleIcon} alt="signin" /></button
>

<style>
    .login {
        block-size: 3.6rem;
        inline-size: 3.6rem;
        padding: 0.2rem;
        border-radius: 50%;
        border: 1px solid var(--theme-button-outline);
        filter: none;
        cursor: pointer;
    }
    .login:hover {
        border: none;
        outline: 1px solid #f0f;
    }
    .login:active {
        padding: 0.5rem;
    }
</style>
