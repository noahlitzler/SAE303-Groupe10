// Les quatre fonctions de visualisation du notebook Observable « SAE 303 — Gr 10 »
// (https://observablehq.com/d/227527a47a175959, cellules dessinerConstellation, dessinerCarte,
// dessinerTaches, dessinerImpact). Chacune reçoit ses données en paramètre et renvoie un élément DOM.
// Adaptations pour le site : dimensions resserrées pour les faces du cube, textes condensés,
// élément racine <figure> (au lieu de <section role="figure">) pour que la <figcaption> soit valide.

export function dessinerConstellation(donnees, {largeur = 900, zone, rayonMax, rayonMin = 12} = {}) {
  // zone (site) : {largeur, hauteur} réelles de la zone des sphères. La disposition et le rayon maximal
  // sont alors calculés pour cet espace ; la règle surface ∝ électricité est inchangée.
  // Composant autonome : reçoit ses données en paramètre (une ligne par configuration EcoLogits), sans bibliothèque.
  const lignes = donnees
    .filter(d => Number.isFinite(d.energie_milieu_Wh))
    .map(d => ({...d}))
    .sort((a, b) => b.energie_milieu_Wh - a.energie_milieu_Wh);
  const n = lignes.length;
  const noms = {openai: "OpenAI", anthropic: "Anthropic", google_genai: "Google", mistralai: "Mistral AI"};
  const fmt = v => new Intl.NumberFormat("fr-FR", {maximumSignificantDigits: 3}).format(v);
  const fmtRapport = r => r >= 10 ? new Intl.NumberFormat("fr-FR", {maximumSignificantDigits: 2}).format(r) : new Intl.NumberFormat("fr-FR", {maximumFractionDigits: 1}).format(r);
  const largeurSvg = largeur > 720 ? largeur - 64 - 276 : largeur - 30;
  const etroit = (zone?.largeur ?? largeurSvg) < 520;
  const W = Math.max(300, Math.round(zone?.largeur ?? largeurSvg));
  const H = zone ? Math.max(220, Math.round(zone.hauteur)) : (etroit ? 700 : 430);
  const rMax = rayonMax ?? (zone ? Math.round(Math.min((H - 40) * 0.42, W * 0.2)) : (etroit ? 78 : 112));
  const vMax = lignes[0].energie_milieu_Wh;
  const valeurs = lignes.map(d => d.energie_milieu_Wh).sort((a, b) => a - b);
  const mediane = n % 2 ? valeurs[(n - 1) / 2] : (valeurs[n / 2 - 1] + valeurs[n / 2]) / 2;
  const plusSobre = lignes[n - 1];
  // Une couleur par fournisseur : les modèles d'une même famille partagent leur teinte.
  const couleursFournisseurs = {google_genai: "#2878D0", anthropic: "#D46E15", openai: "#269A77", mistralai: "#C2408F"};
  const reserve = ["#9461CC", "#1A9BB0", "#A8861A", "#E8705A"];
  const fournisseurs = [...new Set(lignes.map(d => d.fournisseur))];
  const couleurDe = f => couleursFournisseurs[f] ?? reserve[fournisseurs.filter(x => !couleursFournisseurs[x]).indexOf(f) % reserve.length];
  lignes.forEach((d, k) => {
    d.couleur = couleurDe(d.fournisseur);
    d.rang = k + 1;
    d.id = `s${k}`;
  });

  // Disposition sans chevauchement : chaque sphère et son étiquette (placée dessous) forment une boîte,
  // séparée des autres par MARGE ; aucune variable n'est encodée par la position (relaxation déterministe).
  // Si les huit boîtes ne tiennent pas dans la zone, l'échelle commune rMax est réduite, pour toutes les
  // sphères à la fois : la règle surface ∝ électricité reste exacte, seul le rayon minimal d'affichage s'en écarte.
  // Étiquettes compactes (police réduite, marges serrées) seulement si rien ne tient autrement (zones très petites).
  let ETIQ, MARGE, CAR, compact;
  ({compact, ETIQ, MARGE, CAR} = {compact: false, ETIQ: 40, MARGE: 18, CAR: 3.4});
  // Demi-largeur de l'étiquette : ~6,1 px par caractère mesurés à 12,5 px, arrondis largement.
  const demiLargeur = d => Math.max(d.r, d.modele.length * CAR + 6);
  const boite = d => ({g: d.x - demiLargeur(d), dr: d.x + demiLargeur(d), h: d.y - d.r, b: d.y + d.r + ETIQ});
  const recouvrement = (a, b) => {
    const A = boite(a), B = boite(b);
    return [Math.min(A.dr, B.dr) - Math.max(A.g, B.g) + MARGE, Math.min(A.b, B.b) - Math.max(A.h, B.h) + MARGE];
  };
  const borner = d => {
    const dl = demiLargeur(d) + 6;
    d.x = Math.min(W - dl, Math.max(dl, d.x));
    d.y = Math.min(H - d.r - ETIQ - 6, Math.max(d.r + 6, d.y));
  };
  const disposer = (echelleR, depart = 0) => {
    lignes.forEach((d, k) => {
      // Surface proportionnelle à la consommation : r = rMax × √(v / vMax), avec un rayon minimal d'affichage.
      d.rReel = echelleR * Math.sqrt(d.energie_milieu_Wh / vMax);
      d.r = Math.max(rayonMin, d.rReel);
      const a = k * 2.399963 + depart; // angle d'or : point de départ organique
      const rr = 30 + 50 * Math.sqrt(k);
      // Avec une zone, le point de départ s'étale sur toute la largeur et la hauteur disponibles.
      d.x = W / 2 + rr * Math.cos(a) * (zone ? W / 380 : (etroit ? 0.7 : 1.5));
      d.y = H / 2 + rr * Math.sin(a) * (zone ? H / 330 : (etroit ? 1.4 : 0.85));
    });
    const attraction = zone ? 0.0008 : 0.002;
    for (let it = 0; it < 1200; it++) {
      for (const d of lignes) { d.x += (W / 2 - d.x) * attraction; d.y += (H / 2 - d.y) * attraction; }
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const a = lignes[i], b = lignes[j], [ix, iy] = recouvrement(a, b);
        if (ix > 0 && iy > 0) {
          // On pousse un peu plus que le recouvrement pour converger sans osciller.
          if (ix < iy) { const s = (a.x < b.x ? -1 : 1) * (ix / 2 + 0.5); a.x += s; b.x -= s; }
          else { const s = (a.y < b.y ? -1 : 1) * (iy / 2 + 0.5); a.y += s; b.y -= s; }
        }
      }
      lignes.forEach(borner);
    }
    // Vrai s'il ne reste aucun recouvrement une fois les sphères ramenées dans la zone.
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const [ix, iy] = recouvrement(lignes[i], lignes[j]);
      if (ix > 0.5 && iy > 0.5) return false;
    }
    return true;
  };
  // Plusieurs points de départ (rotations de la spirale) : une relaxation bloquée n'entraîne pas de réduction inutile.
  const DEPARTS = [0, 1.1, 2.3, 3.6, 4.8];
  const essayer = echelleR => DEPARTS.find(depart => disposer(echelleR, depart));
  // Recherche dichotomique de la plus grande échelle commune pour laquelle tout tient sans chevauchement.
  // Renvoie l'échelle retenue et le départ qui l'a permise (départ undefined : rien ne tient).
  const chercher = () => {
    const depart0 = essayer(rMax);
    if (depart0 !== undefined) return {echelle: rMax, depart: depart0};
    let bas = rMax * 0.12, haut = rMax;
    let departRetenu = essayer(bas);
    if (departRetenu !== undefined) {
      for (let k = 0; k < 9; k++) {
        const milieu = (bas + haut) / 2, depart = essayer(milieu);
        if (depart === undefined) haut = milieu;
        else { bas = milieu; departRetenu = depart; }
      }
    }
    return {echelle: bas, depart: departRetenu};
  };
  const NORMAL = {compact: false, ETIQ: 40, MARGE: 18, CAR: 3.4}, COMPACT = {compact: true, ETIQ: 30, MARGE: 10, CAR: 2.75};
  const regler = p => ({compact, ETIQ, MARGE, CAR} = p);
  let choix = chercher(), reglage = NORMAL;
  // Étiquettes normales : rien ne tient, ou seulement avec de très petites sphères → on essaie les compactes.
  if (choix.depart === undefined || choix.echelle < rMax * 0.5) {
    regler(COMPACT);
    const autre = chercher();
    if (autre.depart !== undefined && (choix.depart === undefined || autre.echelle > choix.echelle * 1.25)) { choix = autre; reglage = COMPACT; }
  }
  regler(reglage);
  // Même à petite échelle rien ne tient (zone minuscule) : on garde le meilleur effort à cette échelle.
  disposer(choix.echelle, choix.depart ?? 0);
  const agrandies = lignes.filter(d => d.r > d.rReel + 0.01);

  const ns = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(ns, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (parent) parent.append(e); return e; };

  const racine = document.createElement("figure");
  racine.className = "dlp-constellation";
  const style = document.createElement("style");
  style.textContent = `
    .dlp-constellation{--texte:#1f2328;--texte2:#5b616b;--bord:#e5e3dd;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--texte);background:#fbfaf7;border:1px solid var(--bord);border-radius:16px;padding:12px clamp(12px,2vw,22px) 10px;width:100%;max-width:none;box-sizing:border-box;position:relative}
    .dlp-constellation *{box-sizing:border-box}
    .dlp-constellation h3{margin:0 0 4px;font-size:clamp(20px,2.4vw,26px);line-height:1.2;font-weight:750}
    .dlp-constellation .st{margin:0 0 5px;font-size:14px;line-height:1.5;color:var(--texte2);max-width:66ch}
    .dlp-constellation .barre-outils{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 4px;font-size:12.5px;color:var(--texte2)}
    .dlp-constellation .sphere:focus-visible{outline:none}
    .dlp-constellation .legende-f{display:flex;flex-wrap:wrap;gap:4px 14px;color:var(--texte)}
    .dlp-constellation .legende-f i{display:inline-block;width:11px;height:11px;border-radius:50%;margin-right:5px;vertical-align:-1px;opacity:.85}
    .dlp-constellation .scene{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:12px;align-items:center}
    @media (max-width:720px){.dlp-constellation .scene{grid-template-columns:1fr}}
    .dlp-constellation svg{width:100%;height:auto;display:block;overflow:visible}
    .dlp-constellation .sphere{cursor:pointer}
    .dlp-constellation .corps{transform-box:fill-box;transform-origin:center;animation:dlp-entree .9s cubic-bezier(.2,.9,.25,1.15) both;animation-delay:var(--delai)}
    .dlp-constellation .halo{opacity:0;transition:opacity .35s}
    .dlp-constellation .sphere:hover .halo,.dlp-constellation .sphere:focus-visible .halo{opacity:.35}
    .dlp-constellation .sphere .contour{transition:stroke-width .3s,stroke-opacity .3s}
    .dlp-constellation .sphere .etiq{font-size:12.5px;font-weight:650;fill:var(--texte);paint-order:stroke;stroke:#fbfaf7;stroke-width:4px;stroke-linejoin:round}
    .dlp-constellation .sphere .etiq2{font-size:11px;fill:var(--texte2);paint-order:stroke;stroke:#fbfaf7;stroke-width:4px}
    .dlp-constellation .sphere .corps>circle{transition:opacity .35s}
    .dlp-constellation.choix .sphere:not(.actif) .contour{opacity:.45}
    .dlp-constellation.choix .sphere:not(.actif) .etiq{fill:#3a4462}
    .dlp-constellation .sphere:focus{outline:none}
    .dlp-constellation .sphere.actif .contour{stroke-width:3.5;stroke-opacity:1}
    .dlp-constellation .sphere.actif .halo{opacity:.55}
    .dlp-constellation .sphere:focus-visible .contour{stroke:#18203a;stroke-width:3}
    .dlp-constellation .particule{fill:#b9b6ad;opacity:.35}
    @keyframes dlp-entree{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
    @media (prefers-reduced-motion:reduce){.dlp-constellation *{animation:none!important;transition:none!important}}
    .dlp-constellation .fiche{background:#fff;border:1px solid var(--bord);border-radius:14px;padding:16px 16px 14px;box-shadow:0 8px 24px -18px rgba(31,35,40,.35);transition:opacity .25s,transform .25s}
    .dlp-constellation .fiche.change{opacity:0;transform:translateY(6px)}
    .dlp-constellation .fiche .f-four{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--texte2);margin:0}
    .dlp-constellation .fiche .f-nom{font-size:18px;font-weight:750;margin:2px 0 8px;word-break:break-word}
    .dlp-constellation .fiche .f-val{font-size:34px;font-weight:780;line-height:1;font-variant-numeric:tabular-nums;margin:0}
    .dlp-constellation .fiche .f-val small{font-size:14px;font-weight:600;color:var(--texte2);margin-left:4px}
    .dlp-constellation .fiche .f-int{font-size:12.5px;color:var(--texte2);margin:6px 0 10px}
    .dlp-constellation .fiche .f-situ{font-size:13px;line-height:1.5;margin:0;border-top:1px dashed var(--bord);padding-top:9px}
    .dlp-constellation .bulle{position:absolute;pointer-events:none;background:#fff;color:var(--texte);border:1px solid #cfccc4;box-shadow:0 6px 18px rgba(0,0,0,.12);border-radius:9px;padding:6px 9px;font-size:12.5px;line-height:1.35;opacity:0;transition:opacity .15s;z-index:3;white-space:nowrap}
    .dlp-constellation .conclusion{margin:6px 0 0;padding:8px 12px;border-left:4px solid #2878D0;background:#fff;border-radius:0 10px 10px 0;font-size:14.5px;line-height:1.5}
    .dlp-constellation .note{margin:5px 0 0;font-size:12.5px;line-height:1.5;color:var(--texte2);max-width:85ch}
    .dlp-constellation figcaption{margin-top:8px;font-size:11.5px;line-height:1.45;color:var(--texte2)}
  `;
  const titre = document.createElement("h3");
  titre.textContent = "Toutes les IA ne consomment pas autant";
  const st = document.createElement("p");
  st.className = "st";
  st.textContent = `Une sphère par configuration d'IA : sa surface suit l'électricité estimée pour une même réponse de 150 tokens. Cliquez sur une sphère pour l'explorer.`;
  const outils = document.createElement("div");
  outils.className = "barre-outils";
  const consigne = document.createElement("span");
  consigne.textContent = "Surface ∝ Wh estimés · position décorative";
  const legendeF = document.createElement("span");
  legendeF.className = "legende-f";
  legendeF.innerHTML = fournisseurs.map(f => `<span><i style="background:${couleurDe(f)}"></i>${noms[f] ?? f}</span>`).join("");
  outils.append(consigne, legendeF);

  const scene = document.createElement("div");
  scene.className = "scene";
  // Avec une zone, le repère SVG est exactement celui de la zone (1 unité = 1 px) : aucun recadrage ultérieur.
  const haut = zone ? 0 : Math.min(...lignes.map(d => d.y - d.r * 1.15)) - 24, bas = zone ? H : Math.max(...lignes.map(d => d.y + d.r + ETIQ)) + 24;
  const svg = el("svg", {viewBox: `0 ${haut.toFixed(0)} ${W} ${(bas - haut).toFixed(0)}`, role: "group", "aria-label": `Constellation de ${n} configurations d'IA, taille proportionnelle à l'électricité estimée par requête`});
  const defs = el("defs", {}, svg);
  const filtre = el("filter", {id: "dlp-flou", x: "-50%", y: "-50%", width: "200%", height: "200%"}, defs);
  el("feGaussianBlur", {stdDeviation: "10"}, filtre);
  let graine = 7;
  const alea = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
  const fondParticules = el("g", {"aria-hidden": "true"}, svg);
  for (let k = 0; k < 24; k++) {
    const p = el("circle", {class: "particule", cx: (alea() * W).toFixed(1), cy: (haut + alea() * (bas - haut)).toFixed(1), r: (0.8 + alea() * 1.8).toFixed(2)}, fondParticules);
  }
  const groupes = lignes.map((d, k) => {
    const grad = el("radialGradient", {id: `dlp-g-${d.id}`, cx: "35%", cy: "30%", r: "75%"}, defs);
    el("stop", {offset: "0%", "stop-color": "#ffffff", "stop-opacity": "0.95"}, grad);
    el("stop", {offset: "55%", "stop-color": d.couleur, "stop-opacity": "0.28"}, grad);
    el("stop", {offset: "100%", "stop-color": d.couleur, "stop-opacity": "0.55"}, grad);
    const g = el("g", {class: "sphere", tabindex: "0", role: "button", "aria-label": `${d.modele} ${fmt(d.energie_milieu_Wh)} Wh par requête (${noms[d.fournisseur] ?? d.fournisseur})`, transform: `translate(${d.x.toFixed(1)},${d.y.toFixed(1)})`}, svg);
    g.dataset.modele = d.modele;
    const corps = el("g", {class: "corps"}, g);
    corps.style.setProperty("--delai", `${(k * 0.12).toFixed(2)}s`);
    el("circle", {class: "halo", r: (d.r * 1.08).toFixed(1), fill: d.couleur, filter: "url(#dlp-flou)"}, corps);
    el("circle", {class: "contour", r: d.r.toFixed(1), fill: `url(#dlp-g-${d.id})`, stroke: d.couleur, "stroke-width": "2", "stroke-opacity": "0.9"}, corps);
    el("circle", {r: Math.max(8, d.r).toFixed(1), fill: "transparent"}, corps);
    const t1 = el("text", {class: "etiq", "aria-hidden": "true", "text-anchor": "middle", y: (d.r + (compact ? 13 : 17)).toFixed(1)}, corps);
    if (compact) t1.style.fontSize = "10px";
    t1.textContent = d.modele;
    const t2 = el("text", {class: "etiq2", "aria-hidden": "true", "text-anchor": "middle", y: (d.r + (compact ? 25 : 32)).toFixed(1)}, corps);
    if (compact) t2.style.fontSize = "9.5px";
    t2.textContent = `${fmt(d.energie_milieu_Wh)} Wh`;
    return {d, g};
  });
  const fiche = document.createElement("div");
  fiche.className = "fiche";
  fiche.setAttribute("aria-live", "polite");
  scene.append(svg, fiche);

  const bulle = document.createElement("div");
  bulle.className = "bulle";
  bulle.setAttribute("aria-hidden", "true");

  const rapportExtremes = lignes[0].energie_milieu_Wh / plusSobre.energie_milieu_Wh;
  const conclusion = document.createElement("p");
  conclusion.className = "conclusion";
  conclusion.textContent = `Pour un même texte généré : de ${fmt(plusSobre.energie_milieu_Wh)} Wh (${plusSobre.modele}) à ${fmt(lignes[0].energie_milieu_Wh)} Wh (${lignes[0].modele}), soit environ ${fmtRapport(rapportExtremes)} fois plus.`;
  const note = document.createElement("p");
  note.className = "note";
  note.textContent = `Point milieu des estimations EcoLogits, pas des mesures. ${agrandies.length ? `${agrandies.length === 1 ? "La plus petite sphère est agrandie" : `Les ${agrandies.length} plus petites sphères sont agrandies`} à ${rayonMin} px de rayon pour rester cliquables (surface réelle jusqu'à ${fmtRapport(Math.max(...agrandies.map(d => (d.r / d.rReel) ** 2)))} fois plus petite).` : ""}`;
  const source = document.createElement("figcaption");
  source.textContent = "Source : EcoLogits, estimations du 19/10/2026 · 150 tokens générés, mix électrique mondial · Wh par requête.";

  const afficherFiche = d => {
    const rapportMed = d.energie_milieu_Wh / mediane;
    const rapportSobre = d.energie_milieu_Wh / plusSobre.energie_milieu_Wh;
    fiche.classList.add("change");
    setTimeout(() => {
      fiche.innerHTML = `<p class="f-four">${noms[d.fournisseur] ?? d.fournisseur ?? ""}</p><p class="f-nom">${d.modele}</p><p class="f-val">${fmt(d.energie_milieu_Wh)}<small>Wh / requête</small></p><p class="f-int">Estimation : de ${fmt(d.energie_min_Wh)} à ${fmt(d.energie_max_Wh)} Wh</p><p class="f-situ">Rang ${d.rang} sur ${n}, du plus au moins énergivore.<br>${d === plusSobre ? "C'est la configuration la plus sobre de notre sélection." : `Environ ${fmtRapport(rapportSobre)} fois la plus sobre (${plusSobre.modele}).`}<br>${rapportMed >= 1 ? `${fmtRapport(rapportMed)} fois la médiane (${fmt(mediane)} Wh).` : `${fmtRapport(1 / rapportMed)} fois moins que la médiane (${fmt(mediane)} Wh).`}</p>`;
      fiche.classList.remove("change");
    }, 180);
  };
  const choisir = m => {
    racine.classList.add("choix");
    for (const {d, g} of groupes) g.classList.toggle("actif", d.modele === m);
    const d = lignes.find(x => x.modele === m);
    if (d) { afficherFiche(d); racine.dataset.modele = m; }
  };
  for (const {d, g} of groupes) {
    g.addEventListener("click", () => choisir(d.modele));
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choisir(d.modele); } });
    const montrer = () => {
      bulle.textContent = `${d.modele} · ${fmt(d.energie_milieu_Wh)} Wh`;
      const r = g.getBoundingClientRect(), rr = racine.getBoundingClientRect();
      bulle.style.left = `${Math.max(6, Math.min(rr.width - 200, r.left - rr.left + r.width / 2 - 70))}px`;
      bulle.style.top = `${Math.max(6, r.top - rr.top - 34)}px`;
      bulle.style.opacity = "1";
    };
    g.addEventListener("mouseenter", montrer); g.addEventListener("focus", montrer);
    g.addEventListener("mouseleave", () => (bulle.style.opacity = "0")); g.addEventListener("blur", () => (bulle.style.opacity = "0"));
  }

  racine.setAttribute("aria-label", `Constellation de ${n} configurations d'IA dont la surface est proportionnelle à l'électricité estimée par requête de 150 tokens. ${conclusion.textContent}`);
  racine.append(style, titre, st, outils, scene, conclusion, note, source, bulle);
  racine.choisir = choisir;
  racine.spheres = groupes.map(({d}) => ({modele: d.modele, valeur: d.energie_milieu_Wh, rayon: d.r, rayonReel: d.rReel, x: d.x, y: d.y}));
  choisir(lignes[0].modele);
  return racine;
}

