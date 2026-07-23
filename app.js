const WORKER_URL = "https://currency.digitalimarketingchannel.workers.dev/";

const directLinks = {
  bonbast: "https://bonbast.com/",
  bonbast2: "https://www.bon-bast.com/",
  navasan: "https://www.navasan.net/",
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
      const frameWrap = document.getElementById(`frame-${card.dataset.source}`);
      frameWrap.classList.toggle("active");

      if(frameWrap.classList.contains("active")) {
        setState(card, "Tap to close view", null);
        const iframe = frameWrap.querySelector("iframe");
        if(!iframe.src) iframe.src = directLinks[card.dataset.source];
      } else {
        setState(card, "Tap to view site inside app", null);
      }
    } 
  }); 
});

// Auto-check TGJU on load
checkTgju();
