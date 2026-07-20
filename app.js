const WORKER_URL = "https://currency.digitalimarketingchannel.workers.dev/";

const sources = {
  bonbast: { label: "Bonbast.com" },
  bonbast2: { label: "Bon-bast.com" },
  navasan: { label: "Navasan.net" },
  tgju: { label: "TGJU.org" },
};

function setState(card, text, kind) {
  const p = card.querySelector(".price");
  p.textContent = text;
  p.classList.remove("loading", "error");
  if (kind) p.classList.add(kind);
}

async function checkOne(name) {
  const card = document.querySelector(`[data-source="${name}"]`);
  setState(card, "Checking...", "loading");
  try {
    const res = await fetch(`${WORKER_URL}?site=${name}`, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!data.price) throw new Error("No price found");
    setState(card, data.price, null);
  } catch (e) {
    setState(card, "Failed: open site directly", "error");
    card.onclick = () => window.open(directLinks[name], "_blank");
  }
}

const directLinks = {
  bonbast: "https://bonbast.com/",
  bonbast2: "https://www.bon-bast.com/",
  navasan: "https://www.navasan.net/",
  tgju: "https://www.tgju.org/currency",
};

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", () => checkOne(card.dataset.source));
});

document.getElementById("checkAllBtn").addEventListener("click", () => {
  Object.keys(sources).forEach(checkOne);
});
