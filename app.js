const PROXIES = [
  (url) => "https://r.jina.ai/" + url,
];

const sources = {
  bonbast: {
    url: "https://bonbast.com/",
    parse: (html) => {
      const m = html.match(/Euro\/\s*IRR\s*\n*\s*([\d,]+)\s*Toman/i);
      return m ? `${m[1]} Toman` : null;
    }
  },
  bonbast2: {
    url: "https://www.bon-bast.com/",
    parse: (html) => {
      const m = html.match(/EUR.*?Euro\s*\|\s*([\d,]+)\s*\|\s*([\d,]+)/i);
      return m ? `${m[1]} / ${m[2]} Toman (sell/buy)` : null;
    }
  },
  navasan: {
    url: "https://www.navasan.net/",
    parse: (html) => {
      const m = html.match(/یورو\]\([^)]+\)\s*\|\s*([\d.]+)/);
      return m ? `${m[1]} Toman` : null;
    }
  },
  tgju: {
    url: "https://www.tgju.org/currency",
    parse: (html) => {
      const m = html.match(/یورو[\s\S]{0,300}?([\d,]{5,7})/);
      return m ? `${m[1]} Toman` : null;
    }
  }
};

function setState(card, text, kind) {
  const p = card.querySelector(".price");
  p.textContent = text;
  p.classList.remove("loading", "error");
  if (kind) p.classList.add(kind);
}

async function checkOne(name) {
  const card = document.querySelector(`[data-source="${name}"]`);
  const cfg = sources[name];
  setState(card, "Checking...", "loading");
  try {
    const res = await fetch("https://r.jina.ai/" + cfg.url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const html = await res.text();
    const price = cfg.parse(html);
    if (!price) throw new Error("Could not find EUR price");
    setState(card, price, null);
  } catch (e) {
    setState(card, "Failed: open site directly", "error");
    card.onclick = () => window.open(cfg.url, "_blank");
  }
}

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", () => checkOne(card.dataset.source));
});

document.getElementById("checkAllBtn").addEventListener("click", () => {
  Object.keys(sources).forEach(checkOne);
});
