(function () {
  const $ = (selector) => document.querySelector(selector);

  function safeOn(element, event, handler, options) {
    if (!element) return;
    element.addEventListener(event, handler, options);
  }

  function toast(message) {
    const node = document.createElement("div");
    node.textContent = message;
    node.style.position = "fixed";
    node.style.left = "50%";
    node.style.bottom = "20px";
    node.style.transform = "translateX(-50%)";
    node.style.padding = "10px 12px";
    node.style.borderRadius = "10px";
    node.style.border = "1px solid var(--line)";
    node.style.background = "var(--surface)";
    node.style.color = "var(--text)";
    node.style.boxShadow = "var(--shadow-sm)";
    node.style.zIndex = "100";
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 1400);
  }

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value);
      toast(`Copied: ${value}`);
    } catch {
      toast("Copy failed. Check browser permissions.");
    }
  }

  const yearNode = $("#year");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  const progress = $("#progress");
  const header = document.querySelector(".site-header");
  if (progress) {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const percent = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      progress.style.width = `${percent}%`;
      if (header) {
        header.classList.toggle("scrolled", doc.scrollTop > 8);
      }
    };

    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  safeOn($("#backToTop"), "click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll("[data-copy]").forEach((button) => {
    safeOn(button, "click", () => copyText(button.getAttribute("data-copy") || ""));
  });

  const themeToggle = $("#themeToggle");
  const themeIcon = $("#themeIcon");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (themeIcon) themeIcon.textContent = theme === "dark" ? "☀" : "☾";
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  safeOn(themeToggle, "click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(current === "light" ? "dark" : "light");
  });

  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealTargets = document.querySelectorAll(
      ".hero-panel, .panel, .card, .timeline-item, .project, .section-head"
    );
    revealTargets.forEach((node) => node.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -30px 0px" }
    );

    revealTargets.forEach((node) => observer.observe(node));
  }
})();
