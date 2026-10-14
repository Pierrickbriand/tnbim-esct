/* ───────── Schémas simplifiés : les écrans et le parcours, pour lever les doutes ───────── */
const G = {
  r: (x, y, w, h, f, s) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f || '#fff'}"${s ? ` stroke="${s}"` : ''}/>`,
  t: (x, y, txt, o) => { o = o || {}; return `<text x="${x}" y="${y}" font-size="${o.s || 12}" fill="${o.c || '#475569'}"${o.b ? ' font-weight="700"' : ''}${o.a ? ` text-anchor="${o.a}"` : ''}>${txt}</text>`; },
  h: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ECFDF5" stroke="#059669" stroke-width="2.5"/>`,
  p: (n, x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="#047857" stroke="#fff" stroke-width="2"/><text x="${x}" y="${y + 4}" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">${n}</text>`,
  l: (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="7" fill="#E2E8F0"/>`,
  fl: (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#047857" stroke-width="2" marker-end="url(#fleche)"/>`,
  defs: `<defs><marker id="fleche" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#047857"/></marker></defs>`
};
function barreLaterale(actif) {
  const it = (y, txt, on) => (on ? G.h(8, y - 17, 164, 26) : '') + G.t(20, y, txt, { c: on ? '#065F46' : '#475569', b: on });
  return G.r(0, 0, 180, 340, '#F1F5F9') + `<line x1="180" y1="0" x2="180" y2="340" stroke="#CBD5E1"/>`
    + G.t(18, 28, 'Claude', { b: true, s: 14, c: '#0F172A' })
    + G.r(12, 42, 156, 28, '#fff', '#CBD5E1') + G.t(22, 61, '+ Nouvelle conversation')
    + it(98, 'Projets', actif === 'projets') + it(126, 'Artefacts', false)
    + G.t(20, 160, 'Récents', { c: '#94A3B8', s: 11 }) + G.l(20, 172, 120) + G.l(20, 188, 96) + G.l(20, 204, 132);
}
const SCHEMAS = {
  parcours: {
    titre: `Le parcours de la page, en six étapes`,
    svg: () => {
      const et = [['Départ', 'le groupe, les dates'], ['1. Chantier', 'lire, télécharger'], ['2. Claude', 'projet, instructions'], ['3. Projet', 'choisir, lancer'], ['4. Travail', 'calculer, vérifier'], ['5. Journal', 'tracer, références'], ['6. Envoi', 'PDF, e-mail, oral']];
      let s = G.defs + G.r(0, 0, 640, 340, '#fff');
      s += G.r(14, 40, 300, 200, '#ECFDF5', '#A7F3D0') + G.t(24, 60, 'Première session de cours', { b: true, c: '#065F46' });
      s += G.r(324, 40, 190, 200, '#F8FAFC', '#CBD5E1') + G.t(334, 60, 'Entre les deux sessions', { b: true, c: '#334155' });
      s += G.r(524, 40, 104, 200, '#FFFBEB', '#FDE68A') + G.t(534, 60, 'Dernière', { b: true, c: '#92400E' }) + G.t(534, 76, 'session', { b: true, c: '#92400E' });
      const pos = [[24, 100], [96, 100], [168, 100], [240, 100], [334, 100], [424, 100], [534, 100]];
      et.forEach((e, i) => { const [x, y] = pos[i]; s += G.r(x, y, 66, 96, '#fff', '#047857') + G.t(x + 33, y + 24, e[0], { b: true, c: '#0F172A', a: 'middle', s: 11 }) + G.t(x + 33, y + 50, e[1].split(', ')[0], { a: 'middle', s: 10 }) + G.t(x + 33, y + 66, e[1].split(', ')[1] || '', { a: 'middle', s: 10 }); if (i < 6) s += G.fl(x + 66, y + 48, pos[i + 1][0] - 2, y + 48); });
      s += G.t(24, 270, 'À chaque étape : des cases « Fait » à cocher, des champs à remplir, des consignes à copier dans Claude.', { s: 11 });
      s += G.t(24, 290, 'Le bandeau vert « Prochaine étape » vous dit toujours où vous en êtes.', { s: 11 });
      s += G.t(24, 318, 'Enregistrez le fichier de projet à chaque pause (bouton « Enregistrer », en haut à gauche).', { s: 11, b: true, c: '#065F46' });
      return s;
    },
    legende: [`Aujourd'hui : du départ à l'étape 3 (cadrage initial écrit sans IA, puis lancement de Claude), et l'ouverture du journal (étape 5).`, `Entre les deux sessions : le travail du projet (étape 4) et le journal (étape 5), jusqu'au dépôt.`, `Dernière session : l'oral, avec le support déposé la veille.`]
  },
  telechargement: {
    titre: `Où arrive le fichier téléchargé`,
    svg: () => G.r(0, 0, 640, 340, '#fff')
      + G.r(0, 0, 640, 44, '#F1F5F9') + G.r(16, 10, 400, 26, '#fff', '#CBD5E1') + G.t(28, 28, 'pierrickbriand.github.io/tnbim-esct/', { s: 11 })
      + G.h(560, 6, 34, 32) + G.t(577, 29, '⤓', { c: '#065F46', b: true, a: 'middle', s: 18 })
      + G.r(360, 50, 270, 110, '#fff', '#CBD5E1') + G.t(372, 72, 'Téléchargements récents', { b: true, c: '#0F172A', s: 11 })
      + G.h(368, 84, 254, 30) + G.t(380, 104, 'fiche-chantier-rive-nord.md', { c: '#065F46', b: true, s: 11 })
      + G.r(368, 120, 254, 30, '#fff', '#E2E8F0') + G.t(380, 140, 'lots-chantier-rive-nord.csv', { s: 11 })
      + G.r(16, 70, 320, 250, '#fff', '#CBD5E1') + G.r(16, 70, 320, 30, '#F1F5F9') + G.t(28, 90, 'Explorateur de fichiers', { b: true, c: '#0F172A', s: 11 })
      + G.t(28, 124, 'Bureau', { s: 11 }) + G.t(28, 146, 'Documents', { s: 11 }) + G.h(22, 156, 150, 26) + G.t(28, 174, 'Téléchargements', { c: '#065F46', b: true, s: 11 })
      + `<line x1="180" y1="100" x2="180" y2="320" stroke="#E2E8F0"/>`
      + G.h(190, 156, 136, 26) + G.t(198, 174, 'fiche-chantier-rive-nord.md', { c: '#065F46', b: true, s: 9 })
      + G.t(198, 206, 'lots-chantier-rive-nord.csv', { s: 9 }) + G.t(198, 236, 'TNBIM_G3_prenom-nom_….json', { s: 9 })
      + G.p(1, 560, 6) + G.p(2, 22, 156) + G.p(3, 190, 156),
    legende: [`Juste après le clic, l'icône de téléchargement du navigateur montre le fichier.`, `Sinon, ouvrez le dossier « Téléchargements » de votre ordinateur.`, `Le fichier s'appelle « fiche-chantier-rive-nord.md ». Ne l'ouvrez pas : vous le donnerez à Claude.`]
  },
  projet: {
    titre: `Créer votre projet Claude`,
    svg: () => barreLaterale('projets')
      + G.t(204, 34, 'Projets', { b: true, s: 16, c: '#0F172A' }) + G.h(494, 14, 132, 30) + G.t(560, 34, '+ Nouveau projet', { c: '#065F46', b: true, a: 'middle' })
      + `<line x1="180" y1="58" x2="640" y2="58" stroke="#E2E8F0"/>`
      + G.r(240, 90, 360, 180, '#fff', '#CBD5E1') + G.t(256, 116, 'Nouveau projet', { b: true, s: 14, c: '#0F172A' })
      + G.t(256, 142, 'Nom', { s: 11 }) + G.h(256, 150, 328, 30) + G.t(266, 170, 'TNBIM groupe 3', { c: '#065F46', b: true })
      + G.t(256, 204, 'Description (facultatif)', { s: 11 }) + G.r(256, 212, 328, 24, '#fff', '#E2E8F0')
      + G.r(500, 246, 84, 28, '#047857') + G.t(542, 265, 'Créer', { c: '#fff', b: true, a: 'middle' })
      + G.p(1, 172, 81) + G.p(2, 494, 14) + G.p(3, 256, 150) + G.p(4, 500, 246),
    legende: [`Dans la barre de gauche, ouvrez « Projets ».`, `Cliquez sur « Nouveau projet ».`, `Nommez-le « TNBIM groupe » suivi de votre numéro.`, `Créez. Le projet s'ouvre, vide : la suite est à l'écran suivant.`]
  },
  fichier: {
    titre: `Donner la fiche du chantier à Claude`,
    svg: () => barreLaterale('projets')
      + G.t(204, 34, 'TNBIM groupe 3', { b: true, s: 16, c: '#0F172A' }) + `<line x1="180" y1="58" x2="640" y2="58" stroke="#E2E8F0"/>`
      + G.r(204, 80, 232, 56, '#fff', '#CBD5E1') + G.t(216, 112, 'Écrivez votre message…', { c: '#94A3B8' })
      + G.l(204, 156, 200) + G.l(204, 174, 160)
      + G.h(456, 80, 170, 92) + G.t(468, 102, 'Instructions', { b: true, c: '#065F46' }) + G.l(468, 116, 130) + G.l(468, 132, 110) + G.l(468, 148, 140)
      + G.h(456, 186, 170, 140) + G.t(468, 208, 'Fichiers', { b: true, c: '#065F46' }) + G.h(596, 192, 24, 24) + G.t(608, 210, '+', { b: true, c: '#065F46', s: 16, a: 'middle' })
      + G.r(468, 224, 146, 40, '#fff', '#A7F3D0') + G.t(476, 240, 'fiche-chantier-', { s: 10, c: '#0F172A', b: true }) + G.t(476, 254, 'rive-nord.md', { s: 10, c: '#0F172A', b: true })
      + G.t(468, 292, 'Glissez un fichier ici', { s: 10, c: '#94A3B8' }) + G.t(468, 308, 'ou cliquez sur +', { s: 10, c: '#94A3B8' })
      + G.p(1, 456, 186) + G.p(2, 596, 192) + G.p(3, 468, 224) + G.p(4, 456, 80),
    legende: [`Dans le projet, repérez la zone des fichiers : « Fichiers », « Connaissances » ou « Contenu du projet » selon la version.`, `Cliquez sur « + », puis choisissez « fiche-chantier-rive-nord.md » dans « Téléchargements ». Ou glissez le fichier dans la zone.`, `Le nom du fichier apparaît : c'est fait, Claude le lira à chaque conversation.`, `Ensuite seulement, collez les instructions dans la zone « Instructions ».`]
  },
  instructions: {
    titre: `Coller les instructions dans votre projet Claude`,
    svg: () => G.defs + G.r(0, 0, 640, 340, '#fff') + `<line x1="270" y1="0" x2="270" y2="340" stroke="#CBD5E1"/>`
      + G.t(16, 26, 'Cette page, étape 2', { b: true, c: '#0F172A', s: 13 })
      + G.r(16, 44, 238, 200, '#F8FAFC', '#CBD5E1') + G.r(16, 44, 238, 32, '#F1F5F9') + G.t(26, 65, 'Instructions du projet', { b: true, c: '#0F172A', s: 11 })
      + G.h(184, 49, 64, 22) + G.t(216, 64, 'Copier', { c: '#065F46', b: true, a: 'middle', s: 11 })
      + G.l(28, 92, 200) + G.l(28, 108, 170) + G.l(28, 124, 210) + G.l(28, 148, 120) + G.l(28, 164, 190) + G.l(28, 180, 160) + G.l(28, 196, 200) + G.l(28, 212, 140)
      + G.t(16, 272, 'Le cadre gris change avec vos cases', { s: 10 }) + G.t(16, 288, 'et vos champs. Copiez-le quand il vous convient.', { s: 10 })
      + G.fl(256, 60, 300, 60)
      + G.t(286, 26, 'Claude, page de votre projet', { b: true, c: '#0F172A', s: 13 })
      + G.r(286, 44, 338, 32, '#F1F5F9') + G.t(296, 65, 'TNBIM groupe 3', { b: true, c: '#0F172A', s: 11 })
      + G.r(286, 90, 150, 56, '#fff', '#CBD5E1') + G.t(296, 122, 'Écrivez votre message…', { c: '#94A3B8', s: 9 })
      + G.t(286, 170, 'Pas ici : la conversation', { s: 9, c: '#B45309' }) + G.t(286, 184, 'sert aux consignes (étape 3).', { s: 9, c: '#B45309' })
      + G.h(450, 90, 174, 160) + G.t(462, 112, 'Instructions', { b: true, c: '#065F46' }) + G.t(590, 112, '✎', { c: '#065F46', s: 13 })
      + G.r(462, 122, 150, 96, '#fff', '#A7F3D0') + G.l(470, 132, 120) + G.l(470, 146, 100) + G.l(470, 160, 130) + G.l(470, 174, 90) + G.l(470, 188, 120) + G.l(470, 202, 110)
      + G.r(540, 222, 72, 22, '#047857') + G.t(576, 237, 'Enregistrer', { c: '#fff', b: true, a: 'middle', s: 10 })
      + G.h(450, 262, 174, 60) + G.t(462, 284, 'Fichiers', { b: true, c: '#065F46' }) + G.r(462, 294, 100, 20, '#fff', '#A7F3D0') + G.t(468, 308, 'fiche-chantier…md', { s: 9, c: '#0F172A' })
      + G.p(1, 184, 49) + G.p(2, 450, 90) + G.p(3, 462, 122) + G.p(4, 540, 222),
    legende: [`Cliquez sur « Copier » : tout le cadre gris est copié.`, `Dans votre projet Claude, ouvrez la zone « Instructions » (selon la version : un crayon, ou « Définir les instructions du projet »). Pas la zone de conversation.`, `Collez le texte (Ctrl + V, ou ⌘ V sur Mac).`, `Enregistrez. Claude relira ces instructions à chaque conversation de ce projet. La fiche du chantier, elle, est dans « Fichiers ».`]
  },
  consigne: {
    titre: `Copier une consigne de la page, la coller dans Claude`,
    svg: () => G.defs + G.r(0, 0, 640, 340, '#fff') + `<line x1="300" y1="0" x2="300" y2="340" stroke="#CBD5E1"/>`
      + G.t(16, 26, 'Cette page', { b: true, c: '#0F172A', s: 13 })
      + G.r(16, 44, 268, 190, '#F8FAFC', '#CBD5E1') + G.r(16, 44, 268, 32, '#F1F5F9') + G.t(26, 65, 'Consigne de démarrage', { b: true, c: '#0F172A', s: 11 })
      + G.h(214, 49, 64, 22) + G.t(246, 64, 'Copier', { c: '#065F46', b: true, a: 'middle', s: 11 })
      + G.l(28, 92, 230) + G.l(28, 108, 200) + G.l(28, 124, 240) + G.l(28, 140, 120) + G.l(28, 164, 220) + G.l(28, 180, 180) + G.l(28, 196, 230)
      + G.t(16, 262, 'Un passage « à compléter » dans la consigne ?', { s: 10 }) + G.t(16, 278, 'Remplissez d’abord le champ correspondant sur la page.', { s: 10 })
      + G.fl(286, 60, 318, 60)
      + G.t(316, 26, 'Claude, dans votre projet', { b: true, c: '#0F172A', s: 13 })
      + G.r(316, 44, 308, 32, '#F1F5F9') + G.t(326, 65, 'TNBIM groupe 3', { b: true, c: '#0F172A', s: 11 })
      + G.h(316, 90, 308, 150) + G.l(328, 106, 260) + G.l(328, 122, 230) + G.l(328, 138, 270) + G.l(328, 154, 150) + G.l(328, 178, 250) + G.l(328, 194, 200) + G.l(328, 210, 260)
      + G.r(566, 246, 58, 26, '#047857') + G.t(595, 264, 'Envoyer', { c: '#fff', b: true, a: 'middle', s: 11 })
      + G.t(316, 300, 'Claude répond. Vous lisez, vous vérifiez,', { s: 10 }) + G.t(316, 316, 'puis vous notez la ligne dans le journal (étape 5).', { s: 10 })
      + G.p(1, 214, 49) + G.p(2, 316, 90) + G.p(3, 566, 246),
    legende: [`Cliquez sur « Copier » : la consigne entière est copiée.`, `Dans Claude, ouvrez une conversation dans votre projet et collez (Ctrl + V, ou ⌘ V sur Mac).`, `Envoyez. Lisez la réponse avant de l'utiliser : c'est vous qui décidez.`]
  },
  journal: {
    titre: `De la conversation à la ligne du journal`,
    svg: () => G.defs + G.r(0, 0, 640, 340, '#fff') + `<line x1="270" y1="0" x2="270" y2="340" stroke="#CBD5E1"/>`
      + G.t(16, 26, 'Votre conversation avec Claude', { b: true, c: '#0F172A', s: 12 })
      + G.r(16, 40, 238, 60, '#ECFDF5', '#A7F3D0') + G.t(26, 58, 'Vous :', { b: true, s: 10, c: '#065F46' }) + G.t(26, 74, '« Six critères observables, une source', { s: 10 }) + G.t(26, 88, 'par critère, dis ce que tu ne sais pas »', { s: 10 })
      + G.r(16, 110, 238, 90, '#F8FAFC', '#CBD5E1') + G.t(26, 128, 'Claude :', { b: true, s: 10 }) + G.l(26, 138, 200) + G.l(26, 152, 180) + G.l(26, 166, 210) + G.l(26, 180, 120)
      + G.r(16, 212, 238, 56, '#FFFBEB', '#FDE68A') + G.t(26, 230, 'Vous vérifiez :', { b: true, s: 10, c: '#92400E' }) + G.t(26, 246, 'deux sources introuvables', { s: 10 }) + G.t(26, 260, 'sur le site indiqué', { s: 10 })
      + G.fl(258, 70, 300, 70) + G.fl(258, 150, 300, 150) + G.fl(258, 240, 300, 240)
      + G.t(300, 26, 'La ligne du journal (étape 5)', { b: true, c: '#0F172A', s: 12 })
      + [['Date', '14/10'], ['Outil', 'Claude, projet du groupe'], ['Objectif', 'Grille de benchmarking'], ['Consigne clé', '« Six critères observables… »'], ['Résultat obtenu', 'Six critères, deux sources introuvables'], ['Décision et pourquoi', 'Modifié : quatre critères gardés'], ['Vérification', 'Rapport annuel ouvert le 15/10']].map((l, i) => { const y = 44 + i * 40; return G.t(300, y + 12, l[0], { s: 10, c: '#64748B' }) + (i === 3 || i === 4 || i === 5 ? G.h(300, y + 18, 324, 20) : G.r(300, y + 18, 324, 20, '#fff', '#CBD5E1')) + G.t(308, y + 32, l[1], { s: 10, c: '#0F172A' }); }).join('')
      + G.p(1, 258, 70) + G.p(2, 258, 150) + G.p(3, 258, 240),
    legende: [`Votre consigne devient la « consigne clé » : la phrase qui a fait la différence.`, `La réponse de Claude devient le « résultat obtenu », en une ligne.`, `Votre vérification remplit « décision et pourquoi » et « vérification ». Deux minutes, tout de suite après l'échange.`]
  },
  enregistrer: {
    titre: `Enregistrer et reprendre votre travail`,
    svg: () => G.defs + G.r(0, 0, 640, 340, '#fff')
      + G.r(16, 16, 250, 92, '#fff', '#CBD5E1') + G.r(24, 24, 112, 26, '#fff', '#CBD5E1') + G.t(80, 41, 'Nouveau', { a: 'middle', s: 11 }) + G.r(146, 24, 112, 26, '#fff', '#CBD5E1') + G.t(202, 41, 'Ouvrir', { a: 'middle', s: 11 })
      + G.h(24, 56, 112, 26) + G.t(80, 73, 'Enregistrer', { a: 'middle', s: 11, b: true, c: '#065F46' }) + G.r(146, 56, 112, 26, '#fff', '#CBD5E1') + G.t(202, 73, 'Exporter', { a: 'middle', s: 11 })
      + G.t(24, 100, 'Enregistré sur cet appareil à 10 h 12.', { s: 9, c: '#64748B' })
      + G.fl(270, 69, 330, 69)
      + G.r(336, 40, 280, 60, '#F8FAFC', '#CBD5E1') + G.t(348, 60, 'Téléchargements', { b: true, s: 11, c: '#0F172A' }) + G.h(348, 68, 256, 24) + G.t(356, 85, 'TNBIM_G3_prenom-nom_2026-10-14.json', { s: 10, c: '#065F46', b: true })
      + G.t(16, 150, 'Pour reprendre, sur le même ordinateur : rien à faire, la page garde tout.', { s: 11 })
      + G.t(16, 170, 'Sur un autre ordinateur, ou après un bogue :', { s: 11, b: true, c: '#0F172A' })
      + G.r(16, 186, 300, 120, '#fff', '#CBD5E1') + G.t(28, 206, 'Solution A', { b: true, s: 11, c: '#065F46' }) + G.t(28, 226, 'Cliquez sur « Ouvrir », puis choisissez', { s: 10 }) + G.t(28, 242, 'votre fichier .json dans Téléchargements.', { s: 10 })
      + G.r(330, 186, 294, 120, '#fff', '#CBD5E1') + G.t(342, 206, 'Solution B', { b: true, s: 11, c: '#065F46' }) + G.t(342, 226, 'Glissez le fichier .json n’importe où', { s: 10 }) + G.t(342, 242, 'sur la page.', { s: 10 })
      + G.h(342, 256, 270, 40) + G.t(477, 280, 'Déposez le fichier de projet', { a: 'middle', s: 10, c: '#065F46', b: true })
      + G.t(16, 328, 'Envoyez aussi le fichier à votre propre adresse : une copie en lieu sûr.', { s: 10, c: '#64748B' })
      + G.p(1, 24, 56) + G.p(2, 348, 68) + G.p(3, 16, 186) + G.p(4, 330, 186),
    legende: [`« Enregistrer » (ou Ctrl + S) crée le fichier de projet.`, `Il arrive dans « Téléchargements », avec votre groupe et votre nom.`, `Pour reprendre ailleurs : « Ouvrir » et choisir le fichier.`, `Ou glisser le fichier sur la page. Le travail affiché est remplacé par celui du fichier, après confirmation.`]
  },
  envoi: {
    titre: `L'e-mail au formateur, avec les pièces jointes`,
    svg: () => G.r(0, 0, 640, 340, '#fff') + G.r(0, 0, 640, 40, '#F1F5F9') + G.t(16, 26, 'Nouveau message', { b: true, s: 13, c: '#0F172A' })
      + G.t(16, 68, 'À', { s: 11, c: '#64748B' }) + G.r(60, 52, 564, 26, '#fff', '#CBD5E1') + G.t(70, 70, 'pierrick.briand@gmail.com', { s: 11, c: '#0F172A' })
      + G.t(16, 104, 'Objet', { s: 11, c: '#64748B' }) + G.r(60, 88, 564, 26, '#fff', '#CBD5E1') + G.t(70, 106, 'TNBIM – groupe 3 – Prénom NOM – MP2-gpC3', { s: 11, c: '#0F172A' })
      + G.r(16, 124, 608, 110, '#fff', '#CBD5E1') + G.t(28, 144, 'Bonjour,', { s: 11 }) + G.t(28, 162, 'Voici mon travail pour le module « La transition numérique, le BIM et les enjeux juridiques ».', { s: 10 })
      + G.t(28, 180, 'Classe : MP2-gpC3 – Groupe : 3 – Projet : Comparateur de scénarios', { s: 10 }) + G.t(28, 198, 'Pièces jointes : mon PDF, mon fichier de projet .json', { s: 10 }) + G.t(28, 216, 'Cordialement, Prénom NOM', { s: 10 })
      + G.t(16, 258, 'Pièces jointes', { s: 11, c: '#64748B' })
      + G.h(16, 266, 290, 28) + G.t(28, 285, 'TNBIM_G3_prenom-nom_journal-dossier.pdf', { s: 10, c: '#065F46', b: true })
      + G.h(318, 266, 306, 28) + G.t(330, 285, 'TNBIM_G3_prenom-nom_2026-11-02.json', { s: 10, c: '#065F46', b: true })
      + G.r(16, 302, 190, 28, '#fff', '#E2E8F0') + G.t(28, 321, 'Support_G3.pdf (si chargé du support)', { s: 9, c: '#64748B' })
      + G.r(520, 302, 104, 30, '#047857') + G.t(572, 322, 'Envoyer', { c: '#fff', b: true, a: 'middle' })
      + G.h(440, 302, 36, 30) + G.t(458, 324, '📎', { a: 'middle', s: 16 })
      + G.p(1, 60, 52) + G.p(2, 440, 302) + G.p(3, 16, 266) + G.p(4, 520, 302),
    legende: [`Adresse, objet et texte sont déjà remplis par la page. Vous pouvez les modifier.`, `Cliquez sur le trombone et choisissez vos fichiers dans « Téléchargements ».`, `Vérifiez que le PDF et le fichier .json sont bien listés. Le support du groupe, seulement si vous en êtes chargé.`, `Envoyez, puis gardez l'e-mail dans « Messages envoyés ».`]
  }
};
function schema(id) {
  const s = SCHEMAS[id];
  return `<details class="aide aide-schema" data-aide="schema_${id}"${AIDES['schema_' + id] ? ' open' : ''}><summary>${PICTO_AIDE}<span>Voir le schéma : ${esc(s.titre)}</span></summary><figure class="schema"><svg viewBox="0 0 640 340" role="img" aria-label="${esc(s.titre)}"><rect width="640" height="340" fill="#fff"/>${s.svg()}<rect x=".5" y=".5" width="639" height="339" fill="none" stroke="#CBD5E1"/></svg>
    <figcaption><ol>${s.legende.map(x => `<li>${x}</li>`).join('')}</ol><p class="note">Schéma simplifié : la disposition peut différer sur votre écran.</p></figcaption></figure></details>`;
}
