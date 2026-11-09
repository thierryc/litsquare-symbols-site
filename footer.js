// AP.CX footer integration. The unchanged renderer is pinned to version 0.1.0.
import { mountMarquee } from "./vendor/gl-marquee-0.1.0/index.js";

function initializeFooter() {
  const host = document.querySelector("#footer-marquee");
  const banner = host.closest(".footer-banner");
  const button = document.querySelector("#footer-motion");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let controller = null;
  let pausedByUser = false;
  let visible = false;
  let disposed = false;

  function destroyRenderer() {
    controller?.destroy();
    controller = null;
    delete banner.dataset.ready;
    button.hidden = true;
  }

  function mount() {
    destroyRenderer();
    if (!visible || disposed) return;
    const paused = motion.matches || pausedByUser;
    host.dataset.paused = String(paused);
    button.disabled = motion.matches;
    button.setAttribute("aria-pressed", String(paused));
    button.textContent = motion.matches ? "Reduced motion" : paused ? "Resume animation" : "Pause animation";
    try {
      const next = mountMarquee(host, {
        message: "Another Planet . Creative eXperience",
        fontFamily: '"Square Bot Sans Footer", sans-serif',
        fontWeight: 400,
        mode: "footer-banner",
        reducedMotion: paused,
      });
      controller = next;
      next.ready.then(() => {
        if (controller !== next || disposed) return;
        banner.dataset.ready = "true";
        button.hidden = false;
      }).catch(() => {
        if (controller === next) destroyRenderer();
      });
    } catch {
      // The regular HTML banner stays visible if canvas rendering is unavailable.
      destroyRenderer();
    }
  }

  function toggle() {
    if (motion.matches) return;
    pausedByUser = !pausedByUser;
    mount();
  }
  button.addEventListener("click", toggle);
  motion.addEventListener("change", mount);
  const observer = new IntersectionObserver(entries => {
    const next = entries.some(entry => entry.isIntersecting);
    if (visible === next) return;
    visible = next;
    mount();
  }, {rootMargin: "160px"});
  observer.observe(host);

  return () => {
    disposed = true;
    observer.disconnect();
    button.removeEventListener("click", toggle);
    motion.removeEventListener("change", mount);
    destroyRenderer();
  };
}

let dispose = initializeFooter();
window.addEventListener("pagehide", () => dispose());
window.addEventListener("pageshow", event => {
  if (event.persisted) dispose = initializeFooter();
});
