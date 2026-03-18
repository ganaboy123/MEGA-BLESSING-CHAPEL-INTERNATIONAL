import { scriptures } from "./scriptures.js";

const DAILY_KEY = "mbci-daily-verse-v1";
const TOAST_MS = 2200;

const qs = (sel, parent = document) => parent.querySelector(sel);

const todayIso = () => new Date().toISOString().slice(0, 10);

const safeJson = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const loadDaily = () => safeJson(localStorage.getItem(DAILY_KEY), null);

const saveDaily = (payload) => {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
};

const pickRandomIndex = (count, excludedIndex) => {
  if (count <= 1) return 0;
  let idx = Math.floor(Math.random() * count);
  while (idx === excludedIndex) idx = Math.floor(Math.random() * count);
  return idx;
};

const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
};

const spawnConfetti = (container, x, y) => {
  const count = 18;
  for (let i = 0; i < count; i += 1) {
    const p = document.createElement("span");
    p.className = "inspire-confetti";
    const drift = (Math.random() * 170 - 85).toFixed(1);
    const rotate = (Math.random() * 520 - 260).toFixed(1);
    const delay = (Math.random() * 80).toFixed(0);
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.setProperty("--drift-x", `${drift}px`);
    p.style.setProperty("--rotate", `${rotate}deg`);
    p.style.animationDelay = `${delay}ms`;
    container.appendChild(p);
    setTimeout(() => p.remove(), 1050 + delay);
  }
};

const buildParticles = (wrap) => {
  const count = 14;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const p = document.createElement("span");
    p.className = "inspire-particle";
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.setProperty("--dur", `${6 + Math.random() * 6}s`);
    p.style.setProperty("--delay", `${-(Math.random() * 6)}s`);
    frag.appendChild(p);
  }
  wrap.appendChild(frag);
};

export const initInspireMe = () => {
  const section = qs("#inspire-me");
  if (!section) return;

  const trigger = qs("#inspire-trigger", section);
  const card = qs("#inspire-card", section);
  const verseEl = qs("#inspire-verse", section);
  const refEl = qs("#inspire-reference", section);
  const messageEl = qs("#inspire-message", section);
  const shareBtn = qs("#inspire-share", section);
  const toast = qs("#inspire-toast", section);
  const audio = qs("#inspire-audio", section);
  const audioToggle = qs("#inspire-audio-toggle", section);
  const particles = qs(".inspire-particles", section);
  const head = qs(".inspire-head", section);

  if (!trigger || !card || !verseEl || !refEl || !messageEl || !shareBtn || !toast || !audio || !audioToggle) return;

  if (particles) buildParticles(particles);

  let lastIndex = -1;
  let usedDailyFirst = false;
  let currentItem = null;
  let confettiDone = false;
  let toastTimer = null;
  let ticking = false;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        section.classList.add("is-visible");
        revealObserver.unobserve(section);
      });
    },
    { threshold: 0.18 }
  );
  revealObserver.observe(section);

  const updateToast = (show) => {
    if (!toast) return;
    if (show) {
      toast.hidden = false;
      toast.classList.add("is-show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove("is-show");
        setTimeout(() => {
          toast.hidden = true;
        }, 220);
      }, TOAST_MS);
      return;
    }
    toast.classList.remove("is-show");
    toast.hidden = true;
  };

  const renderWord = (item) => {
    card.classList.remove("is-visible", "is-revealing");
    if (card.hidden) card.hidden = false;
    requestAnimationFrame(() => {
      verseEl.textContent = item.verse;
      refEl.textContent = item.reference;
      messageEl.textContent = item.message;
      card.classList.add("is-visible", "is-revealing");
      setTimeout(() => card.classList.remove("is-revealing"), 880);
    });
  };

  const getWordIndex = () => {
    const todaysDate = todayIso();
    if (!usedDailyFirst) {
      const cached = loadDaily();
      if (cached && cached.date === todaysDate && Number.isInteger(cached.index) && cached.index >= 0 && cached.index < scriptures.length) {
        usedDailyFirst = true;
        return cached.index;
      }
      const idx = pickRandomIndex(scriptures.length, lastIndex);
      saveDaily({ date: todaysDate, index: idx });
      usedDailyFirst = true;
      return idx;
    }
    return pickRandomIndex(scriptures.length, lastIndex);
  };

  const inspire = () => {
    const idx = getWordIndex();
    const item = scriptures[idx];
    if (!item) return;
    lastIndex = idx;
    currentItem = item;
    renderWord(item);
  };

  const ripple = (event) => {
    const rect = trigger.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const r = document.createElement("span");
    r.className = "inspire-ripple";
    r.style.left = `${x}px`;
    r.style.top = `${y}px`;
    trigger.appendChild(r);
    setTimeout(() => r.remove(), 520);
    if (!confettiDone) {
      const secRect = section.getBoundingClientRect();
      spawnConfetti(section, event.clientX - secRect.left, event.clientY - secRect.top);
      confettiDone = true;
    }
  };

  trigger.addEventListener("click", (event) => {
    ripple(event);
    inspire();
  });

  shareBtn.addEventListener("click", async () => {
    if (!currentItem) return;
    const text = `${currentItem.verse} — ${currentItem.reference}\n${currentItem.message}`;
    try {
      await copyText(text);
      updateToast(true);
    } catch {
      updateToast(false);
    }
  });

  const setAudioState = (on) => {
    if (on) {
      audio.volume = 0.14;
      audio.play().catch(() => {});
      audioToggle.textContent = "Ambient Audio: On";
      audioToggle.setAttribute("aria-pressed", "true");
      return;
    }
    audio.pause();
    audioToggle.textContent = "Ambient Audio: Off";
    audioToggle.setAttribute("aria-pressed", "false");
  };

  audioToggle.addEventListener("click", () => {
    const isOn = audioToggle.getAttribute("aria-pressed") === "true";
    setAudioState(!isOn);
  });

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const movement = Math.max(-16, Math.min(16, rect.top * -0.045));
      if (particles) particles.style.transform = `translateY(${movement}px)`;
      if (head) head.style.transform = `translateY(${(movement * 0.32).toFixed(2)}px)`;
      ticking = false;
    });
  };

  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
};

