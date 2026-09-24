// Phyll probe: in-page measurements for a UX review.
//
// The whole file is one JavaScript expression that returns a plain object and changes nothing
// on the page. Run it with whatever evaluates JavaScript in your browser tool:
//   Claude Code browser:  javascript_tool with the file content as the code
//   Playwright MCP:       browser_evaluate with  () => <file content>
//   Playwright:           await page.evaluate(fileContent)   (capture.mjs does this)
//   DevTools console:     paste the file
(() => {
  const VERSION = "0.1.0";
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const errors = [];
  const clip = (s, n = 80) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);
  const styleOf = (el) => getComputedStyle(el);

  // ---------- visibility ----------
  const hasBox = (el) => {
    const r = el.getBoundingClientRect();
    return r.width >= 1 && r.height >= 1;
  };
  const opacityChain = (el) => {
    let o = 1;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      o *= parseFloat(styleOf(n).opacity) || 0;
      if (o < 0.05) return 0;
    }
    return o;
  };
  const isShown = (el) => {
    if (!hasBox(el)) return false;
    const s = styleOf(el);
    return s.visibility !== "hidden" && s.display !== "none";
  };

  // ---------- color ----------
  // Computed colors can be rgb(), oklch(), color(...) and more. A 1x1 canvas converts any of them to sRGB.
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const colorCache = new Map();
  const toRGBA = (css) => {
    if (colorCache.has(css)) return colorCache.get(css);
    let out = [0, 0, 0, 0];
    if (css && css !== "transparent") {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      out = [d[0], d[1], d[2], d[3] / 255];
    }
    colorCache.set(css, out);
    return out;
  };
  const blend = (top, bottom) => {
    const a = top[3];
    return [
      top[0] * a + bottom[0] * (1 - a),
      top[1] * a + bottom[1] * (1 - a),
      top[2] * a + bottom[2] * (1 - a),
      1,
    ];
  };
  const channel = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (c) => 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);
  const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const hex = (c) => "#" + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

  // Color tokens inside a CSS gradient, such as rgb(...), oklch(...) or #hex.
  const COLOR_TOKEN = /(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\([^()]*\)|#[0-9a-f]{3,8}\b/gi;
  const gradientStops = (image) => (image.match(COLOR_TOKEN) ?? []).map(toRGBA).filter((c) => c[3] > 0);

  // The colors that can sit behind an element, composited up the tree. A gradient contributes
  // each of its stops, so callers can take the worst case. null when a picture is behind it.
  const backgroundsOf = (el) => {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const s = styleOf(n);
      const image = s.backgroundImage;
      if (image && image !== "none" && !(n === el && (s.webkitBackgroundClip === "text" || s.backgroundClip === "text"))) {
        if (image.includes("url(")) return null;
        const stops = gradientStops(image);
        if (stops.length) {
          layers.push(stops);
          if (stops.every((c) => c[3] >= 0.99)) break;
        }
      }
      const c = toRGBA(s.backgroundColor);
      if (c[3] > 0) {
        layers.push([c]);
        if (c[3] >= 0.99) break;
      }
    }
    let candidates = [[255, 255, 255, 1]];
    for (let i = layers.length - 1; i >= 0; i--) {
      const next = [];
      for (const top of layers[i]) for (const bottom of candidates) next.push(blend(top, bottom));
      candidates = next.slice(0, 16);
    }
    return candidates;
  };
  const backgroundOf = (el) => backgroundsOf(el)?.[0] ?? null;

  // ---------- text ----------
  const textEls = [];
  try {
    const seen = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (t) => (t.nodeValue.trim().length > 1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    while (walker.nextNode() && textEls.length < 500) {
      const el = walker.currentNode.parentElement;
      if (!el || seen.has(el) || el.closest("script, style, noscript, svg, template")) continue;
      seen.add(el);
      if (isShown(el) && opacityChain(el) > 0.05) textEls.push(el);
    }
  } catch (e) {
    errors.push("text: " + e.message);
  }
  const ownText = (el) =>
    [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join(" ");

  // Worst-case contrast of each text element. Gradient text is measured stop by stop against
  // what is behind it; text over a gradient is measured against each stop of that gradient.
  const gradientTextOf = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const s = styleOf(n);
      if ((s.webkitBackgroundClip === "text" || s.backgroundClip === "text") && s.backgroundImage.includes("gradient")) {
        return { node: n, stops: gradientStops(s.backgroundImage) };
      }
    }
    return null;
  };

  const contrastResult = { checked: 0, failures: 0, skipped: 0, samples: [] };
  try {
    for (const el of textEls) {
      if (el.closest("[disabled], [aria-disabled='true']")) continue;
      const s = styleOf(el);
      const gradientText = gradientTextOf(el);
      const backgrounds = backgroundsOf(gradientText ? gradientText.node.parentElement ?? el : el);
      if (!backgrounds || !backgrounds.length) {
        contrastResult.skipped++;
        continue;
      }
      const alpha = opacityChain(el);
      const raw = toRGBA(s.color);
      const inks = gradientText?.stops.length ? gradientText.stops : [raw];
      let worst = null;
      for (const bg of backgrounds) {
        for (const ink of inks) {
          const fg = blend([ink[0], ink[1], ink[2], ink[3] * alpha], bg);
          const ratio = contrast(fg, bg);
          if (!worst || ratio < worst.ratio) worst = { ratio, fg, bg };
        }
      }
      const size = parseFloat(s.fontSize) || 16;
      const weight = parseInt(s.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const required = large ? 3 : 4.5;
      contrastResult.checked++;
      if (worst.ratio < required) {
        contrastResult.failures++;
        if (contrastResult.samples.length < 20) {
          contrastResult.samples.push({
            text: clip(ownText(el), 60),
            ratio: Math.round(worst.ratio * 100) / 100,
            required,
            color: hex(worst.fg),
            background: hex(worst.bg),
            fontSize: size,
          });
        }
      }
    }
  } catch (e) {
    errors.push("contrast: " + e.message);
  }

  const firstViewText = [];
  let firstViewLength = 0;
  for (const el of textEls) {
    const r = el.getBoundingClientRect();
    if (r.top >= vh || r.bottom <= 0) continue;
    const t = clip(ownText(el), 200);
    if (!t) continue;
    firstViewText.push(t);
    firstViewLength += t.length;
    if (firstViewLength > 700) break;
  }

  const headings = [...document.querySelectorAll("h1, h2, h3, [role='heading']")]
    .filter(isShown)
    .slice(0, 20)
    .map((h) => ({
      level: Number(h.getAttribute("aria-level")) || Number(h.tagName.slice(1)) || 2,
      text: clip(h.textContent, 80),
      inFirstView: h.getBoundingClientRect().top < vh,
    }));

  // ---------- actions ----------
  const ACTION_SELECTOR = [
    "a[href]", "button", "[role='button']", "[role='link']", "[role='menuitem']", "[role='tab']",
    "input[type='button']", "input[type='submit']", "input[type='reset']", "summary", "[onclick]",
  ].join(", ");

  const accessibleName = (el) => {
    const ids = el.getAttribute("aria-labelledby");
    const labelled = ids
      ? ids.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" ")
      : "";
    return clip(
      el.getAttribute("aria-label") ||
        labelled ||
        el.getAttribute("title") ||
        el.innerText ||
        el.value ||
        el.querySelector("img[alt]")?.getAttribute("alt") ||
        el.querySelector("svg title")?.textContent ||
        "",
      60,
    );
  };

  const isPrimaryStyle = (el) => {
    if (el.closest("nav, [role='navigation'], aside, [role='tablist']")) return false;
    const s = styleOf(el);
    if (s.backgroundImage.includes("gradient")) return true;
    const fill = toRGBA(s.backgroundColor);
    if (fill[3] < 0.8) return false;
    const behind = (el.parentElement && backgroundOf(el.parentElement)) || [255, 255, 255, 1];
    return contrast(fill, behind) >= 2;
  };

  const actions = {
    total: 0,
    primaryInFirstView: 0,
    iconOnlyUnnamed: 0,
    smallTargets: 0,
    deadLinks: 0,
    hiddenUntilHover: 0,
    items: [],
  };
  try {
    for (const el of document.querySelectorAll(ACTION_SELECTOR)) {
      if (!hasBox(el)) continue;
      const s = styleOf(el);
      if (s.visibility === "hidden" || s.display === "none") continue;
      if (opacityChain(el) === 0) {
        actions.hiddenUntilHover++;
        continue;
      }
      const r = el.getBoundingClientRect();
      const text = clip(el.innerText || el.value || "", 60);
      const name = accessibleName(el);
      const iconOnly = !text && !!el.querySelector("svg, img, i, [class*='icon']");
      const href = el.tagName === "A" ? (el.getAttribute("href") ?? "").trim() : null;
      const deadLink = href !== null && (href === "" || href === "#" || /^javascript:/i.test(href));
      const inlineLink = el.tagName === "A" && s.display === "inline";
      const small = !inlineLink && (r.width < 24 || r.height < 24);
      const inFirstView = r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0;
      const primary = isPrimaryStyle(el);
      const disabled = el.disabled === true || el.getAttribute("aria-disabled") === "true";

      actions.total++;
      if (primary && inFirstView && !disabled) actions.primaryInFirstView++;
      if (iconOnly && !name) actions.iconOnlyUnnamed++;
      if (small) actions.smallTargets++;
      if (deadLink) actions.deadLinks++;
      if (actions.items.length < 60) {
        actions.items.push({
          tag: el.tagName.toLowerCase(),
          text,
          name: name !== text ? name : undefined,
          iconOnly: iconOnly || undefined,
          primary: primary || undefined,
          disabled: disabled || undefined,
          deadLink: deadLink || undefined,
          small: small || undefined,
          inFirstView,
          box: { x: Math.round(r.left), y: Math.round(r.top + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) },
        });
      }
    }
  } catch (e) {
    errors.push("actions: " + e.message);
  }

  // ---------- forms ----------
  const FIELD_SELECTOR = [
    "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']):not([type='image'])",
    "select", "textarea", "[role='combobox']", "[role='switch']", "[role='checkbox']", "[role='radiogroup']",
    "[contenteditable='true']",
  ].join(", ");
  const describeFields = (list) => {
    const fields = [...list].filter(isShown);
    const unlabeled = fields.filter(
      (f) =>
        !(f.labels && f.labels.length) &&
        !f.getAttribute("aria-label") &&
        !f.getAttribute("aria-labelledby") &&
        !f.getAttribute("title"),
    ).length;
    const required = fields.filter((f) => f.required || f.getAttribute("aria-required") === "true").length;
    return { fields: fields.length, required, unlabeled };
  };
  let forms = [];
  let looseFields = 0;
  try {
    forms = [...document.querySelectorAll("form")]
      .filter(isShown)
      .map((f) => describeFields(f.querySelectorAll(FIELD_SELECTOR)));
    looseFields = [...document.querySelectorAll(FIELD_SELECTOR)].filter((f) => !f.closest("form") && isShown(f)).length;
  } catch (e) {
    errors.push("forms: " + e.message);
  }

  // ---------- decoration and typography ----------
  const decor = { gradients: 0, gradientText: 0, blur: 0, roundedShadow: 0, emoji: 0 };
  const families = new Map();
  const sizes = new Set();
  try {
    const all = document.body.querySelectorAll("*");
    for (let i = 0; i < all.length && i < 4000; i++) {
      const el = all[i];
      if (!hasBox(el)) continue;
      const s = styleOf(el);
      if (s.backgroundImage.includes("gradient")) {
        decor.gradients++;
        if (s.webkitBackgroundClip === "text" || s.backgroundClip === "text") decor.gradientText++;
      }
      if ((s.backdropFilter && s.backdropFilter !== "none") || s.filter.includes("blur")) decor.blur++;
      if (s.boxShadow !== "none" && parseFloat(s.borderTopLeftRadius) >= 12) {
        const r = el.getBoundingClientRect();
        if (r.width * r.height > 4000) decor.roundedShadow++;
      }
    }
    for (const el of textEls) {
      const s = styleOf(el);
      const family = s.fontFamily.split(",")[0].replace(/["']/g, "").trim();
      families.set(family, (families.get(family) ?? 0) + 1);
      sizes.add(Math.round(parseFloat(s.fontSize)));
      decor.emoji += (ownText(el).match(/\p{Extended_Pictographic}/gu) ?? []).length;
    }
  } catch (e) {
    errors.push("decor: " + e.message);
  }

  const dialogsOpen = [...document.querySelectorAll("[role='dialog'], [role='alertdialog'], dialog[open]")].filter(
    (d) => isShown(d) && d.getAttribute("aria-hidden") !== "true",
  ).length;

  return {
    probe: VERSION,
    url: location.href,
    title: document.title,
    lang: document.documentElement.lang || null,
    viewport: { width: vw, height: vh },
    page: {
      height: document.documentElement.scrollHeight,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    },
    firstView: { text: firstViewText.join(" | ").slice(0, 700), headings },
    actions,
    contrast: contrastResult,
    forms,
    looseFields,
    decor,
    typography: {
      families: [...families.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([f]) => f),
      sizes: [...sizes].sort((a, b) => b - a).slice(0, 12),
    },
    dialogsOpen,
    errors,
  };
})()
