<script>
</script>

<div class="shortcuts" on:click={() => {}} on:keydown>
    <ul on:keydown on:click|stopPropagation>
        <li>
            <span class="l">s</span>:<span class="r"
                >search in present folder</span
            >
        </li>
        <li>
            <span class="l">shift + s</span>:<span class="r"
                >search globally</span
            >
        </li>
        <li>
            <span class="l">e</span>:<span class="r">create folder</span>
        </li>
        <li>
            <span class="l">e</span>:<span class="r">edit url (edit mode)</span>
        </li>
        <li>
            <span class="l">c</span>:<span class="r"
                >move images (edit mode)</span
            >
        </li>
        <li>
            <span class="l">shift + e</span>:<span class="r"
                >toggle edit mode</span
            >
        </li>
        <li>
            <span class="l">a</span>:<span class="r"
                >toggle drop mini (During upload)</span
            >
        </li>
        <li>
            <span class="l">delete</span>:<span class="r"
                >delete images (Edit mode)</span
            >
        </li>
        <li>
            <span class="l">shift + r</span>:<span class="r"
                >reverse the list</span
            >
        </li>
        <li>
            <span class="l">alt + r</span>:<span class="r">refresh cache</span>
        </li>
        <li>
            <span class="l">shift + d</span>:<span class="r"
                >filter to Favourites</span
            >
        </li>
    </ul>
</div>

<style>
    .shortcuts {
        display: grid;
        place-content: center;
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        z-index: 5;
        background-color: var(--color-backdrop);
        backdrop-filter: blur(1rem);
        -webkit-backdrop-filter: blur(1rem);
    }
    ul {
        background-color: var(--color-backdrop);
        width: max-content;
        padding: 3rem;
    }
    li {
        list-style-type: none;
        padding-bottom: 0.5rem;
    }
    .l {
        display: inline-block;
        width: 10rem;
        max-width: 10rem;
    }
    .r {
        padding-left: 1rem;
    }

    @media (max-width: 600px) {
        .shortcuts {
            display: none;
        }
    }
</style>
