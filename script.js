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
        clearInterval(check);
        if (bearingDisplay)
          bearingDisplay.textContent = `✓ ${Math.round(currentAngle)}° — Nice!`;
      }
    }, 100);
    setTimeout(() => clearInterval(check), 15000);
  });

  // ===== MORSE CODE =====
  const morseMap = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
    G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
    M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
    S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---",
    "3": "...--", "4": "....-", "5": ".....", "6": "-....",
    "7": "--...", "8": "---..", "9": "----.", " ": "/",
  };

  const mIn = $("morse-input");
  const mDisp = $("morse-display");
  const mSpeed = $("morse-speed");
  const mFreq = $("morse-freq");
  const wpmVal = $("wpm-val");
  const freqVal = $("freq-val");

  let audioCtx = null;
  let isPlaying = false;
  let timeouts = [];

  const updateMorseDisplay = () => {
    if (!mIn || !mDisp) return;
    mDisp.innerHTML = mIn.value
      .toUpperCase()
      .split("")
      .map((c) => `<span data-c="${c}">${morseMap[c] || ""}</span>`)
      .join(" ");
  };

  mIn?.addEventListener("input", updateMorseDisplay);
  mSpeed?.addEventListener("input", () => {
    if (wpmVal) wpmVal.textContent = mSpeed.value;
  });
  mFreq?.addEventListener("input", () => {
    if (freqVal) freqVal.textContent = mFreq.value;
  });

  const playTone = (startTime, duration, frequency) => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = frequency;
    osc.type = "sine";
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.005);
    gain.gain.setValueAtTime(0.3, startTime + duration - 0.005);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const playMorse = (text) => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    stopMorse();
    isPlaying = true;

    const wpm = parseInt(mSpeed?.value || 12);
    const freq = parseInt(mFreq?.value || 600);
    const dotDuration = 1200 / wpm;
    let currentTime = audioCtx.currentTime + 0.05;

    const code = text
      .toUpperCase()
      .split("")
      .map((c) => morseMap[c] || "")
      .join(" ");
    const spans = mDisp?.children || [];
    let spanIndex = 0;

    for (let i = 0; i < code.length; i++) {
      const symbol = code[i];
      const el = spans[spanIndex];

      if (symbol === ".") {
        playTone(currentTime, dotDuration / 1000, freq);
        if (el) {
          el.classList.add("active");
          timeouts.push(
            setTimeout(() => el.classList.remove("active"), dotDuration)
          );
        }
        currentTime += dotDuration / 1000 + 0.005;
        spanIndex++;
      } else if (symbol === "-") {
        playTone(currentTime, (dotDuration * 3) / 1000, freq);
        if (el) {
          el.classList.add("active");
          timeouts.push(
            setTimeout(
              () => el.classList.remove("active"),
              dotDuration * 3
            )
          );
        }
        currentTime += (dotDuration * 3) / 1000 + 0.005;
        spanIndex++;
      } else if (symbol === "/") {
        currentTime += (dotDuration * 7) / 1000;
        spanIndex++;
      }
    }

    timeouts.push(
      setTimeout(() => {
        isPlaying = false;
      }, (currentTime - audioCtx.currentTime) * 1000 + 100)
    );
  };

  const stopMorse = () => {
    timeouts.forEach(clearTimeout);
    timeouts = [];
    isPlaying = false;
    if (mDisp)
      mDisp.querySelectorAll("span").forEach((s) => s.classList.remove("active"));
  };

  $("morse-play")?.addEventListener("click", () =>
    playMorse(mIn?.value || "SOS")
  );
  $("morse-stop")?.addEventListener("click", stopMorse);

  $$(".morse-phrase").forEach((el) => {
    el.addEventListener("click", () => {
      if (mIn) mIn.value = el.dataset.text;
      updateMorseDisplay();
      playMorse(el.dataset.text);
    });
  });

  // Build morse table
  const mTable = $("morse-table");
  if (mTable) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
    let html = "<tr>";
    chars.forEach((c, i) => {
      html += `<td class="char" data-c="${c}">${c}</td>`;
      html += `<td class="code">${morseMap[c]}</td>`;
      if ((i + 1) % 4 === 0 && i < chars.length - 1) html += "</tr><tr>";
    });
    html += "</tr>";
    mTable.innerHTML = html;

    mTable.querySelectorAll(".char").forEach((td) => {
      td.addEventListener("click", () => {
        if (mIn) mIn.value = td.dataset.c;
        updateMorseDisplay();
        playMorse(td.dataset.c);
      });
    });
  }

  // ===== SOLAR CALCULATOR =====
  const sLoc = $("solar-loc");
  const sSea = $("solar-season");

  const calculateSolar = () => {
    const baseLatitudes = { low: 23, mid: 45, high: 60 };
    let lat = baseLatitudes[sLoc?.value || "mid"];
    const season = sSea?.value || "equinox";

    if (season === "winter") lat += 15;
    else if (season === "summer") lat -= 15;

    lat = Math.max(0, Math.min(90, Math.round(lat)));

    $("solar-tilt").textContent = `${lat}°`;
    $("solar-dir").textContent = lat >= 0 ? "South" : "North";
    $("solar-hrs").textContent =
      lat < 30 ? "5-6 hrs" : lat < 50 ? "4-5 hrs" : "3-4 hrs";
    $("solar-loss").textContent = "70-85%";
    $("solar-angle-label").textContent = `${lat}°`;

    const panel = $("solar-panel-svg");
    if (panel) panel.setAttribute("transform", `rotate(${90 - lat} 140 135)`);
  };

  sLoc?.addEventListener("change", calculateSolar);
  sSea?.addEventListener("change", calculateSolar);
  calculateSolar();

  // ===== PACK LIST =====
  const packItems = $$(".pack-item input[type='checkbox']");
  const packTotal = $("pack-total");
  const packChecked = $("pack-checked");

  if (packTotal) packTotal.textContent = packItems.length;

  const updatePackCount = () => {
    const checked = Array.from(packItems).filter((i) => i.checked).length;
    if (packChecked) packChecked.textContent = checked;
    packItems.forEach((item) => {
      item
        .closest(".pack-item")
        ?.classList.toggle("checked", item.checked);
    });
    try {
      const checkedIds = Array.from(packItems)
        .filter((i) => i.checked)
        .map((i) => i.id);
      localStorage.setItem("survive-pack", JSON.stringify(checkedIds));
    } catch (e) {}
  };

  packItems.forEach((item) =>
    item.addEventListener("change", updatePackCount)
  );

  $("pack-reset")?.addEventListener("click", () => {
    packItems.forEach((i) => (i.checked = false));
    updatePackCount();
  });

  $("pack-print")?.addEventListener("click", () => window.print());

  // Restore pack state
  try {
    const saved = JSON.parse(localStorage.getItem("survive-pack") || "[]");
    saved.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.checked = true;
    });
    updatePackCount();
  } catch (e) {}

  // ===== FONT CONTROLS =====
  const fontSizes = {
    "font-sm": "14px",
    "font-md": "16px",
    "font-lg": "20px",
  };

  Object.entries(fontSizes).forEach(([id, size]) => {
    $(id)?.addEventListener("click", () => {
      document.body.style.fontSize = size;
      $$("#font-controls button").forEach((b) =>
        b.classList.remove("active")
      );
      $(id)?.classList.add("active");
      try {
        localStorage.setItem("survive-font", id);
      } catch (e) {}
    });
  });

  // Restore font size
  try {
    const savedFont = localStorage.getItem("survive-font");
    if (savedFont && fontSizes[savedFont]) {
      document.body.style.fontSize = fontSizes[savedFont];
      $$("#font-controls button").forEach((b) =>
        b.classList.remove("active")
      );
      $(savedFont)?.classList.add("active");
    }
  } catch (e) {}

  // ===== ENHANCED SOS BUTTON =====
  const sosBtn = $("sos-btn");
  const sosOverlay = $("sos-overlay");

  const playSOS = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const now = audioCtx.currentTime;
    const freq = 880;

    // Proper SOS timing (in seconds)
    const dot = 0.1;
    const dash = 0.3;
    const intraGap = 0.1;
    const letterGap = 0.3;
    const wordGap = 0.7;

    // Flash timings (in ms for DOM)
    const flashTimings = [];

    const addTone = (start, duration) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      osc.type = "square";
      gain.gain.setValueAtTime(0.4, start);
      gain.gain.setValueAtTime(0.4, start + duration - 0.01);
      gain.gain.linearRampToValueAtTime(0, start + duration);
      osc.start(start);
      osc.stop(start + duration);

      // Add corresponding flash
      flashTimings.push({
        time: (start - now) * 1000,
        duration: duration * 1000,
      });
    };

    // Pattern: ... --- ...
    let t = now + 0.05;

    // S: ...
    for (let i = 0; i < 3; i++) {
      addTone(t, dot);
      t += dot + intraGap;
    }
    t += letterGap - intraGap;

    // O: ---
    for (let i = 0; i < 3; i++) {
      addTone(t, dash);
      t += dash + intraGap;
    }
    t += letterGap - intraGap;

    // S: ...
    for (let i = 0; i < 3; i++) {
      addTone(t, dot);
      t += dot + intraGap;
    }

    // Repeat entire pattern 3 times
    const firstCycleLength = t - now;
    for (let cycle = 1; cycle < 3; cycle++) {
      const offset = firstCycleLength * cycle + wordGap * cycle;

      let t2 = now + offset + 0.05;

      for (let i = 0; i < 3; i++) {
        addTone(t2, dot);
        t2 += dot + intraGap;
      }
      t2 += letterGap - intraGap;

      for (let i = 0; i < 3; i++) {
        addTone(t2, dash);
        t2 += dash + intraGap;
      }
      t2 += letterGap - intraGap;

      for (let i = 0; i < 3; i++) {
        addTone(t2, dot);
        t2 += dot + intraGap;
      }
    }

    // Execute flashes
    sosBtn?.classList.add("sos-active");

    flashTimings.forEach(({ time, duration }) => {
      if (time < 0) time = 0;
      setTimeout(() => {
        sosOverlay?.classList.add("flash");
      }, time);

      setTimeout(() => {
        sosOverlay?.classList.remove("flash");
      }, time + duration);
    });

    const totalDuration =
      (firstCycleLength + wordGap) * 3 * 1000 + 500;

    setTimeout(() => {
      sosBtn?.classList.remove("sos-active");
    }, totalDuration);
  };

  sosBtn?.addEventListener("click", playSOS);

  // ===== URL HASH ROUTING =====
  const scrollToHash = () => {
    const hash = location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        // Offset for sticky header
        setTimeout(() => {
          window.scrollBy(0, -70);
        }, 100);
      }
    }
  };

  window.addEventListener("hashchange", scrollToHash);
  window.addEventListener("load", scrollToHash);

  // ===== ACTIVE NAV LINK =====
  const updateActiveNav = () => {
    const sections = $$("section");
    let current = "";

    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 150) {
        current = sec.id;
      }
    });

    $$(".nav-links a").forEach((a) => {
      a.classList.toggle(
        "active",
        a.getAttribute("href") === `#${current}`
      );
    });
  };

  window.addEventListener("scroll", updateActiveNav, { passive: true });

  // ===== PWA INSTALL PROMPT =====
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    $("pwa-prompt")?.classList.add("show");
  });

  $("pwa-prompt")?.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      deferredPrompt = null;
      $("pwa-prompt")?.classList.remove("show");
    }
  });

  // ===== SERVICE WORKER =====
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
})();