export function dessinerCarte(installations, {L, consommationsZones = null, entreesTotal = null, cssLeaflet = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css", hauteur = 460} = {}) {
  // Composant autonome : reçoit les installations et la bibliothèque Leaflet (L) en paramètres.
  // consommationsZones (facultatif) : Map ou objet {cleZone: {valeur, unite, annee, zone}} ; clé = installation.zone_conso.
  if (!L) throw new Error("dessinerCarte : la bibliothèque Leaflet doit être passée dans l'option L.");
  if (cssLeaflet && !document.querySelector(`link[href="${cssLeaflet}"]`)) {
    const lien = document.createElement("link"); lien.rel = "stylesheet"; lien.href = cssLeaflet; document.head.append(lien);
  }
  const ORANGE = "#D46E15", GRIS = "#6B7280";
  const fmt = v => new Intl.NumberFormat("fr-FR", {maximumSignificantDigits: 3}).format(v);
  const conso = i => {
    if (!consommationsZones || i.zone_conso == null) return null;
    return (consommationsZones instanceof Map ? consommationsZones.get(i.zone_conso) : consommationsZones[i.zone_conso]) ?? null;
  };
  const points = installations.filter(i => Number.isFinite(i.latitude) && Number.isFinite(i.longitude));
  const estIdf = i => i.region === "Île-de-France";
  const nbAvecConso = points.filter(i => conso(i)).length;

  const racine = document.createElement("figure");
  racine.className = "dlp-carte";
  const style = document.createElement("style");
  style.textContent = `
    .dlp-carte{--texte:#1f2328;--texte2:#5b616b;--bord:#e5e3dd;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--texte);background:#fbfaf7;border:1px solid var(--bord);border-radius:16px;padding:12px clamp(12px,2vw,22px) 10px;width:100%;max-width:none;box-sizing:border-box}
    .dlp-carte *{box-sizing:border-box}
    .dlp-carte h3{margin:0 0 4px;font-size:clamp(20px,2.4vw,26px);line-height:1.2;font-weight:750}
    .dlp-carte .st{margin:0 0 16px;font-size:14px;line-height:1.5;color:var(--texte2);max-width:70ch}
    .dlp-carte .cartes{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    @media (max-width:760px){.dlp-carte .cartes{grid-template-columns:1fr}}
    .dlp-carte .bloc h4{margin:0 0 6px;font-size:15px;font-weight:700}
    .dlp-carte .bloc h4 span{font-weight:400;color:var(--texte2);font-size:13px}
    .dlp-carte .fond{height:${hauteur}px;border-radius:10px;border:1px solid var(--bord);overflow:hidden;background:#e8e6e1}
    .dlp-carte .legende{display:flex;flex-wrap:wrap;gap:8px 22px;align-items:center;margin:12px 0 0;font-size:13px}
    .dlp-carte .legende i{display:inline-block;width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35);margin-right:6px;vertical-align:-1px}
    .dlp-carte .note,.dlp-carte .conclusion{margin:12px 0 0;font-size:13.5px;line-height:1.55;max-width:80ch}
    .dlp-carte .conclusion{padding:10px 14px;border-left:4px solid ${ORANGE};background:#fff;border-radius:0 10px 10px 0}
    .dlp-carte figcaption{margin-top:10px;font-size:11.5px;line-height:1.45;color:var(--texte2)}
    .dlp-carte .leaflet-popup-content{margin:10px 12px;font-size:12.5px;line-height:1.45;color:#1f2328}
    .dlp-carte .leaflet-popup-content strong{font-size:13.5px}
    .dlp-carte .leaflet-container img.leaflet-tile{max-width:none!important;max-height:none!important;border:0!important;margin:0!important;padding:0!important}
  `;
  const titre = document.createElement("h3");
  titre.textContent = "Le numérique a une adresse";
  const intro = document.createElement("p");
  intro.className = "st";
  intro.textContent = "Derrière chaque requête, des bâtiments bien réels. Chaque point : une installation de notre sélection, à l'emplacement vérifié.";

  const cartes = document.createElement("div");
  cartes.className = "cartes";
  const bloc = (t, n) => {
    const b = document.createElement("div"); b.className = "bloc";
    const h = document.createElement("h4"); h.innerHTML = `${t} <span>· ${n} installation${n > 1 ? "s" : ""}</span>`;
    const f = document.createElement("div"); f.className = "fond";
    b.append(h, f); cartes.append(b); return f;
  };
  const fondFrance = bloc("France métropolitaine", points.length);
  const pointsIdf = points.filter(estIdf);
  const fondIdf = bloc("Île-de-France", pointsIdf.length);

  const legende = document.createElement("p");
  legende.className = "legende";
  legende.innerHTML = `<span><i style="background:${ORANGE}"></i>Avec donnée électrique de zone (${nbAvecConso})</span><span><i style="background:${GRIS}"></i>Sans donnée électrique de zone (${points.length - nbAvecConso})</span><span style="color:var(--texte2)">Cliquez sur un point ; les points superposés s'ouvrent en éventail.</span>`;

  const parVille = Object.entries(points.reduce((acc, i) => ((acc[i.ville] = (acc[i.ville] ?? 0) + 1), acc), {})).sort((a, b) => b[1] - a[1]);
  const regions = new Set(points.map(i => i.region));
  const conclusion = document.createElement("p");
  conclusion.className = "conclusion";
  const villesMulti = parVille.filter(([, n]) => n > 1).map(([v, n]) => `${v} (${n})`);
  const horsIdf = points.filter(i => !estIdf(i));
  const parRegion = Object.values(horsIdf.reduce((acc, i) => ((acc[i.region] = (acc[i.region] ?? 0) + 1), acc), {}));
  const nbRegions = parRegion.length;
  conclusion.textContent = `${pointsIdf.length} des ${points.length} installations sont en Île-de-France${villesMulti.length ? `, dont ${villesMulti.join(", ")}` : ""} ; les ${horsIdf.length} autres, dans ${nbRegions} région${nbRegions > 1 ? "s" : ""}${parRegion.every(n => n === 1) ? ", une chacune" : ""}.`;

  const note = document.createElement("p");
  note.className = "note";
  note.textContent = (entreesTotal ? `${points.length} des ${entreesTotal} entrées de notre fichier ont un emplacement vérifié et sont affichées. ` : "") +
    (consommationsZones ? "Consommation de toute la zone, pas celle du centre. " : "Aucune donnée de consommation par zone : tous les points sont gris. ") +
    "Sélection documentée, non exhaustive ; elle n'indique pas où sont traitées les requêtes d'IA.";
  const source = document.createElement("figcaption");
  source.textContent = "Sources : Datacenters France v2 (OpenStreetMap, vérifié les 19 et 20/10/2026) · fond de carte © contributeurs OpenStreetMap (ODbL).";

  racine.setAttribute("aria-label", `Deux cartes interactives : la France métropolitaine avec ${points.length} installations localisées et un zoom sur l'Île-de-France avec ${pointsIdf.length} installations. ${conclusion.textContent}`);
  racine.append(style, titre, intro, cartes, legende, conclusion, note, source);

  const popup = i => {
    const c = conso(i);
    const lignes = [
      `<strong>${i.nom ?? "Centre sans nom"}</strong>`,
      i.exploitant ? `Exploitant : ${i.exploitant}` : null,
      i.adresse ? `${i.adresse}` : (i.ville ? i.ville : null),
      i.region ? `Région : ${i.region}` : null,
      c ? `Consommation électrique de la zone${c.zone ? " (" + c.zone + ")" : ""} : ${fmt(c.valeur)} ${c.unite}${c.annee ? ", " + c.annee : ""}<br><em>Consommation de toute la zone, pas celle du centre.</em>` : "Donnée électrique : aucune donnée de zone correspondante",
      i.precision ? `<span style="color:#5b616b">Localisation : ${i.precision.replace(/_/g, " ")}</span>` : null
    ];
    return lignes.filter(Boolean).join("<br>");
  };

  const creerCarte = (fond, liste, vue) => {
    const carte = L.map(fond, {scrollWheelZoom: false, zoomControl: true, attributionControl: true, zoomSnap: 0.25, zoomDelta: 0.5});
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom: 19, detectRetina: true, attribution: "© contributeurs OpenStreetMap"}).addTo(carte);
    const calque = L.layerGroup().addTo(carte);
    const eventail = L.layerGroup().addTo(carte);
    const marqueurs = liste.map(i => {
      const m = L.circleMarker([i.latitude, i.longitude], {radius: 6, color: "#ffffff", weight: 1.5, fillColor: conso(i) ? ORANGE : GRIS, fillOpacity: 0.95});
      m.installation = i;
      m.on("click", e => { L.DomEvent.stopPropagation(e); ouvrirOuEventail(m); });
      m.on("mouseover", () => m.setStyle({radius: 8})); m.on("mouseout", () => m.setStyle({radius: 6}));
      m.addTo(calque);
      return m;
    });
    const fermerEventail = () => { eventail.clearLayers(); marqueurs.forEach(m => m.setStyle({opacity: 1, fillOpacity: 0.95})); };
    const ouvrirOuEventail = m => {
      const p = carte.latLngToLayerPoint(m.getLatLng());
      const voisins = marqueurs.filter(x => carte.latLngToLayerPoint(x.getLatLng()).distanceTo(p) < 14);
      if (voisins.length < 2) { fermerEventail(); L.popup({maxWidth: 240, autoPanPadding: [16, 16]}).setLatLng(m.getLatLng()).setContent(popup(m.installation)).openOn(carte); return; }
      fermerEventail();
      const centre = voisins.map(x => carte.latLngToLayerPoint(x.getLatLng())).reduce((a, b) => a.add(b)).divideBy(voisins.length);
      const rayon = 26 + voisins.length * 4;
      voisins.forEach((x, k) => {
        const angle = (2 * Math.PI * k) / voisins.length - Math.PI / 2;
        const cible = carte.layerPointToLatLng(L.point(centre.x + rayon * Math.cos(angle), centre.y + rayon * Math.sin(angle)));
        L.polyline([x.getLatLng(), cible], {color: "#1f2328", weight: 1, opacity: 0.6, interactive: false}).addTo(eventail);
        const copie = L.circleMarker(cible, {radius: 7, color: "#ffffff", weight: 2, fillColor: x.options.fillColor, fillOpacity: 1});
        copie.bindPopup(popup(x.installation), {maxWidth: 240, autoPanPadding: [16, 16]});
        copie.on("click", e => { L.DomEvent.stopPropagation(e); copie.openPopup(); });
        copie.bindTooltip(x.installation.nom ?? "", {direction: "top", offset: [0, -6]});
        copie.addTo(eventail);
        x.setStyle({opacity: 0.25, fillOpacity: 0.25});
      });
    };
    carte.on("click zoomstart", fermerEventail);
    const ajuster = () => vue.bounds ? carte.fitBounds(vue.bounds, {padding: [24, 24], maxZoom: vue.maxZoom ?? 12}) : carte.setView(vue.centre, vue.zoom);
    ajuster();
    let premier = true;
    new ResizeObserver(() => { carte.invalidateSize(); if (premier && fond.clientWidth > 0) { premier = false; ajuster(); } }).observe(fond);
    return carte;
  };
  const boundsIdf = pointsIdf.length ? L.latLngBounds(pointsIdf.map(i => [i.latitude, i.longitude])) : null;
  racine.cartes = {
    france: creerCarte(fondFrance, points, {bounds: L.latLngBounds([[42.3, -4.8], [51.1, 8.2]])}),
    idf: creerCarte(fondIdf, pointsIdf, boundsIdf ? {bounds: boundsIdf, maxZoom: 13} : {centre: [48.86, 2.35], zoom: 10})
  };
  racine.dataset.points = String(points.length);
  return racine;
}

