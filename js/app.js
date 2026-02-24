(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // ---------- Small helpers ----------
  function toast(msg) {
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.bottom = "18px";
    el.style.transform = "translateX(-50%)";
    el.style.padding = "10px 12px";
    el.style.borderRadius = "12px";
    el.style.border = "1px solid var(--line)";
    el.style.background = "var(--card)";
    el.style.backdropFilter = "blur(12px)";
    el.style.boxShadow = "var(--shadow)";
    el.style.zIndex = "100";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }

  function safeOn(el, event, handler, options) {
    if (!el) return;
    el.addEventListener(event, handler, options);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast(`Copied: ${text}`);
    } catch {
      toast("Copy failed (browser permissions).");
    }
  }

  // ---------- Year ----------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Scroll progress ----------
  const progress = $("#progress");
  if (progress) {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      progress.style.width = `${pct}%`;
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- Back to top ----------
  safeOn($("#backToTop"), "click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  // ---------- Copy buttons (works on ALL pages) ----------
  // Any button/link with data-copy="..." will copy.
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    safeOn(btn, "click", () => copyText(btn.getAttribute("data-copy") || ""));
  });

  // ---------- Theme toggle (persisted) ----------
  const themeToggle = $("#themeToggle");
  const themeIcon = $("#themeIcon");

  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
    if (themeIcon) themeIcon.textContent = t === "light" ? "☀" : "☾";
  }

  // Initialize theme even if the toggle doesn't exist (safe for any page)
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    setTheme(savedTheme);
  } else {
    const prefersLight =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches;
    setTheme(prefersLight ? "light" : "dark");
  }

  safeOn(themeToggle, "click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(cur === "dark" ? "light" : "dark");
  });

  // ---------- Projects (only if grid exists; index.html only) ----------
  const grid = $("#projectGrid");
  const search = $("#projectSearch");
  const filterBtns = $$(".chip-btn");

  if (grid && search) {
    const projects = [
      {
        title: "Reinforcement Learning Firewall",
        link: "https://github.com/vmbobato/RL-Firewall",
        tags: ["security", "ml"],
        bullets: [
          "Custom Gymnasium environment for sequential firewall decisions (Allow/Deny).",
          "Trained Q-Learning, SARSA, and DQN agents; outperformed static baselines.",
          "Reward balances false positives/negatives and operational cost.",
        ],
      },
      {
        title: "ASIC — AI for Satellite Image Classification",
        link: "https://vmbobato.github.io/asic-blog/",
        tags: ["ml", "cloud"],
        bullets: [
          "Fine-tuned semantic segmentation on 800+ satellite images across 7 land cover classes.",
          "Deployed as a Flask web app for user-driven satellite image analysis.",
          "Reached 70%+ pixel-level segmentation accuracy on real-world imagery.",
        ],
      },
      {
        title: "Dynamic Honeypot Game",
        link: "https://github.com/vmbobato/dynamic-Honeypot-Game",
        tags: ["ml", "security"],
        bullets: [
          "Modeled a 2-player zero-sum game between attacker and defender using MWU algorithm to approximate Nash equilibrium",
          "Simulated attack and defense strategies in a grid network environment with neighborhood detection mechanisms"
        ],
      },
    ];

    let activeFilter = "all";

    function matches(project, q) {
      if (!q) return true;
      const hay = (
        project.title +
        " " +
        project.bullets.join(" ") +
        " " +
        project.tags.join(" ")
      ).toLowerCase();
      return hay.includes(q.toLowerCase());
    }

    function visible(project, q) {
      const filterOk =
        activeFilter === "all" ? true : project.tags.includes(activeFilter);
      return filterOk && matches(project, q);
    }

    function render() {
      const q = (search.value || "").trim();
      const list = projects.filter((p) => visible(p, q));

      grid.innerHTML = "";
      if (list.length === 0) {
        const empty = document.createElement("div");
        empty.className = "card";
        empty.innerHTML = `<h3>No matches</h3><p>Try a different keyword or filter.</p>`;
        grid.appendChild(empty);
        return;
      }

      for (const p of list) {
        const el = document.createElement("article");
        el.className = "card";
        el.innerHTML = `
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:start;flex-wrap:wrap;">
            <h3 style="margin:0;">${p.title}</h3>
            <a class="btn ghost" href="${p.link}" target="_blank" rel="noreferrer">Open ↗</a>
          </div>
          <div class="pill-grid" style="margin-top:10px;">
            ${p.tags.map((t) => `<span class="pill">${t}</span>`).join("")}
          </div>
          <ul class="list">
            ${p.bullets.map((b) => `<li>${b}</li>`).join("")}
          </ul>
        `;
        grid.appendChild(el);
      }
    }

    safeOn(search, "input", render);

    filterBtns.forEach((btn) => {
      safeOn(btn, "click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.getAttribute("data-filter") || "all";
        render();
      });
    });

    render();
  }

  // ---------- Command palette (only if palette exists) ----------
  const palette = $("#palette");
  const backdrop = $("#paletteBackdrop");
  const paletteInput = $("#paletteInput");
  const paletteList = $("#paletteList");
  const paletteClose = $("#paletteClose");
  const openPaletteBtns = [$("#openPalette"), $("#openPalette2")].filter(Boolean);

  if (palette && backdrop && paletteInput && paletteList && paletteClose) {
    const commands = [
      { label: "Go to About", hint: "#about", run: () => (location.href = "index.html#about") },
      { label: "Go to Experience", hint: "#experience", run: () => (location.href = "index.html#experience") },
      { label: "Go to Projects", hint: "#projects", run: () => (location.href = "index.html#projects") },
      { label: "Go to Skills", hint: "#skills", run: () => (location.href = "index.html#skills") },
      { label: "Go to Contact", hint: "#contact", run: () => (location.href = "index.html#contact") },
      { label: "Go to Build With Me", hint: "work.html", run: () => (location.href = "work.html") },
      { label: "Download Resume", hint: "assets/resume.pdf", run: () => window.open("assets/Vinicius_resume.pdf", "_blank") },
      { label: "Copy Email", hint: "vmbobato@tamu.edu", run: () => copyText("vmbobato@tamu.edu") },
      { label: "Toggle Theme", hint: "light/dark", run: () => themeToggle?.click() },
    ];

    let activeIndex = 0;

    function openPalette() {
      palette.classList.add("open");
      backdrop.classList.add("open");
      palette.setAttribute("aria-hidden", "false");
      backdrop.setAttribute("aria-hidden", "false");
      paletteInput.value = "";
      activeIndex = 0;
      renderPalette();
      setTimeout(() => paletteInput.focus(), 0);
    }

    function closePalette() {
      palette.classList.remove("open");
      backdrop.classList.remove("open");
      palette.setAttribute("aria-hidden", "true");
      backdrop.setAttribute("aria-hidden", "true");
    }

    function renderPalette() {
      const q = paletteInput.value.trim().toLowerCase();
      const filtered = commands.filter((c) =>
        (c.label + " " + c.hint).toLowerCase().includes(q)
      );
      if (activeIndex >= filtered.length) activeIndex = Math.max(0, filtered.length - 1);

      paletteList.innerHTML = "";
      filtered.forEach((cmd, idx) => {
        const item = document.createElement("div");
        item.className = "palette-item" + (idx === activeIndex ? " active" : "");
        item.setAttribute("role", "option");
        item.innerHTML = `<span>${cmd.label}</span><span class="mono muted">${cmd.hint}</span>`;
        safeOn(item, "click", () => {
          cmd.run();
          closePalette();
        });
        paletteList.appendChild(item);
      });

      if (filtered.length === 0) {
        const none = document.createElement("div");
        none.className = "palette-item";
        none.innerHTML = `<span>No matches</span><span class="mono muted">try “projects”</span>`;
        paletteList.appendChild(none);
      }

      palette._filtered = filtered;
    }

    safeOn(paletteInput, "input", renderPalette);
    safeOn(paletteClose, "click", closePalette);
    safeOn(backdrop, "click", closePalette);
    openPaletteBtns.forEach((b) => safeOn(b, "click", openPalette));

    document.addEventListener("keydown", (e) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const open = palette.classList.contains("open");
        open ? closePalette() : openPalette();
      }

      if (!palette.classList.contains("open")) return;

      if (e.key === "Escape") closePalette();

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const filtered = palette._filtered || [];
        if (filtered.length) activeIndex = (activeIndex + 1) % filtered.length;
        renderPalette();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const filtered = palette._filtered || [];
        if (filtered.length) activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
        renderPalette();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const filtered = palette._filtered || [];
        const cmd = filtered[activeIndex];
        if (cmd) {
          cmd.run();
          closePalette();
        }
      }
    });
  }
})();