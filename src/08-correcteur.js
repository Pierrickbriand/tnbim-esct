/* ───────── Correcteur : lit les fichiers de projet des étudiants, tout reste sur cet ordinateur ───────── */
const $ = id => document.getElementById(id);
const blocSecours = () => ''; /* bloc de récupération de l'application : sans objet ici */
const majBarre = () => {};
const slug = x => String(x).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
const nomGroupe = () => (rempli('id_groupe') ? 'G' + String(v('id_groupe')).trim().replace(/^g/i, '') : 'groupe');
const cheminNom = () => nomGroupe() + (rempli('id_nom') ? '_' + slug(v('id_nom')) : '');
const nomJson = () => 'TNBIM_' + cheminNom() + '_' + (S.exportLe || new Date().toISOString()).slice(0, 10) + '.json';
const nomPdf = () => 'TNBIM_' + cheminNom() + '_journal-dossier.pdf';
const CLE_NOTES = 'correcteur-tnbim-notes';
let ETUDIANTS = [], TRI = { k: 'groupe', sens: 1 }, OUVERT = null, IGNORES = 0, REFUSES = [];

function lireNotes() { try { return JSON.parse(localStorage.getItem(CLE_NOTES) || '{}') || {}; } catch (e) { return {}; } }
function ecrireNotes(n) { try { localStorage.setItem(CLE_NOTES, JSON.stringify(n)); } catch (e) { /* sans stockage, les notes restent dans la page */ } }
let NOTES = lireNotes();

function preparer(d) {
  S = Object.assign(nouvelEtat(), d);
  Object.keys(REG).forEach(k => { REG[k] = Array.isArray(REG[k]) ? [] : {}; });
  const C = calcul(); CHAPITRES.forEach(c => { CH = c.id; c.rendu(C); });
  return C;
}
const normaliser = x => String(x).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const horodatage = d => d.exportLe || d.maj || d.cree || '';

function analyser(d, fichier) {
  const C = preparer(d), M = manques(C), A = alertes(C);
  const nom = rempli('id_nom') ? String(v('id_nom')).trim() : fichier.replace(/\.json$/i, '');
  const groupe = rempli('id_groupe') ? String(v('id_groupe')).trim().replace(/^g/i, '') : '';
  const classe = rempli('id_classe') ? String(v('id_classe')).trim() : '';
  const P = projetChoisi();
  const lj = lignesJournal().filter(l => l.rempli);
  const verdicts = THEMES_JURIDIQUES.map((t, i) => v('fc' + (i + 1) + '_verdict')).filter(Boolean);
  return {
    cle: normaliser(classe + '|' + groupe + '|' + nom), nom, groupe, classe, fichier,
    projet: P ? P.court : '', projetId: P ? P.id : '',
    taux: M.taux, manquants: M.liste.length, parChap: M.parChapitre, liste: M.liste,
    journal: lj.length, journalRej: lj.filter(l => l.decision === 'rejete' || l.decision === 'modifie').length, lignes: lj,
    cadrage: rempli('cad_comprehension') && rempli('cad_hypotheses') && rempli('cad_attentes'),
    verdicts: verdicts.length, verdictsDetail: verdicts,
    bilan: ['bi_perdu', 'bi_gagne', 'bi_pasconfie'].filter(rempli).length,
    resultat: resultatCle(),
    choix: Object.keys(DECISIONS).filter(k => S.choix[k]).length, choixTotal: Object.keys(DECISIONS).length,
    rouges: A.filter(a => a[0] === 'rouge').map(a => a[1]), oranges: A.filter(a => a[0] === 'orange').map(a => a[1]),
    diag: diagnostic(C).titre, quand: horodatage(d), brut: d
  };
}

async function recevoir(fichiers) {
  REFUSES = [];
  for (const f of fichiers) {
    if (!/\.json$/i.test(f.name)) { REFUSES.push(f.name + ' : ce n\'est pas un fichier .json'); continue; }
    let d; try { d = JSON.parse(await f.text()); } catch (e) { d = null; }
    if (!d || d.app !== APP.id || typeof d.champs !== 'object') { REFUSES.push(f.name + ' : ce n\'est pas un fichier de projet du module TNBIM'); continue; }
    const e = analyser(d, f.name), i = ETUDIANTS.findIndex(x => x.cle === e.cle);
    if (i < 0) ETUDIANTS.push(e);
    else { IGNORES++; if (e.quand >= ETUDIANTS[i].quand) ETUDIANTS[i] = e; }
  }
  dessiner();
}

