const WORKER_URL = "https://currency.digitalimarketingchannel.workers.dev/";

const directLinks = {
  bonbast: "https://bonbast.com/#:~:text=Euro/%20IRR",
  bonbast2: "https://www.bon-bast.com/#:~:text=EUR",
  navasan: "https://www.navasan.net/#:~:text=یورو",
  tgju: "https://www.tgju.org/currency",
};

function setState(card, text, kind){ 
  const p = card.querySelector(".price"); 
  p.textContent = text; 
  p.classList.remove("loading","error"); 
  if(kind) p.classList.add(kind); 
}

async function checkTgju(){ 
  const card = document.querySelector('[data-source="tgju"]'); 
  setState(card, "Checking...", "loading"); 
  try{ 
    const res = await fetch(`${WORKER_URL}?site=tgju&t=${Date.now()}`, {cache:"no-store"}); 
    const data = await res.json(); 
    if(!data.price) throw new Error(data.error || "No price found"); 
    setState(card, data.price, null); 
  } catch(e){ 
    setState(card, "Failed: open site directly", "error"); 
    card.onclick = () => window.open(directLinks.tgju, "_blank"); 
  }
}

document.querySelectorAll(".card").forEach(card => { 
  card.addEventListener("click", () => { 
    if(card.dataset.source === 'tgju') {
      checkTgju(); 
    } else { 
      window.open(directLinks[card.dataset.source], "_blank");
      setState(card, "Opened and highlighted", null);
    } 
  }); 
});

document.getElementById("loadAllBtn").addEventListener("click", () => {
  let delay = 0;
  ["bonbast", "bonbast2", "navasan"].forEach(site => {
    setTimeout(() => window.open(directLinks[site], "_blank"), delay);
    delay += 800;
  });
});

// Auto-check TGJU on load
checkTgju();
