const REDIRECT_MS = 7000;
const VERSE_MS = 3000;
const EXIT_MS = 1500;

const verses = [
  { text: '"For I know the plans I have for you..."', ref: "Jeremiah 29:11" },
  { text: '"The Lord is my shepherd; I shall not want."', ref: "Psalm 23:1" },
  { text: '"Arise, shine; for your light is come..."', ref: "Isaiah 60:1" },
  { text: '"For we walk by faith, not by sight."', ref: "2 Corinthians 5:7" }
];

const q = (s, p = document) => p.querySelector(s);
const gateway = q("[data-gateway]");
const preloader = q("[data-preloader]");
const bgVideo = q("[data-bg-video]");
const scriptureText = q("[data-scripture-text]");
const scriptureRef = q("[data-scripture-ref]");
const rotator = q(".scripture-rotator");
const enterButton = q("[data-enter-button]");
const particlesWrap = q("[data-particles]");
const parallaxContent = q("[data-parallax-content]");

let verseIndex = 0;
let leaving = false;
let verseTimer = null;
let autoTimer = null;
const nextParam = new URLSearchParams(window.location.search).get("next");

const resolveTarget = () => {
  const fallback = "index.html";
  if (!nextParam) return fallback;
  const raw = decodeURIComponent(nextParam).trim();
  if (!raw || /^https?:\/\//i.test(raw) || raw.toLowerCase().includes("gateway.html")) return fallback;
  const safe = raw.replace(/^\//, "");
  if (!safe) return fallback;
  const [baseAndQuery, hashPart] = safe.split("#");
  const withFlag = baseAndQuery + (baseAndQuery.includes("?") ? "&" : "?") + "fromGateway=1";
  return withFlag + (hashPart ? "#" + hashPart : "");
};

const targetUrl = resolveTarget();

const setVerse = (i) => {
  const v = verses[i % verses.length];
  if (!v || !scriptureText || !scriptureRef || !rotator) return;
  rotator.classList.add("is-switching");
  setTimeout(() => {
    scriptureText.textContent = v.text;
    scriptureRef.textContent = v.ref;
    rotator.classList.remove("is-switching");
  }, 260);
};

const rotateVerses = () => {
  setVerse(verseIndex);
  verseTimer = setInterval(() => {
    verseIndex = (verseIndex + 1) % verses.length;
    setVerse(verseIndex);
  }, VERSE_MS);
};

const hidePreloader = () => {
  if (preloader) preloader.classList.add("is-hidden");
};

const initPreloader = () => {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    hidePreloader();
  };
  if (bgVideo) {
    bgVideo.addEventListener("loadeddata", finish, { once: true });
    bgVideo.addEventListener("error", finish, { once: true });
  }
  setTimeout(finish, 1600);
};

const buildParticles = () => {
  if (!particlesWrap) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 18; i += 1) {
    const p = document.createElement("span");
    p.className = "particle";
    p.style.left = `${Math.random() * 100}%`;
    p.style.setProperty("--x", `${(Math.random() * 20 - 10).toFixed(2)}px`);
    p.style.setProperty("--drift", `${(Math.random() * 36 - 18).toFixed(2)}px`);
    p.style.setProperty("--dur", `${6 + Math.random() * 7}s`);
    p.style.setProperty("--delay", `${-(Math.random() * 10).toFixed(2)}s`);
    p.style.setProperty("--op", `${(0.35 + Math.random() * 0.5).toFixed(2)}`);
    frag.appendChild(p);
  }
  particlesWrap.appendChild(frag);
};

const leaveGateway = () => {
  if (leaving) return;
  leaving = true;
  if (verseTimer) clearInterval(verseTimer);
  if (autoTimer) clearTimeout(autoTimer);
  gateway?.classList.add("is-leaving");
  setTimeout(() => {
    window.location.href = targetUrl;
  }, EXIT_MS);
};

const initAutoRedirect = () => {
  autoTimer = setTimeout(leaveGateway, REDIRECT_MS);
};

const initParallax = () => {
  if (!parallaxContent) return;
  window.addEventListener(
    "mousemove",
    (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      parallaxContent.style.transform = `translate3d(${x * 0.45}px, ${y * 0.35}px, 0)`;
    },
    { passive: true }
  );
};

const init = () => {
  buildParticles();
  initPreloader();
  rotateVerses();
  initParallax();
  initAutoRedirect();
  enterButton?.addEventListener("click", leaveGateway);
};

document.addEventListener("DOMContentLoaded", init);