/* Notes : sept critères de la grille, par étudiant. Les critères de groupe se copient aux coéquipiers. */
const CRIT_INDIVIDUELS = [5]; /* indices dans GRILLE : l'usage de l'IA tracé est individuel */
const notesDe = cle => NOTES[cle] || {};
const totalNote = n => GRILLE.reduce((s, g, i) => { const x = parseFloat(n['c' + i]); return s + (isNaN(x) ? 0 : Math.max(0, Math.min(g.pts, x))); }, 0);
const noteComplete = n => GRILLE.every((g, i) => n['c' + i] !== undefined && n['c' + i] !== '' && !isNaN(parseFloat(n['c' + i])));
function copierAuxCoequipiers(cle) {
  const e = ETUDIANTS.find(x => x.cle === cle); if (!e) return 0;
  const src = notesDe(cle); let n = 0;
  ETUDIANTS.filter(x => x.cle !== cle && normaliser(x.classe) === normaliser(e.classe) && normaliser(x.groupe) === normaliser(e.groupe)).forEach(x => {
    const dest = Object.assign({}, notesDe(x.cle));
    GRILLE.forEach((g, i) => { if (CRIT_INDIVIDUELS.indexOf(i) < 0 && src['c' + i] !== undefined) dest['c' + i] = src['c' + i]; });
    NOTES[x.cle] = dest; n++;
  });
  ecrireNotes(NOTES); return n;
}

