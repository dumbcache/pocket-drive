<script lang="ts">
    import { onMount } from "svelte";

    let timeRemaining = $state("00:00");

    function formatTime(ms) {
        let totalSeconds = Math.floor(ms / 1000);
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        return `${minutes.toString().padStart(2, "0")}m : ${seconds.toString().padStart(2, "0")}s`;
    }
    function updateRemainingTime(sessionTimestamp: number) {
        let now = Date.now();
        let timeDiff = sessionTimestamp - now;

        if (timeDiff <= 0) {
            timeRemaining = "00:00";
        } else {
            timeRemaining = formatTime(timeDiff);
        }
    }

    onMount(() => {
        let sessionTimestamp = Number(
            window.localStorage.getItem("sessionTime")
        );
        if (sessionTimestamp) {
            updateRemainingTime(sessionTimestamp);

            let interval = setInterval(() => {
                updateRemainingTime(sessionTimestamp);
                if (timeRemaining === "00:00") {
                    clearInterval(interval);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    });
</script>

<div>
    Session Expires in {timeRemaining}
</div>

<style>
    div {
        padding: 1rem;
        text-align: center;
        color: var(--color-two);
    }
</style>
