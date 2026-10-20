from pathlib import Path
p=Path('src/observable/notebook-client.ts')
if not p.exists():
    raise SystemExit('Exécute ce script depuis la racine du projet Astro.')
s=p.read_text(encoding='utf-8')
a=s.find('function ajusteur(hote: HTMLElement, scene: HTMLElement) {')
b=s.find('// Les infobulles',a)
if a<0 or b<0: raise SystemExit('Fonction ajusteur introuvable : aucun changement effectué.')
replacement='''function ajusteur(hote: HTMLElement, scene: HTMLElement) {
  let attente = 0;
  let mesurePrecedente = "";
  return () => {
    if (attente) return;
    attente = requestAnimationFrame(() => {
      attente = 0;
      const vue = scene.firstElementChild as HTMLElement | null;
      if (!vue) return;
      const largeur = hote.clientWidth;
      const hauteur = hote.clientHeight;
      if (!largeur || !hauteur) return;
      // Adapter la visualisation complète au rectangle visible, sans rogner le bas.
      // Le layout interne du notebook est conservé : seul son conteneur est mis à l'échelle.
      // On garde une largeur de référence pour que V1 ne réarrange pas ses sphères
      // à chaque variation de facteur d'échelle.
      const largeurReference = Math.max(largeur, hote.dataset.obsViz === 'v1' ? 1150 : 1050);
      scene.style.width = `${largeurReference}px`;
      scene.style.position = 'absolute';
      scene.style.top = '0';
      scene.style.left = '0';
      scene.style.transform = 'none';
      const largeurContenu = Math.max(largeurReference, vue.scrollWidth);
      const hauteurContenu = Math.max(vue.scrollHeight, vue.offsetHeight);
      if (!hauteurContenu) return;
      const facteur = Math.min(1, largeur / largeurContenu, hauteur / hauteurContenu);
      const cle = `${largeur}x${hauteur}:${largeurContenu}x${hauteurContenu}:${facteur.toFixed(4)}`;
      if (cle === mesurePrecedente) return;
      mesurePrecedente = cle;
      const x = Math.max(0, (largeur - largeurContenu * facteur) / 2);
      const y = Math.max(0, (hauteur - hauteurContenu * facteur) / 2);
      scene.style.transformOrigin = '0 0';
      scene.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${facteur.toFixed(4)})`;
      hote.style.setProperty('--obs-scale', facteur.toFixed(4));
      hote.classList.remove('is-overflowing');
      if (hote.dataset.obsViz === 'v2') requestAnimationFrame(rafraichirCartes);
    });
  };
}

'''
s=s[:a]+replacement+s[b:]
p.write_text(s,encoding='utf-8')
print('Dimensionnement Observable V7 appliqué. Données et cellules inchangées.')