export function dessinerTaches(donnees, {campagne = "Février 2025", echelle = "log", comparaison = ["Génération d'images", "Génération de texte"]} = {}) {
  // Composant autonome : un seul classement, bascule animée entre échelle logarithmique et linéaire.
  const couleurs = ["#2878D0", "#D46E15", "#269A77", "#9461CC", "#D95774", "#1A9BB0", "#A8861A", "#5A6FD6", "#6E9E3A", "#B0663A"];
  const fmt = v => new Intl.NumberFormat("fr-FR", {maximumSignificantDigits: v >= 0.1 ? 2 : 2}).format(v);
  const lignes = donnees.filter(d => d.campagne === campagne).sort((a, b) => b.mediane_Wh_req - a.mediane_Wh_req);
  const meds = lignes.map(d => d.mediane_Wh_req);
  const lo = 10 ** Math.floor(Math.log10(Math.min(...meds)));
  const hi = 10 ** Math.ceil(Math.log10(Math.max(...meds)));
  const pasLin = (() => { const m = Math.max(...meds) / 4, p = 10 ** Math.floor(Math.log10(m)); return [1, 2, 2.5, 5, 10].map(k => k * p).find(s => s >= m); })();
  const hiLin = Math.ceil(Math.max(...meds) * 1.08 / pasLin) * pasLin;
  const pos = (v, e) => e === "log" ? 100 * (Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)) : 100 * v / hiLin;
  const graduations = e => {
    if (e === "log") { const t = []; for (let x = lo; x <= hi * 1.0001; x *= 10) t.push(x); return t; }
    const t = []; for (let x = 0; x <= hiLin + 1e-12; x += pasLin) t.push(+x.toPrecision(6)); return t;
  };

  const racine = document.createElement("figure");
  racine.className = "dlp-taches";
  const style = document.createElement("style");
  style.textContent = `
    .dlp-taches{--fond:#fbfaf7;--texte:#1f2328;--texte2:#5b616b;--bord:#e5e3dd;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--texte);background:var(--fond);border:1px solid var(--bord);border-radius:16px;padding:12px clamp(12px,2vw,22px) 10px;width:100%;max-width:none;box-sizing:border-box;position:relative}
    .dlp-taches *{box-sizing:border-box}
    .dlp-taches h3{margin:0 0 4px;font-size:clamp(20px,2.4vw,26px);line-height:1.2;font-weight:750;letter-spacing:-.01em}
    .dlp-taches .st{margin:0 0 16px;font-size:14px;line-height:1.5;color:var(--texte2);max-width:64ch}
    .dlp-taches .bascule{display:inline-flex;background:#efede8;border-radius:999px;padding:3px;margin:0 0 8px}
    .dlp-taches .bascule button{font:inherit;font-size:13px;border:0;background:transparent;color:var(--texte);padding:7px 14px;border-radius:999px;cursor:pointer;transition:background .25s,color .25s}
    .dlp-taches .bascule button[aria-pressed="true"]{background:var(--texte);color:#fff}
    .dlp-taches .bascule button:focus-visible{outline:3px solid #2878D0;outline-offset:2px}
    .dlp-taches .explication{margin:0 0 14px;font-size:13px;line-height:1.5;color:var(--texte2);min-height:2.9em;max-width:72ch}
    .dlp-taches .graphe{display:grid;grid-template-columns:minmax(118px,190px) 1fr minmax(76px,auto);column-gap:12px;row-gap:9px;align-items:center;position:relative}
    .dlp-taches .nom{font-size:13.5px;text-align:right;line-height:1.2}
    .dlp-taches .piste{position:relative;height:22px}
    .dlp-taches .barre{position:absolute;left:0;top:0;bottom:0;border-radius:0 5px 5px 0;min-width:3px;transition:width .9s cubic-bezier(.2,.8,.2,1)}
    .dlp-taches .ligne{display:contents}
    .dlp-taches .piste:focus-visible{outline:3px solid #2878D0;outline-offset:3px;border-radius:4px}
    .dlp-taches .val{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}
    .dlp-taches .grille{grid-column:2;position:relative;align-self:stretch;pointer-events:none;z-index:0}
    .dlp-taches .piste{z-index:1}
    .dlp-taches .grille i{position:absolute;top:-4px;bottom:-4px;width:1px;background:#e5e3dd;transition:left .9s cubic-bezier(.2,.8,.2,1),opacity .4s}
    .dlp-taches .axe{grid-column:2;position:relative;height:30px;font-size:11.5px;color:var(--texte2)}
    .dlp-taches .axe span{position:absolute;top:2px;transform:translateX(-50%);white-space:nowrap;transition:left .9s cubic-bezier(.2,.8,.2,1),opacity .4s}
    .dlp-taches .axe .titre-axe{position:absolute;right:0;top:16px;transform:none}
    .dlp-taches .conclusion{margin:18px 0 0;padding:12px 14px;border-left:4px solid #D46E15;background:#fff;border-radius:0 10px 10px 0;font-size:14.5px;line-height:1.5}
    .dlp-taches figcaption{margin-top:10px;font-size:11.5px;line-height:1.45;color:var(--texte2)}
    .dlp-taches .bulle{position:absolute;z-index:5;pointer-events:none;background:#fff;color:var(--texte);border:1px solid #cfccc4;box-shadow:0 6px 20px rgba(0,0,0,.12);border-radius:10px;padding:9px 11px;font-size:12.5px;line-height:1.45;max-width:260px;opacity:0;transition:opacity .15s}
    @media (max-width:520px){.dlp-taches .axe span.sec{opacity:0}.dlp-taches .graphe{grid-template-columns:minmax(96px,120px) 1fr auto;column-gap:8px}.dlp-taches .nom{font-size:12px}}
    @media (prefers-reduced-motion:reduce){.dlp-taches *{transition:none!important}}
  `;
  const titre = document.createElement("h3");
  titre.textContent = "Une tâche, un impact";
  const sousTitre = document.createElement("p");
  sousTitre.className = "st";
  sousTitre.textContent = `Énergie GPU médiane par requête pour ${lignes.length} tâches d'IA (AI Energy Score, ${campagne.toLowerCase()}) : des écarts considérables.`;
  const bascule = document.createElement("div");
  bascule.className = "bascule";
  bascule.setAttribute("role", "group");
  bascule.setAttribute("aria-label", "Choix de l'échelle");
  const boutons = {};
  for (const [cle, txt] of [["log", "Échelle logarithmique"], ["lin", "Échelle linéaire"]]) {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = txt; b.dataset.echelle = cle;
    b.addEventListener("click", () => appliquer(cle));
    boutons[cle] = b; bascule.append(b);
  }
  const explication = document.createElement("p");
  explication.className = "explication";
  explication.setAttribute("aria-live", "polite");

  const graphe = document.createElement("div");
  graphe.className = "graphe";
  const grille = document.createElement("div");
  grille.className = "grille";
  const bulle = document.createElement("div");
  bulle.className = "bulle";
  bulle.setAttribute("aria-hidden", "true");
  const elements = lignes.map((d, k) => {
    const ligne = document.createElement("div");
    ligne.className = "ligne";
    ligne.dataset.tache = d.tache;
    const etiquette = ( `${d.tache} : ${fmt(d.mediane_Wh_req)} Wh par requête (médiane de ${d.n_evaluations} évaluations)`);
    const nom = document.createElement("div"); nom.className = "nom"; nom.textContent = d.tache;
    const piste = document.createElement("div"); piste.className = "piste"; piste.tabIndex = 0; piste.setAttribute("role", "img"); piste.setAttribute("aria-label", etiquette);
    const barre = document.createElement("div"); barre.className = "barre"; barre.style.background = couleurs[k % couleurs.length]; barre.style.width = "0%";
    piste.append(barre);
    const val = document.createElement("div"); val.className = "val"; val.textContent = `${fmt(d.mediane_Wh_req)} Wh`;
    [nom, piste, val].forEach((el, col) => { el.style.gridRow = String(k + 1); el.style.gridColumn = String(col + 1); });
    ligne.append(nom, piste, val);
    const montrer = () => {
      bulle.innerHTML = `<strong>${d.tache}</strong><br>Médiane : ${fmt(d.mediane_Wh_req)} Wh par requête<br>Moyenne : ${fmt(d.moyenne_Wh_req)} Wh<br>Évaluations : de ${fmt(d.min_Wh_req)} à ${fmt(d.max_Wh_req)} Wh<br>${d.n_evaluations} modèles évalués · ${d.campagne}${d.origine_campagne && d.origine_campagne !== "date du CSV" ? " (campagne indiquée par le leaderboard)" : ""}`;
      const r = piste.getBoundingClientRect(), rr = racine.getBoundingClientRect();
      bulle.style.left = `${Math.min(rr.width - 270, Math.max(8, r.left - rr.left + 20))}px`;
      bulle.style.top = `${r.bottom - rr.top + 6}px`;
      bulle.style.opacity = "1";
    };
    const cacher = () => (bulle.style.opacity = "0");
    for (const el of [nom, piste, val]) { el.addEventListener("mouseenter", montrer); el.addEventListener("mouseleave", cacher); }
    piste.addEventListener("focus", montrer); piste.addEventListener("blur", cacher);
    graphe.append(ligne);
    return {d, barre};
  });
  const axe = document.createElement("div");
  axe.className = "axe";
  grille.style.gridRow = `1 / span ${lignes.length}`;
  axe.style.gridRow = String(lignes.length + 1);
  graphe.append(grille, axe);

  const [a, b] = comparaison.map(t => lignes.find(d => d.tache === t));
  const conclusion = document.createElement("p");
  conclusion.className = "conclusion";
  if (a && b) {
    const r = a.mediane_Wh_req / b.mediane_Wh_req;
    const rTxt = r >= 10 ? Math.round(r) : new Intl.NumberFormat("fr-FR", {maximumFractionDigits: 1}).format(r);
    conclusion.textContent = `La ${a.tache.toLowerCase()} demande environ ${rTxt} fois plus d'énergie GPU par requête que la ${b.tache.toLowerCase()} (médianes : ${fmt(a.mediane_Wh_req)} contre ${fmt(b.mediane_Wh_req)} Wh).`;
  }
  const source = document.createElement("figcaption");
  source.textContent = "Source : AI Energy Score (Hugging Face), GPU NVIDIA H100, médiane des modèles évalués par tâche. Énergie des GPU seulement (ni serveurs, ni refroidissement, ni réseau) ; chaque tâche a son propre jeu de requêtes.";

  function appliquer(e) {
    for (const [cle, bt] of Object.entries(boutons)) bt.setAttribute("aria-pressed", String(cle === e));
    explication.textContent = e === "log"
      ? `Échelle logarithmique : chaque graduation multiplie par 10. Les longueurs ne sont pas proportionnelles aux valeurs.`
      : `Échelle linéaire : longueurs proportionnelles (0 à ${fmt(hiLin)} Wh). Les petites valeurs restent écrites à droite.`;
    for (const {d, barre} of elements) barre.style.width = `${Math.max(0, pos(d.mediane_Wh_req, e))}%`;
    const t = graduations(e);
    grille.innerHTML = ""; axe.innerHTML = "";
    for (const x of t) {
      const g = document.createElement("i"); g.style.left = `${pos(Math.max(x, e === "log" ? lo : 0), e)}%`; grille.append(g);
      const s = document.createElement("span"); if (t.indexOf(x) % 2 === 1) s.className = "sec"; s.style.left = `${pos(Math.max(x, e === "log" ? lo : 0), e)}%`; s.textContent = fmt(x); axe.append(s);
    }
    const ta = document.createElement("span"); ta.className = "titre-axe"; ta.textContent = "Wh GPU par requête →"; axe.append(ta);
    racine.dataset.echelle = e;
  }

  racine.setAttribute("aria-label", `Classement des ${lignes.length} tâches de la campagne de ${campagne.toLowerCase()} par énergie GPU médiane par requête. En tête : ${lignes[0].tache} (${fmt(lignes[0].mediane_Wh_req)} Wh) ; en dernier : ${lignes[lignes.length - 1].tache} (${fmt(lignes[lignes.length - 1].mediane_Wh_req)} Wh). ${conclusion.textContent}`);
  racine.append(style, titre, sousTitre, bascule, explication, graphe, conclusion, source, bulle);
  racine.appliquer = appliquer;
  appliquer(echelle);
  requestAnimationFrame(() => requestAnimationFrame(() => appliquer(racine.dataset.echelle)));
  return racine;
}

