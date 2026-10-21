// Outils communs des pages « Voir plus » (/explorer/v1 … v4) : apparitions au défilement,
// compteurs animés, séquences pas à pas (scrollytelling) et barre de progression.
// Aucune séquence ne bloque le défilement : tout est piloté par la position de lecture.

export const mouvementReduit = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export const fmtFr = (v: number, chiffres = 3) =>
  new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: chiffres }).format(v);
export const fmtEntier = (v: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v);

type OptionsNombre = { de?: number; duree?: number; format?: (v: number) => string };

/** Fait évoluer le nombre affiché par `el` jusqu'à `vers` (valeur finale immédiate si mouvement réduit). */
export function animerNombre(el: HTMLElement, vers: number, { de = 0, duree = 1400, format = (v) => fmtFr(v) }: OptionsNombre = {}) {
  cancelAnimationFrame(Number(el.dataset.raf || 0));
  // Onglet masqué : requestAnimationFrame est suspendu, on affiche directement la valeur finale.
  if (mouvementReduit() || document.hidden) {
    el.textContent = format(vers);
    return;
  }
  const t0 = performance.now();
  clearTimeout(Number(el.dataset.garde || 0));
  // Filet de sécurité : si les images d'animation sont suspendues, la valeur finale s'affiche quand même.
  el.dataset.garde = String(setTimeout(() => {
    cancelAnimationFrame(Number(el.dataset.raf || 0));
    el.textContent = format(vers);
  }, duree + 300));
  const pas = (t: number) => {
    const p = Math.min(1, (t - t0) / duree);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = format(de + (vers - de) * e);
    if (p < 1) el.dataset.raf = String(requestAnimationFrame(pas));
    else clearTimeout(Number(el.dataset.garde || 0));
  };
  el.dataset.raf = String(requestAnimationFrame(pas));
}

/** Appelle `rappel` une fois, quand l'élément entre dans la fenêtre. */
export function quandVisible(el: Element, rappel: () => void, seuil = 0.3) {
  if (!("IntersectionObserver" in window)) return rappel();
  const io = new IntersectionObserver((entrees) => {
    if (entrees.some((e) => e.isIntersecting)) {
      io.disconnect();
      rappel();
    }
  }, { threshold: seuil });
  io.observe(el);
}

// [data-reveal] : apparition douce ; [data-reveal-groupe] : ses enfants apparaissent l'un après l'autre.
function apparitions() {
  document.querySelectorAll<HTMLElement>("[data-reveal-groupe]").forEach((groupe) => {
    [...groupe.children].forEach((enfant, i) => {
      enfant.setAttribute("data-reveal", "");
      (enfant as HTMLElement).style.setProperty("--i", String(i));
    });
  });
  const elements = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
  if (mouvementReduit() || !("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entrees) => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    }
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  elements.forEach((el) => io.observe(el));
}

// [data-count="0,315"] : compteur lancé à l'apparition. data-format="entier" pour les nombres entiers.
function compteurs() {
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    const vers = Number(el.dataset.count);
    if (!Number.isFinite(vers)) return;
    const format = el.dataset.format === "entier" ? fmtEntier : (v: number) => fmtFr(v, Number(el.dataset.chiffres || 3));
    el.textContent = format(mouvementReduit() ? vers : 0);
    quandVisible(el, () => animerNombre(el, vers, { format, duree: Number(el.dataset.duree || 1600) }), 0.6);
  });
}

/**
 * [data-scrolly] : une séquence d'étapes [data-step] qui défilent normalement à côté (ou au-dessus)
 * d'un visuel collant. L'étape qui croise le milieu de l'écran devient active : la séquence reçoit
 * data-active="n" (que le CSS de chaque page met en scène) et l'évènement « scrolly:etape ».
 */
function sequences() {
  document.querySelectorAll<HTMLElement>("[data-scrolly]").forEach((sequence) => {
    const etapes = [...sequence.querySelectorAll<HTMLElement>("[data-step]")];
    const activer = (i: number) => {
      if (sequence.dataset.active === String(i)) return;
      sequence.dataset.active = String(i);
      etapes.forEach((e, k) => e.classList.toggle("is-active", k === i));
      sequence.dispatchEvent(new CustomEvent("scrolly:etape", { detail: { index: i } }));
    };
    activer(0);
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entrees) => {
      for (const e of entrees) if (e.isIntersecting) activer(etapes.indexOf(e.target as HTMLElement));
    }, { rootMargin: "-48% 0px -48% 0px" });
    etapes.forEach((e) => io.observe(e));
  });
}

function progression() {
  const barre = document.querySelector<HTMLElement>("#ex-progress");
  if (!barre) return;
  let raf = 0;
  const maj = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    barre.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(maj); }, { passive: true });
  maj();
}

let pret = false;
export function initExplorer() {
  if (pret) return;
  pret = true;
  document.documentElement.classList.add("ex-js");
  apparitions();
  compteurs();
  sequences();
  progression();
}
