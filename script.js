(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ===== LOADING =====
  window.addEventListener("load", () => {
    $("loading-overlay")?.classList.add("hidden");
  });

  // ===== THEME TOGGLE =====
  const themeBtn = $("theme-toggle");
  const themeIcon = $("theme-icon");
  const moonPath =
    '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>';
  const sunPath =
    '<path d="M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>';

  themeBtn?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    themeIcon.innerHTML = isLight ? moonPath : sunPath;
    try {
      localStorage.setItem("survive-theme", isLight ? "light" : "dark");
    } catch (e) {}
  });

  // Load saved theme
  try {
    if (localStorage.getItem("survive-theme") === "light") {
      document.body.classList.add("light");
      themeIcon.innerHTML = moonPath;
    }
  } catch (e) {}

  // ===== MOBILE MENU =====
  const menuBtn = $("menu-toggle");
  const navLinks = $("nav-links");

  menuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    navLinks?.classList.toggle("active");
    const expanded = navLinks?.classList.contains("active");
    menuBtn.setAttribute("aria-expanded", expanded);
  });

  navLinks?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuBtn?.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (e) => {
    if (
      navLinks?.classList.contains("active") &&
      !navLinks.contains(e.target) &&
      !menuBtn?.contains(e.target)
    ) {
      navLinks.classList.remove("active");
      menuBtn?.setAttribute("aria-expanded", "false");
    }
  });

  // ===== SEARCH =====
  const sBtn = $("search-btn");
  const sOv = $("search-overlay");
  const sIn = $("search-input");
  const sCl = $("search-close");
  const sRes = $("search-results");

  const openSearch = () => {
    sOv?.classList.add("active");
    setTimeout(() => sIn?.focus(), 50);
  };

  const closeSearch = () => {
    sOv?.classList.remove("active");
    if (sIn) sIn.value = "";
    if (sRes) sRes.innerHTML = "";
    sIn?.blur();
  };

  sBtn?.addEventListener("click", openSearch);
  sCl?.addEventListener("click", closeSearch);

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      openSearch();
    }
    if (e.key === "Escape") closeSearch();
  });

  sIn?.addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();
    if (sRes) sRes.innerHTML = "";
    if (query.length < 2) return;

    $$("section").forEach((sec) => {
      if (sec.textContent.toLowerCase().includes(query)) {
        const title = sec.querySelector("h2")?.textContent || sec.id;
        const div = document.createElement("div");
        div.className = "search-result";
        div.innerHTML = `<strong>${title.replace(
          new RegExp(query, "gi"),
          (m) => `<mark>${m}</mark>`
        )}</strong><br><small>Section: ${sec.id}</small>`;
        div.addEventListener("click", () => {
          closeSearch();
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        sRes?.appendChild(div);
      }
    });

    if (sRes && !sRes.innerHTML) {
      sRes.innerHTML = '<div class="search-result">No results found</div>';
    }
  });

  // ===== PROGRESS BAR =====
  window.addEventListener(
    "scroll",
    () => {
      const progress = $("progress");
      if (progress) {
        const scrollPercent =
          (window.scrollY /
            (document.body.scrollHeight - window.innerHeight)) *
          100;
        progress.style.width = `${Math.min(scrollPercent, 100)}%`;
      }
    },
    { passive: true }
  );

  // ===== COMPASS =====
  const compassSvg = $("compass-svg");
  const rose = $("compass-rose");
  const arrow = $("compass-arrow");
  const bearingDisplay = $("bearing-display");
  const bearingInput = $("bearing-input");
  let currentAngle = 0;

  const setAngle = (degrees) => {
    currentAngle = ((degrees % 360) + 360) % 360;
    if (bearingDisplay)
      bearingDisplay.textContent = `${Math.round(currentAngle)}°`;
    if (bearingInput) bearingInput.value = Math.round(currentAngle);
    if (rose)
      rose.setAttribute("transform", `rotate(${currentAngle} 100 100)`);
    if (arrow)
      arrow.setAttribute("transform", `rotate(${currentAngle} 100 100)`);
  };

  const presets = {
    N: 0, NE: 45, E: 90, SE: 135,
    S: 180, SW: 225, W: 270, NW: 315,
  };

  Object.entries(presets).forEach(([key, val]) => {
    $(`btn-${key.toLowerCase()}`)?.addEventListener("click", () =>
      setAngle(val)
    );
  });

  bearingInput?.addEventListener("change", (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setAngle(val);
  });

  let isDragging = false;
  let startAngle = 0;

  const getAngleFromEvent = (e) => {
    const rect = compassSvg.getBoundingClientRect();
    const x =
      (e.touches ? e.touches[0].clientX : e.clientX) -
      rect.left -
      rect.width / 2;
    const y =
      (e.touches ? e.touches[0].clientY : e.clientY) -
      rect.top -
      rect.height / 2;
    return (Math.atan2(y, x) * 180) / Math.PI + 90;
  };

  const onDragStart = (e) => {
    isDragging = true;
    startAngle = currentAngle - getAngleFromEvent(e);
    e.preventDefault();
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    setAngle(startAngle + getAngleFromEvent(e));
    e.preventDefault();
  };

  const onDragEnd = () => {
    isDragging = false;
  };

  compassSvg?.addEventListener("mousedown", onDragStart);
  compassSvg?.addEventListener("touchstart", onDragStart, { passive: false });
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("touchmove", onDragMove, { passive: false });
  window.addEventListener("mouseup", onDragEnd);
  window.addEventListener("touchend", onDragEnd);

  $("btn-practice")?.addEventListener("click", () => {
    const target = Math.floor(Math.random() * 360);
    if (bearingDisplay)
      bearingDisplay.textContent = `Match: ${target}° — Drag compass!`;
    const check = setInterval(() => {
      if (Math.abs(currentAngle - target) <= 8) {
       