export function dessinerImpact(donnees, {modeleInitial, animation = true, indicateurs} = {}) {
  // Composant autonome : reçoit ses données en paramètre, n'utilise aucune bibliothèque ni aucune variable extérieure.
  const defs = indicateurs ?? [
    {cle: "eau", libelle: "Eau", unite: "mL", facteur: 1, couleur: "#2878D0", phrase: "d'eau consommée"},
    {cle: "co2", libelle: "CO₂e", unite: "g", facteur: 0.001, couleur: "#9461CC", phrase: "de gaz à effet de serre"},
    {cle: "electricite", libelle: "Électricité", unite: "Wh", facteur: 1, couleur: "#D46E15", phrase: "d'électricité"}
  ];
  const noms = {openai: "OpenAI", anthropic: "Anthropic", google_genai: "Google", mistralai: "Mistral AI"};
  const fmt = v => {
    if (!Number.isFinite(v)) return "—";
    if (v === 0) return "0";
    return new Intl.NumberFormat("fr-FR", {maximumSignificantDigits: 3}).format(v);
  };
  const lignes = donnees.filter(d => defs.some(i => i.cle === d.indicateur));
  const modeles = [...new Set(lignes.map(d => d.modele))];
  const fournisseurDe = m => lignes.find(d => d.modele === m)?.fournisseur ?? "";
  modeles.sort((a, b) => (fournisseurDe(a) + a).localeCompare(fournisseurDe(b) + b));
  const valeur = (m, i) => {
    const d = lignes.find(x => x.modele === m && x.indicateur === i.cle);
    return d ? {milieu: d.milieu * i.facteur, min: d.min * i.facteur, max: d.max * i.facteur} : null;
  };
  const maxima = Object.fromEntries(defs.map(i => {
    const v = lignes.filter(d => d.indicateur === i.cle).map(d => d.milieu * i.facteur);
    const m = Math.max(...v);
    return [i.cle, {valeur: m, modele: lignes.find(d => d.indicateur === i.cle && d.milieu * i.facteur === m)?.modele}];
  }));

  const racine = document.createElement("figure");
  racine.className = "dlp-impact";
  const style = document.createElement("style");
  style.textContent = `
    .dlp-impact{display:flex;flex-direction:column;min-height:100%;--fond:#fbfaf7;--texte:#1f2328;--texte2:#5b616b;--bord:#e5e3dd;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--texte);background:var(--fond);border:1px solid var(--bord);border-radius:16px;padding:24px clamp(16px,3vw,32px) 18px;width:100%;max-width:none;box-sizing:border-box}
    .dlp-impact *{box-sizing:border-box}
    .dlp-impact h3{margin:0 0 4px;font-size:clamp(20px,2.4vw,26px);line-height:1.2;font-weight:750;letter-spacing:-.01em}
    .dlp-impact .st{margin:0 0 18px;font-size:14px;line-height:1.5;color:var(--texte2);max-width:64ch}
    .dlp-impact .choix{display:flex;flex-wrap:wrap;gap:8px 18px;margin:0 0 22px;padding:0;border:0}
    .dlp-impact .groupe{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
    .dlp-impact .groupe>span{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--texte2);margin-right:2px}
    .dlp-impact button.modele{font:inherit;font-size:13.5px;padding:7px 12px;border-radius:999px;border:1px solid var(--bord);background:#fff;color:var(--texte);cursor:pointer;transition:background .2s,border-color .2s,color .2s,transform .2s}
    .dlp-impact button.modele:hover{border-color:#b9b6ad;transform:translateY(-1px)}
    .dlp-impact button.modele:focus-visible{outline:3px solid #2878D0;outline-offset:2px}
    .dlp-impact button.modele[aria-pressed="true"]{background:var(--texte);border-color:var(--texte);color:#fff}
    .dlp-impact .compteurs{flex:1;align-content:center;display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:16px}
    .dlp-impact .compteur{position:relative;background:#fff;border:1px solid var(--bord);border-radius:14px;padding:18px 16px 16px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center;overflow:hidden}
    .dlp-impact .compteur::before{content:"";position:absolute;inset:auto -30% -60% auto;width:180px;height:180px;border-radius:50%;background:var(--c);opacity:.07;filter:blur(8px);transition:transform 1.2s ease}
    .dlp-impact .compteur.anime::before{transform:scale(1.25)}
    .dlp-impact .anneau{width:84px;height:84px}
    .dlp-impact .anneau circle{fill:none;stroke-width:9}
    .dlp-impact .anneau .piste{stroke:#efede8}
    .dlp-impact .anneau .jauge{stroke:var(--c);stroke-linecap:round;transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)}
    .dlp-impact .etiquette{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--c);margin:0 0 2px}
    .dlp-impact .valeur{font-size:clamp(26px,3vw,38px);font-weight:780;line-height:1.05;font-variant-numeric:tabular-nums;letter-spacing:-.02em;white-space:nowrap}
    .dlp-impact .valeur small{font-size:.45em;font-weight:650;color:var(--texte2);margin-left:4px;letter-spacing:0}
    .dlp-impact .phrase{font-size:13px;color:var(--texte2);margin:2px 0 0}
    .dlp-impact .detail{grid-column:1/-1;font-size:12px;line-height:1.45;color:var(--texte2);border-top:1px dashed var(--bord);padding-top:8px;margin:0}
    .dlp-impact .note{margin:16px 0 0;font-size:13px;line-height:1.55;max-width:75ch}
    .dlp-impact figcaption{margin-top:10px;font-size:11.5px;line-height:1.45;color:var(--texte2)}
    .dlp-impact .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
    @media (prefers-reduced-motion:reduce){.dlp-impact *{transition:none!important}}
  `;
  const titre = document.createElement("h3");
  titre.textContent = "L'empreinte invisible d'une requête";
  const sousTitre = document.createElement("p");
  sousTitre.className = "st";
  sousTitre.textContent = "Choisissez un modèle : eau, gaz à effet de serre et électricité estimés pour une requête de 150 tokens.";

  const choix = document.createElement("fieldset");
  choix.className = "choix";
  const legende = document.createElement("legend");
  legende.className = "sr";
  legende.textContent = "Modèle d'IA";
  choix.append(legende);
  const boutons = new Map();
  for (const f of [...new Set(modeles.map(fournisseurDe))]) {
    const g = document.createElement("div");
    g.className = "groupe";
    const t = document.createElement("span");
    t.textContent = noms[f] ?? f;
    g.append(t);
    for (const m of modeles.filter(m => fournisseurDe(m) === f)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "modele";
      b.textContent = m;
      b.dataset.modele = m;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => choisir(m));
      boutons.set(m, b);
      g.append(b);
    }
    choix.append(g);
  }

  const zone = document.createElement("div");
  zone.className = "compteurs";
  const R = 40, C = 2 * Math.PI * R;
  const compteurs = defs.map(i => {
    const carte = document.createElement("div");
    carte.className = "compteur";
    carte.style.setProperty("--c", i.couleur);
    carte.innerHTML = `
      <svg class="anneau" viewBox="0 0 100 100" aria-hidden="true"><circle class="piste" cx="50" cy="50" r="${R}"></circle><circle class="jauge" cx="50" cy="50" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C}"></circle></svg>
      <div><p class="etiquette">${i.libelle}</p><div class="valeur"><span class="nombre">0</span><small>${i.unite}</small></div><p class="phrase">${i.phrase} par requête</p></div>
      <p class="detail"></p>`;
    zone.append(carte);
    return {i, carte, nombre: carte.querySelector(".nombre"), jauge: carte.querySelector(".jauge"), detail: carte.querySelector(".detail"), courant: 0};
  });

  const annonce = document.createElement("p");
  annonce.className = "sr";
  annonce.setAttribute("aria-live", "polite");
  const note = document.createElement("p");
  note.className = "note";
  note.textContent = `Point milieu de l'estimation EcoLogits. Chaque anneau va de 0 au maximum de nos ${modeles.length} configurations pour son indicateur : les trois anneaux ne se comparent pas entre eux. Estimations pour un scénario, pas des mesures de vos requêtes.`;
  const source = document.createElement("figcaption");
  source.textContent = "Source : EcoLogits, estimations du 19/10/2026 · 150 tokens générés, mix électrique mondial · CO₂e converti de mg en g.";

  const animer = (cpt, cible) => {
    const depart = cpt.courant, t0 = performance.now(), duree = 900;
    const pas = t => {
      const p = Math.min(1, (t - t0) / duree), e = 1 - Math.pow(1 - p, 3);
      cpt.nombre.textContent = fmt(depart + (cible - depart) * e);
      if (p < 1) requestAnimationFrame(pas); else cpt.nombre.textContent = fmt(cible);
    };
    requestAnimationFrame(pas);
    cpt.courant = cible;
  };

  function choisir(m) {
    for (const [nom, b] of boutons) b.setAttribute("aria-pressed", String(nom === m));
    const resume = [];
    for (const cpt of compteurs) {
      const v = valeur(m, cpt.i);
      const max = maxima[cpt.i.cle];
      if (!v) { cpt.nombre.textContent = "—"; cpt.detail.textContent = "Pas d'estimation pour ce modèle."; continue; }
      const part = Math.min(1, v.milieu / max.valeur);
      cpt.jauge.setAttribute("stroke-dashoffset", String(C * (1 - Math.max(part, 0.012))));
      cpt.detail.textContent = `Intervalle : ${fmt(v.min)} – ${fmt(v.max)} ${cpt.i.unite} · anneau plein : ${fmt(max.valeur)} ${cpt.i.unite} (${max.modele})`;
      cpt.carte.classList.remove("anime"); void cpt.carte.offsetWidth; cpt.carte.classList.add("anime");
      if (animation) animer(cpt, v.milieu); else { cpt.nombre.textContent = fmt(v.milieu); cpt.courant = v.milieu; }
      resume.push(`${fmt(v.milieu)} ${cpt.i.unite} ${cpt.i.phrase}`);
    }
    annonce.textContent = `${m} : ${resume.join(", ")} par requête.`;
    racine.setAttribute("aria-label", `Impacts estimés d'une requête de 150 tokens pour ${m} : ${resume.join(", ")}. Estimations EcoLogits, point milieu de l'intervalle.`);
    racine.dataset.modele = m;
  }

  racine.append(style, titre, sousTitre, choix, zone, annonce, note, source);
  racine.choisir = choisir;
  choisir(modeleInitial && modeles.includes(modeleInitial) ? modeleInitial : modeles[0]);
  return racine;
}
