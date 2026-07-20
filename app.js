/*
  On tap, fetches the raw HTML of each site through a public CORS proxy
  (needed because Safari/iOS blocks direct cross-origin reads),
  then extracts only the EUR line using a regex tuned to each page.

  Public CORS proxies can go down or rate-limit; if a card fails,
  try again in a few seconds or swap PROXY for another provider.
*/

const PROXY = "https://corsproxy.io/?url=";

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

async function checkOne(name) {
  const card = document.querySelector(`[data-source="${name}"]`);
  const cfg = sources[name];
  setState(card, "Checking...", "loading");
  try {
    const res = await fetch(PROXY + encodeURIComponent(cfg.url), { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const html = await res.text();
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
