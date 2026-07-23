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
  p.className = "price"; // reset
  if(kind) p.classList.add(kind); 
}

async function checkTgju(){ 
  const card = document.querySelector('[data-source="tgju"]'); 
  setState(card, "Checking...", "loading"); 
  try{ 
    const res = await fetch(`${WORKER_URL}?site=tgju&t=${Date.now()}`, {cache:"no-store"}); 
    const data = await res.json(); 
    if(!data.price) throw new Error(data.error || "No price found"); 
    setState(card, data.price, "success"); 
  } catch(e){ 
    setState(card, "Failed: tap to open", "error"); 
    card.onclick = () => window.open(directLinks.tgju, "_blank"); 
  }
}

document.querySelectorAll(".card").forEach(card => { 
  card.addEventListener("click", () => { 
    if(card.dataset.source === 'tgju') {
      checkTgju(); 
    } else { 
      const frameWrap = document.getElementById(`frame-${card.dataset.source}`);
      const isActive = frameWrap.classList.toggle("active");
      card.classList.toggle("active-card", isActive);

      if(isActive) {
        setState(card, "Tap to close", "opened");
        const iframe = frameWrap.querySelector("iframe");
        if(!iframe.src) iframe.src = directLinks[card.dataset.source];

        // Scroll to the card slightly for better view on iPhone
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        setState(card, "Tap to view site", null);
      }
    } 
  }); 
});

document.getElementById("loadAllBtn").addEventListener("click", () => {
  ["bonbast", "bonbast2", "navasan"].forEach(site => {
    const card = document.querySelector(`[data-source="${site}"]`);
    const frameWrap = document.getElementById(`frame-${site}`);
    if(!frameWrap.classList.contains("active")) {
      frameWrap.classList.add("active");
      card.classList.add("active-card");
      setState(card, "Tap to close", "opened");
      const iframe = frameWrap.querySelector("iframe");
      if(!iframe.src) iframe.src = directLinks[site];
    }
  });
});

// Auto-check TGJU on load
checkTgju();
