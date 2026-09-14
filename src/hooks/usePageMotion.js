import { useLayoutEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/** One observer and one scroll update for the page, including new CMS/project nodes. */
export function usePageMotion(rootRef, reducedMotion) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      prevent: (node) => Boolean(node.closest("dialog")),
    });
    const registered = new Set();
    const parallax = new Set();
    const activeParallax = new Set();
    let frame = 0;
    let destroyed = false;
    let viewportHeight = window.innerHeight;
    let mobile = window.innerWidth <= 600;

    const reveal = (element) => {
      element.classList.add("is-revealed");
      revealObserver.unobserve(element);
    };
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    // Read all rectangles first, then write transforms to avoid layout thrashing.
    const update = () => {
      frame = 0;
      const measurements = [...activeParallax].map((element) => [
        element,
        element.getBoundingClientRect(),
      ]);
      measurements.forEach(([element, rect]) => {
        const progress = Math.max(
          -1,
          Math.min(
            1,
            (viewportHeight / 2 - rect.top - rect.height / 2) /
              ((viewportHeight + rect.height) / 2),
          ),
        );
        if (element.dataset.parallax === "marquee") {
          element.style.setProperty(
            "--scroll-x",
            `${progress * (mobile ? 24 : 95)}px`,
          );
        } else {
          element.style.setProperty(
            "--parallax-y",
            `${progress * (mobile ? 10 : 26)}px`,
          );
        }
      });
    };
    const schedule = () => {
      if (!frame && !destroyed) frame = requestAnimationFrame(update);
    };
    const parallaxObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeParallax.add(entry.target);
            entry.target.classList.add("is-in-view");
          } else {
            activeParallax.delete(entry.target);
            entry.target.classList.remove("is-in-view");
          }
        });
        schedule();
      },
      { rootMargin: "80px" },
    );

    const register = () => {
      root.querySelectorAll("[data-reveal]").forEach((element) => {
        if (registered.has(element)) return;
        registered.add(element);
        // Returning from a deep anchor must not leave already-passed content hidden.
        if (element.getBoundingClientRect().bottom < 0) reveal(element);
        else revealObserver.observe(element);
      });
      root.querySelectorAll("[data-parallax]").forEach((element) => {
        if (parallax.has(element)) return;
        parallax.add(element);
        parallaxObserver.observe(element);
      });
      for (const element of registered) {
        if (!root.contains(element)) {
          revealObserver.unobserve(element);
          registered.delete(element);
        }
      }
      for (const element of parallax) {
        if (!root.contains(element)) {
          parallaxObserver.unobserve(element);
          activeParallax.delete(element);
          parallax.delete(element);
        }
      }
      lenis.resize();
      schedule();
    };
    const resize = () => {
      viewportHeight = window.innerHeight;
      mobile = window.innerWidth <= 600;
      schedule();
    };
    const revealFocused = (event) => {
      const element = event.target.closest("[data-reveal]");
      if (element) reveal(element);
    };
    const mutationObserver = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.type === "childList"))
        register();
      // Stop residual scroll inertia while a native project dialog is open.
      if (root.querySelector("dialog[open]")) lenis.stop();
      else if (lenis.isStopped) lenis.start();
    });

    root.classList.add("motion-ready");
    register();
    mutationObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open", "hidden"],
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    root.addEventListener("focusin", revealFocused);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(root);
    document.fonts.ready.then(() => {
      if (!destroyed) {
        lenis.resize();
        schedule();
      }
    });

    return () => {
      destroyed = true;
      cancelAnimationFrame(frame);
      revealObserver.disconnect();
      parallaxObserver.disconnect();
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      lenis.destroy();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      root.removeEventListener("focusin", revealFocused);
      root.classList.remove("motion-ready");
      registered.forEach((element) => element.classList.remove("is-revealed"));
      parallax.forEach((element) => {
        element.classList.remove("is-in-view");
        element.style.removeProperty("--parallax-y");
        element.style.removeProperty("--scroll-x");
      });
    };
  }, [rootRef, reducedMotion]);
}
