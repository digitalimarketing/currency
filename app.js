const SOURCES = {
  bonbast: "https://bonbast.com/",
  bonbast2: "https://www.bon-bast.com/",
  navasan: "https://www.navasan.net/",
  tgju: "https://www.tgju.org/currency",
};
const order = ["bonbast", "bonbast2", "navasan"];
function setState(card, text){ card.querySelector(".price").textContent = text; }
function openFocused(url, name){ const w = window.open(url, name); if(w) w.focus(); else alert("Allow pop-ups to open sites one by one."); return w; }
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    const site = card.dataset.source;
    if(site === 'tgju') { openFocused(SOURCES.tgju, 'tgju'); setState(card, 'Opened in new tab'); return; }
    openFocused(SOURCES[site], site);
    setState(card, 'Opened and focused');
  });
});
document.getElementById("checkAllBtn").addEventListener("click", () => {
  let i = 0;
  function next(){
    if(i >= order.length) { openFocused(SOURCES.tgju, 'tgju'); return; }
    openFocused(SOURCES[order[i]], order[i]);
    i += 1;
    setTimeout(next, 900);
  }
  next();
});
