export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);
    const site = url.searchParams.get("site");
    const targets = {
      tgju: "https://www.tgju.org/currency",
      bonbast2: "https://www.bon-bast.com/",
      navasan: "https://www.navasan.net/",
      bonbast: "https://bonbast.com/",
    };

    if (!site || !targets[site]) {
      return new Response(JSON.stringify({ error: "Invalid or missing site param" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const result = await fetchSite(site);
      return new Response(JSON.stringify({ site, price: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ site, price: null, error: e.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  return await res.text();
}

async function fetchSite(site) {
  if (site === "bonbast2") {
    const html = await fetchText("https://www.bon-bast.com/");
    let m = html.match(/<h3>\s*Euro\s*<\/h3>[\s\S]{0,180}?font-bold">([\d,]+)/i);
    if (!m) m = html.match(/data-code="eur"[\s\S]{0,220}?font-bold">([\d,]+)/i);
    return m ? `${m[1]} Toman` : null;
  }

  if (site === "navasan") {
    const html = await fetchText("https://www.navasan.net/");
    let m = html.match(/data-code="eur_hav"[\s\S]{0,220}?class="price">\s*([\d,.]+)/i);
    if (!m) m = html.match(/data-code="eur"[\s\S]{0,220}?class="price">\s*([\d,.]+)/i);
    return m ? `${m[1]} Toman` : null;
  }

  if (site === "tgju") {
    const html = await fetchText("https://www.tgju.org/currency");
    let m = html.match(/price_eur[\s\S]{0,500}?([\d,]{5,9})/i);
    if (!m) m = html.match(/یورو[\s\S]{0,400}?([\d,]{5,9})/);
    return m ? `${m[1]} Rial` : null;
  }

  if (site === "bonbast") {
    return await fetchBonbast();
  }
}

async function fetchBonbast() {
  const html = await fetchText("https://bonbast.com/");
  let m = html.match(/Euro\/\s*IRR[\s\S]{0,80}?([\d,]{5,7})\s*Toman/i);
  if (m) return `${m[1]} Toman`;
  return null;
}
