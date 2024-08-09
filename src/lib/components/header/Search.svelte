<script>
    let search = $state("");

    function handleSearch(e) {
        e.stopPropagation();
    }

    function handleChange(e) {
        e.stopPropagation();
    }
</script>

<input
    type="search"
    name="search"
    id="search"
    autocomplete="off"
    placeholder="search"
    bind:value={search}
    onkeydown={(e) => e.stopPropagation()}
    oninput={handleSearch}
    onchange={handleChange}
/>

<style>
    #search {
        border: none;
        padding: 1rem;
        outline: none;
        width: 100%;
    }
</style>