const dateCourte = iso => { if (!iso) return '–'; const d = new Date(iso); return isNaN(d) ? '–' : d.getDate() + '/' + String(d.getMonth() + 1).padStart(2, '0') + ' ' + d.getHours() + ' h ' + String(d.getMinutes()).padStart(2, '0'); };
const COLONNES = [
  ['classe', 'Classe', e => normaliser(e.classe)], ['groupe', 'Groupe', e => parseInt(e.groupe, 10) || 0], ['nom', 'Étudiant', e => normaliser(e.nom)],
  ['projet', 'Projet', e => e.projet], ['taux', 'Dossier', e => e.taux], ['manquants', 'Manque', e => e.manquants],
  ['journal', 'Journal', e => e.journal * 10 + e.journalRej], ['cadrage', 'Cadrage', e => e.cadrage ? 1 : 0], ['verdicts', 'Références', e => e.verdicts],
  ['bilan', 'Bilan', e => e.bilan], ['alertes', 'Alertes', e => e.rouges.length * 10 + e.oranges.length], ['note', 'Note sur 20', e => noteComplete(notesDe(e.cle)) ? totalNote(notesDe(e.cle)) : -1], ['quand', 'Enregistré', e => e.quand]
];
function cellules(e) {
  const barre = `<span class="cbarre"><i style="width:${e.taux}%"></i></span>`, n = notesDe(e.cle);
  return [
    esc(e.classe) || '–', e.groupe ? 'G' + esc(e.groupe) : '–', `<b>${esc(e.nom)}</b>`, esc(e.projet) || '–',
    `${barre}<span class="tx ${e.taux >= 85 ? 'bon' : e.taux >= 50 ? 'moy' : 'bas'}">${e.taux} %</span>`,
    String(e.manquants), `${e.journal} ligne${e.journal > 1 ? 's' : ''}${e.journal ? ', ' + e.journalRej + ' rej. ou mod.' : ''}`,
    e.cadrage ? 'écrit' : '<span class="tx bas">manque</span>', `${e.verdicts} sur ${THEMES_JURIDIQUES.length}`, `${e.bilan} sur 3`,
    e.rouges.length ? `<span class="pastille rouge">${e.rouges.length}</span>` + (e.oranges.length ? `<span class="pastille orange">${e.oranges.length}</span>` : '') : (e.oranges.length ? `<span class="pastille orange">${e.oranges.length}</span>` : '–'),
    noteComplete(n) ? `<b>${nb(totalNote(n), 1)}</b>` : (Object.keys(n).some(k => k[0] === 'c' && n[k] !== '') ? `${nb(totalNote(n), 1)} (partiel)` : '–'),
    dateCourte(e.quand)
  ];
}
function dessiner() {
  const tri = COLONNES.find(c => c[0] === TRI.k) || COLONNES[1];
  ETUDIANTS.sort((a, b) => { const x = tri[2](a), y = tri[2](b); return (x < y ? -1 : x > y ? 1 : 0) * TRI.sens || normaliser(a.nom).localeCompare(normaliser(b.nom)); });
  const n = ETUDIANTS.length;
  $('zone-tableau').hidden = !n;
  const moy = n ? Math.round(ETUDIANTS.reduce((s, e) => s + e.taux, 0) / n) : 0;
  const groupes = new Set(ETUDIANTS.map(e => normaliser(e.classe + '|' + e.groupe))).size;
  const sansJournal = ETUDIANTS.filter(e => e.journal < 3).length;
  $('resume').textContent = typo(n ? `${n} étudiant${n > 1 ? 's' : ''}, ${groupes} groupe${groupes > 1 ? 's' : ''}, dossier rempli à ${moy} % en moyenne. ${sansJournal} ${sansJournal > 1 ? 'journaux' : 'journal'} de moins de trois lignes.` + (IGNORES ? ` ${IGNORES} fichier${IGNORES > 1 ? 's' : ''} en double : le plus récent est gardé.` : '') : '');
  $('refus').innerHTML = REFUSES.length ? `<p class="alerte-depot">${REFUSES.map(esc).join('<br>')}</p>` : '';
  $('tete-tab').innerHTML = COLONNES.map(c => `<th><button type="button" data-tri="${c[0]}" aria-label="Trier par ${esc(c[1])}">${esc(c[1])}${TRI.k === c[0] ? (TRI.sens > 0 ? ' ▲' : ' ▼') : ''}</button></th>`).join('');
  $('corps-tab').innerHTML = ETUDIANTS.map(e => `<tr data-ouvrir="${esc(e.cle)}" class="${OUVERT === e.cle ? 'actif' : ''}" tabindex="0">${cellules(e).map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
  typoNoeuds($('zone-tableau')); typoNoeuds($('resume'));
  if (OUVERT) detail(OUVERT, false);
}

function detail(cle, defiler) {
  const e = ETUDIANTS.find(x => x.cle === cle); if (!e) { $('detail').hidden = true; return; }
  OUVERT = cle;
  const C = preparer(e.brut), n = notesDe(cle);
  const chap = id => (CHAPITRES.find(c => c.id === id) || { nav: id }).nav.replace(/^\d\. /, '');
  const manque = Object.keys(e.parChap).length ? `<ul class="tirets">${Object.keys(e.parChap).map(id => `<li><b>${esc(chap(id))}</b> : ${e.parChap[id]} élément${e.parChap[id] > 1 ? 's' : ''}<br><span class="note">${esc(e.liste.filter(x => x.ch === id).map(x => x.l).join(' ; '))}</span></li>`).join('')}</ul>` : `<p>Rien ne manque.</p>`;
  const al = e.rouges.concat(e.oranges);
  const journal = e.lignes.length ? `<div class="defile"><table class="tab journal"><thead><tr><th>Date</th><th>Objectif</th><th>Consigne clé</th><th>Résultat</th><th>Décision et pourquoi</th><th>Vérification</th></tr></thead><tbody>${e.lignes.map(l => `<tr><td>${esc(l.date) || '–'}</td><td>${esc(l.objectif) || '–'}</td><td>${esc(l.consigne) || '–'}</td><td>${esc(l.resultat) || '–'}</td><td>${l.decision ? '<b>' + LIB_DECISION[l.decision] + '</b>. ' : ''}${esc(l.pourquoi) || '–'}</td><td>${esc(l.verif) || '–'}</td></tr>`).join('')}</tbody></table></div>` : `<p class="tx bas">Journal vide : usage de l'IA plafonné à 1,5 point sur 3.</p>`;
  const refs = `<div class="defile"><table class="tab"><thead><tr><th>Thème</th><th>Référence</th><th>Source</th><th>Date</th><th>Verdict</th></tr></thead><tbody>${THEMES_JURIDIQUES.map((t, i) => { const k = c => rempli('fc' + (i + 1) + '_' + c) ? esc(v('fc' + (i + 1) + '_' + c)) : '–'; return `<tr><td>${t}</td><td>${k('ref')}</td><td>${k('src')}</td><td>${k('date')}</td><td>${LIB_VERDICT[v('fc' + (i + 1) + '_verdict')] || '–'}</td></tr>`; }).join('')}</tbody></table></div>`;
  const grille = `<table class="grille-notes"><thead><tr><th>Critère</th><th>Points</th><th>Note</th><th>Ce que le jury regarde</th></tr></thead><tbody>${GRILLE.map((g, i) => `<tr><td><b>${g.c}</b>${CRIT_INDIVIDUELS.indexOf(i) >= 0 ? '<br><span class="note">individuel</span>' : '<br><span class="note">groupe</span>'}</td><td>${g.pts}</td><td><input type="number" min="0" max="${g.pts}" step="0.5" data-note="c${i}" value="${n['c' + i] === undefined ? '' : esc(n['c' + i])}" aria-label="${esc(g.c)}"></td><td class="note">${g.q}</td></tr>`).join('')}</tbody></table>
    <p class="total-note" id="total-note">${noteComplete(n) ? `Total : ${nb(totalNote(n), 1)} sur 20` : `Total provisoire : ${nb(totalNote(n), 1)} sur 20 (critères non tous notés)`}</p>
    <div class="actions"><button type="button" class="btn" data-action="copier-groupe">Appliquer les critères de groupe aux coéquipiers</button></div>
    <p class="note">Les critères marqués « groupe » se copient aux fichiers du même groupe et de la même classe déjà chargés. L'usage de l'IA tracé reste individuel.</p>`;
  $('detail').hidden = false;
  $('detail').innerHTML = `<div class="detail-tete"><h2>${esc(e.nom)}${e.groupe ? ` – groupe ${esc(e.groupe)}` : ''}${e.classe ? ` – ${esc(e.classe)}` : ''}</h2><button type="button" class="btn" data-fermer>Fermer</button></div>
    <p class="note">${esc(e.projet || 'Projet non choisi')}${e.resultat ? ' – ' + esc(e.resultat) : ''} – ${esc(e.diag)}. Fichier : ${esc(e.fichier)}, enregistré le ${dateCourte(e.quand)}.</p>
    <div class="detail-grille">
      <section><h3>Ce qui manque au dossier (${e.taux} % rempli)</h3>${manque}</section>
      <section><h3>Alertes du diagnostic</h3>${al.length ? `<ul class="tirets">${al.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : '<p>Aucune alerte.</p>'}
        <h3>Cadrage initial${rempli('cad_date') ? ', écrit le ' + esc(v('cad_date')) : ''}</h3><p>${e.cadrage ? esc(String(v('cad_comprehension')).trim()) : '<span class="tx bas">Non écrit.</span>'}</p></section>
    </div>
    <h3>Journal de bord IA (${e.journal} ligne${e.journal > 1 ? 's' : ''}, ${e.journalRej} modifiée${e.journalRej > 1 ? 's' : ''} ou rejetée${e.journalRej > 1 ? 's' : ''})</h3>${journal}
    <h3>Fiche de contrôle des références (${e.verdicts} verdict${e.verdicts > 1 ? 's' : ''} sur ${THEMES_JURIDIQUES.length})</h3>${refs}
    <h3>Grille de la soutenance</h3>${grille}
    <h3>Tes remarques</h3><textarea id="note-corr" rows="4" placeholder="Remarques, points à vérifier à l'oral, retour à l'étudiant…">${esc(n.com || '')}</textarea>
    <p class="note">Notes et remarques restent dans ce navigateur, sur cet ordinateur. Elles sont ajoutées à l'export du tableau.</p>
    <details class="bloc aide"><summary><span>Lire le dossier complet</span></summary><div class="aide-corps dossier">${dossierHtml(C)}</div></details>`;
  typoNoeuds($('detail'));
  document.querySelectorAll('#corps-tab tr').forEach(tr => tr.classList.toggle('actif', tr.getAttribute('data-ouvrir') === cle));
  if (defiler) $('detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function majTotal() {
  const n = notesDe(OUVERT), z = $('total-note'); if (!z) return;
  z.textContent = typo(noteComplete(n) ? `Total : ${nb(totalNote(n), 1)} sur 20` : `Total provisoire : ${nb(totalNote(n), 1)} sur 20 (critères non tous notés)`);
  const tr = document.querySelector('#corps-tab tr[data-ouvrir="' + CSS.escape(OUVERT) + '"]'); if (tr) { const e = ETUDIANTS.find(x => x.cle === OUVERT); tr.innerHTML = cellules(e).map(c => `<td>${c}</td>`).join(''); typoNoeuds(tr); }
}

function exporterTableau() {
  const q = x => '"' + String(x === null || x === undefined ? '' : x).replace(/"/g, '""') + '"';
  const ent = ['Classe', 'Groupe', 'Étudiant', 'Projet', 'Dossier rempli (%)', 'Éléments manquants', 'Lignes du journal', 'Lignes modifiées ou rejetées', 'Cadrage écrit', 'Verdicts (sur ' + THEMES_JURIDIQUES.length + ')', 'Bilan (sur 3)', 'Alertes rouges', 'Alertes orange', 'Résultat principal', 'Enregistré le']
    .concat(GRILLE.map(g => g.c + ' (sur ' + g.pts + ')')).concat(['Total sur 20', 'Remarques']);
  const lignes = ETUDIANTS.slice().sort((a, b) => (normaliser(a.classe + a.groupe.padStart(3, '0')) + a.nom).localeCompare(normaliser(b.classe + b.groupe.padStart(3, '0')) + b.nom, 'fr')).map(e => { const n = notesDe(e.cle);
    return [e.classe, e.groupe, e.nom, e.projet, e.taux, e.manquants, e.journal, e.journalRej, e.cadrage ? 'oui' : 'non', e.verdicts, e.bilan, e.rouges.length, e.oranges.length, e.resultat, e.quand]
      .concat(GRILLE.map((g, i) => n['c' + i] === undefined ? '' : String(n['c' + i]).replace('.', ','))).concat([noteComplete(n) ? String(totalNote(n)).replace('.', ',') : '', n.com || '']).map(q).join(';'); });
  const blob = new Blob(['﻿' + [ent.map(q).join(';')].concat(lignes).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = 'suivi-tnbim_' + new Date().toISOString().slice(0, 10) + '.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000);
}

document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-tri],[data-ouvrir],[data-fermer],[data-action]'); if (!t) return;
  if (t.hasAttribute('data-tri')) { const k = t.getAttribute('data-tri'); TRI = { k, sens: TRI.k === k ? -TRI.sens : 1 }; return dessiner(); }
  if (t.hasAttribute('data-ouvrir')) return detail(t.getAttribute('data-ouvrir'), true);
  if (t.hasAttribute('data-fermer')) { OUVERT = null; $('detail').hidden = true; return dessiner(); }
  const a = t.getAttribute('data-action');
  if (a === 'choisir') { $('fichiers').value = ''; return $('fichiers').click(); }
  if (a === 'csv') return exporterTableau();
  if (a === 'copier-groupe') { const k = copierAuxCoequipiers(OUVERT); dessiner(); return window.alert(typo(k ? `Critères de groupe copiés à ${k} coéquipier${k > 1 ? 's' : ''}.` : `Aucun coéquipier chargé pour ce groupe et cette classe.`)); }
  if (a === 'vider') { ETUDIANTS = []; OUVERT = null; IGNORES = 0; REFUSES = []; $('detail').hidden = true; return dessiner(); }
});
document.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('tr[data-ouvrir]')) { ev.preventDefault(); detail(ev.target.getAttribute('data-ouvrir'), true); } });
document.addEventListener('input', ev => {
  if (!OUVERT) return;
  if (ev.target.id === 'note-corr') { NOTES[OUVERT] = Object.assign({}, notesDe(OUVERT), { com: ev.target.value }); ecrireNotes(NOTES); return; }
  if (ev.target.hasAttribute('data-note')) { NOTES[OUVERT] = Object.assign({}, notesDe(OUVERT)); NOTES[OUVERT][ev.target.getAttribute('data-note')] = ev.target.value; ecrireNotes(NOTES); majTotal(); }
});
$('fichiers').addEventListener('change', ev => recevoir(Array.from(ev.target.files || [])));
const porte = e => !!(e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0);
['dragover', 'dragenter'].forEach(t => document.addEventListener(t, e => { if (!porte(e)) return; e.preventDefault(); $('depot').classList.add('survol'); }));
document.addEventListener('dragleave', e => { if (!e.relatedTarget) $('depot').classList.remove('survol'); });
document.addEventListener('drop', e => { if (!porte(e)) return; e.preventDefault(); $('depot').classList.remove('survol'); recevoir(Array.from(e.dataTransfer.files || [])); });
dessiner();
