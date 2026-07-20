/*
  Uses allorigins.win (primary) and codetabs.com (fallback) as CORS proxies,
  since corsproxy.io is unreliable/rate-limited for many users.
*/

const PROXIES = [
  (url) => "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
  (url) => "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(url),
];

const sources = {
  bonbast: {
    url: "https://bonbast.com/",
    parse: (html) => {
      const m = html.match(/eur[\s\S]{0,300}?(\d{1,3}(?:,\d{3})+)[\s\S]{0,80}?(\d{1,3}(?:,\d{3})+)/i);
      return m ? `${m[1]} / ${m[2]} Toman (sell/buy)` : null;
    }
  },
  bonbast2: {
    url: "https://www.bon-bast.com/",
    parse: (html) => {
      const m = html.match(/EUR[\s\S]{0,200}?(\d{2,3}(?:,\d{3})+)/i);
      return m ? `${m[1]} Toman` : null;
    }
  },
  navasan: {
    url: "https://www.navasan.net/",
    parse: (html) => {
      const m = html.match(/یورو[\s\S]{0,200}?(\d{2,3}(?:,\d{3})+)/) ||
                html.match(/eur[\s\S]{0,200}?(\d{2,3}(?:,\d{3})+)/i);
      return m ? `${m[1]} Toman` : null;
    }
  },
  tgju: {
    url: "https://www.tgju.org/currency",
    parse: (html) => {
      const m = html.match(/price_eur[\s\S]{0,400}?(\d{2,3}(?:,\d{3})+)/i) ||
                html.match(/یورو[\s\S]{0,300}?(\d{2,3}(?:,\d{3})+)/);
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

async function tryFetch(targetUrl) {
  let lastErr;
  for (const buildProxyUrl of PROXIES) {
    try {
      const res = await fetch(buildProxyUrl(targetUrl), { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const text = await res.text();
      if (text && text.length > 200) return text;
      throw new Error("Empty response");
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("All proxies failed");
}

async function checkOne(name) {
  const card = document.querySelector(`[data-source="${name}"]`);
  const cfg = sources[name];
  setState(card, "Checking...", "loading");
  try {
    const html = await tryFetch(cfg.url);
    const price = cfg.parse(html);
    if (!price) throw new Error("Could not find EUR price on page");
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
