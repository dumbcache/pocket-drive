<script lang="ts">
    import scrollDownIcon from "$lib/assets/arrowLeftDouble.svg?raw";

    let scrollPosition = window.scrollY;
    let delta = 0;
    let isScrolling = false;
    let scrollTimeout: number;

    function handleScroll(e) {
        let currentScrollPosition = window.scrollY;
        delta = currentScrollPosition - scrollPosition;
        scrollPosition = currentScrollPosition;
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 1500);
    }
</script>

<svelte:window on:scroll={handleScroll} />

<button
    class="scroll btn s-prime"
    class:up={delta < 0}
    class:down={delta > 0}
    style:display={isScrolling ? "initial" : "none"}
    on:click={() => {
        delta > 0
            ? window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "instant",
              })
            : window.scrollTo({
                  top: 0,
                  behavior: "instant",
              });
    }}>{@html scrollDownIcon}</button
>

<style>
    .down {
        rotate: -90deg;
    }
    .up {
        rotate: 90deg;
    }
    .scroll {
        position: fixed;
        bottom: 5rem;
        right: 5rem;
        border-radius: 50%;
        box-sizing: content-box;
        background: none;
        padding: 1rem;
    }
    .scroll :global(svg) {
        border-radius: 50%;
        background-color: var(--color-bg-one);
    }
    @media (max-width: 600px) {
        .scroll {
            right: 2rem;
            bottom: 2rem;
        }
    }
</style>
