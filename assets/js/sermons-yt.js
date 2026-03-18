const PREVIEW_LIMIT = 180; // 3 minutes in seconds

function onYouTubeIframeAPIReady() {
    document.querySelectorAll("[data-yt-card]").forEach((card) => {
        const iframe = card.querySelector(".sermon-yt-iframe");
        const watchBtn = card.querySelector("[data-watch-btn]");
        const videoId = iframe.dataset.ytId;
        const fullUrl = iframe.dataset.fullUrl;

        if (!videoId) return;

        if (watchBtn && fullUrl) watchBtn.href = fullUrl;

        let timer = null;
        let shown = false;

        const player = new YT.Player(iframe, {
            videoId,
            playerVars: { rel: 0, modestbranding: 1, enablejsapi: 1 },
            events: {
                onStateChange(e) {
                    if (e.data === YT.PlayerState.PLAYING && !shown) {
                        timer = setInterval(() => {
                            if (player.getCurrentTime() >= PREVIEW_LIMIT) {
                                clearInterval(timer);
                                shown = true;
                                if (watchBtn) watchBtn.hidden = false;
                            }
                        }, 1000);
                    }
                    if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
                        clearInterval(timer);
                    }
                },
            },
        });
    });
}

// Load YouTube IFrame API
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);
