const WORKER_URL = "https://currency.digitalimarketingchannel.workers.dev/";
const directLinks = {
  bonbast: "https://bonbast.com/",
  bonbast2: "https://www.bon-bast.com/",
  navasan: "https://www.navasan.net/",
  tgju: "https://www.tgju.org/currency",
};
const order = ["bonbast", "bonbast2", "navasan"];
function setState(card, text, kind){ const p = card.querySelector(".price"); p.textContent = text; p.classList.remove("loading","error"); if(kind) p.classList.add(kind); }
async function checkTgju(){ const card=document.querySelector('[data-source="tgju"]'); setState(card,"Checking...","loading"); try{ const res=await fetch(`${WORKER_URL}?site=tgju&t=${Date.now()}`, {cache:"no-store"}); const data=await res.json(); if(!data.price) throw new Error(data.error || "No price found"); setState(card,data.price,null); } catch(e){ setState(card,"Failed: open site directly","error"); card.onclick = () => window.open(directLinks.tgju, "_blank"); }}
function openOne(site){ const w = window.open(directLinks[site], "_blank"); if(!w) alert("Allow pop-ups to open sites one by one."); }
document.querySelectorAll(".card").forEach(card => { card.addEventListener("click", ()=> { if(card.dataset.source === 'tgju') checkTgju(); else { openOne(card.dataset.source); setState(card, 'Opened in new tab', null); } }); });
document.getElementById("checkAllBtn").addEventListener("click", () => { checkTgju(); let delay=0; order.forEach(site => { setTimeout(()=>openOne(site), delay); delay += 800; }); });
