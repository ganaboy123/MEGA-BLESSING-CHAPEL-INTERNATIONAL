// Sermon YouTube 3-minute preview timer
// Uses YouTube IFrame API to detect playback time and show overlay after 3 minutes

const PREVIEW_LIMIT = 180; // 3 minutes in seconds

function onYouTubeIframeAPIReady() {
    document.querySelectorAll("[data-yt-card]").forEach((card) => {
        const iframe = card.querySelector(".sermon-yt-iframe");
        const overlay = card.querySelector("[data-overlay]");
        const watchBtn = card.querySelector("[data-watch-btn]");
        const videoId = iframe.dataset.ytId;
        const fullUrl = iframe.dataset.fullUrl;

        if (!videoId) return;

        // Set watch full message link
        if (watchBtn) watchBtn.href = fullUrl;

        const player = new YT.Player(iframe, {
            videoId,
            playerVars: {
                rel: 0,
                modestbranding: 1,
                enablejsapi: 1,
            },
            events: {
                onStateChange: (e) => {
                    if (e.data === YT.PlayerState.PLAYING) {
                        startTimer(player, overlay);
                    }
                },
            },
        });
    });
}

function startTimer(player, overlay) {
    const interval = setInterval(() => {
        const time = player.getCurrentTime();
        if (time >= PREVIEW_LIMIT) {
            player.pauseVideo();
            overlay.hidden = false;
            clearInterval(interval);
        }
    }, 1000);
}

// Load YouTube IFrame API
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);
