/**
 * Convert all .txt template files in backend/templates/ to .docx
 * Run: node scripts/convertTemplatesToDocx.js
 */
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, HeadingLevel, ShadingType,
  Footer, Header,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.join(__dirname, '../templates');

/* ─── Helpers ─── */
const SOS_BLUE = '1A73E8';
const SOS_NAVY = '1B2A4A';
const GRAY = '666666';
const LIGHT_BG = 'F0F4FA';

const blank = () => new Paragraph({ spacing: { after: 120 } });

const heading = (text, level = HeadingLevel.HEADING_1) =>
  new Paragraph({
    children: [new TextRun({ text, bold: true, color: SOS_NAVY, font: 'Calibri', size: level === HeadingLevel.HEADING_1 ? 32 : 26 })],
    heading: level,
    spacing: { before: 280, after: 120 },
  });

const subHeading = (text) => heading(text, HeadingLevel.HEADING_2);

const para = (text, opts = {}) =>
  new Paragraph({
    children: [new TextRun({ text, font: 'Calibri', size: 22, color: opts.color || '333333', ...opts })],
    spacing: { after: 80 },
  });

const field = (label, width = 50) =>
  new Paragraph({
    children: [
      new TextRun({ text: `${label} : `, bold: true, font: 'Calibri', size: 22, color: SOS_NAVY }),
      new TextRun({ text: '_'.repeat(width), font: 'Calibri', size: 22, color: GRAY }),
    ],
    spacing: { after: 60 },
  });

const checkbox = (text) =>
  new Paragraph({
    children: [new TextRun({ text: `☐  ${text}`, font: 'Calibri', size: 22, color: '333333' })],
    spacing: { after: 40 },
    indent: { left: 360 },
  });

const numberedItem = (n, text = '') =>
  new Paragraph({
    children: [new TextRun({ text: `${n}. ${text || '_'.repeat(50)}`, font: 'Calibri', size: 22 })],
    spacing: { after: 40 },
    indent: { left: 360 },
  });

const blankLines = (n = 3) =>
  new Paragraph({
    children: [new TextRun({ text: '\n'.repeat(n), font: 'Calibri', size: 22 })],
    spacing: { after: 60 },
  });

const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

const tableCell = (text, opts = {}) =>
  new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, font: 'Calibri', size: 20, bold: opts.header || false, color: opts.header ? 'FFFFFF' : '333333' })],
      alignment: AlignmentType.LEFT,
    })],
    width: { size: opts.width || 2500, type: WidthType.DXA },
    shading: opts.header ? { type: ShadingType.CLEAR, fill: SOS_BLUE } : undefined,
    borders,
  });

const tableRow = (cells, header = false) =>
  new TableRow({ children: cells.map(c => tableCell(c, { header })) });

const makeTable = (headers, emptyRows = 2) => {
  const rows = [tableRow(headers, true)];
  for (let i = 0; i < emptyRows; i++) {
    rows.push(tableRow(headers.map(() => '')));
  }
  return new Table({ rows, width: { size: 9000, type: WidthType.DXA } });
};

const confidentialFooter = () =>
  new Footer({
    children: [
      new Paragraph({
        children: [new TextRun({
          text: 'CONFIDENTIEL — Données sensibles protégées conformément à la politique de protection de l\'enfant de SOS Villages d\'Enfants.',
          font: 'Calibri', size: 16, italics: true, color: GRAY,
        })],
        alignment: AlignmentType.CENTER,
      }),
    ],
  });

const sosHeader = (title) =>
  new Header({
    children: [
      new Paragraph({
        children: [new TextRun({ text: `SOS Villages d'Enfants — ${title}`, font: 'Calibri', size: 18, color: SOS_BLUE, italics: true })],
        alignment: AlignmentType.RIGHT,
      }),
    ],
  });

const signatureBlock = () => [
  blank(),
  subHeading('SIGNATURE'),
  field('Nom'),
  field('Fonction'),
  field('Date'),
  field('Signature'),
];

const metaFields = (extra = []) => [
  field('Date'),
  field('Réf. Signalement'),
  field('Village SOS'),
  field('Psychologue référent'),
  ...extra,
];

/* ─── Individual Templates ─── */

function rapportInitial() {
  return [
    heading('RAPPORT INITIAL — Sauvegarde de l\'Enfant'),
    para('SOS Villages d\'Enfants — Modèle Standard', { italics: true, color: GRAY }),
    blank(),
    ...metaFields(),

    subHeading('1. INFORMATIONS GÉNÉRALES'),
    field('Nom de l\'enfant'),
    field('Âge / Date de naissance'),
    field('Sexe'),
    field('Lieu de résidence actuel'),

    subHeading('2. DESCRIPTION DE L\'INCIDENT'),
    para('Type d\'incident :', { bold: true }),
    checkbox('Violence physique'), checkbox('Violence psychologique'),
    checkbox('Violence sexuelle'), checkbox('Négligence'),
    checkbox('Problème de santé'), checkbox('Problème comportemental'),
    checkbox('Problème éducatif'), checkbox('Problème familial'),
    checkbox('Autre'),
    field('Date de l\'incident'),
    field('Lieu de l\'incident'),
    para('Description détaillée :', { bold: true }),
    blankLines(5),

    subHeading('3. ÉVALUATION INITIALE DU RISQUE'),
    para('Niveau d\'urgence :', { bold: true }),
    checkbox('Faible'), checkbox('Moyen'), checkbox('Élevé'), checkbox('Critique'),
    para('L\'enfant est-il en danger immédiat ?', { bold: true }),
    checkbox('Oui'), checkbox('Non'),
    para('Mesures de protection immédiates prises :', { bold: true }),
    blankLines(3),

    subHeading('4. PERSONNES IMPLIQUÉES'),
    field('Agresseur présumé (si connu)'),
    field('Relation avec l\'enfant'),
    field('Témoins éventuels'),

    subHeading('5. PREMIÈRES OBSERVATIONS DU PSYCHOLOGUE'),
    para('État émotionnel de l\'enfant :', { bold: true }), blankLines(2),
    para('Observations comportementales :', { bold: true }), blankLines(2),
    para('Besoins immédiats identifiés :', { bold: true }), blankLines(2),

    subHeading('6. RECOMMANDATIONS PRÉLIMINAIRES'),
    blankLines(3),

    ...signatureBlock(),
  ];
}

function rapportDpe() {
  return [
    heading('RAPPORT DPE — Diagnostic Psycho-Éducatif'),
    para('SOS Villages d\'Enfants Tunisie', { italics: true, color: GRAY }),
    blank(),
    ...metaFields(),

    subHeading('1. INFORMATIONS GÉNÉRALES'),
    field('Nom de l\'enfant'),
    field('Âge'),
    field('Programme'),
    field('Date du signalement'),
    field('Type d\'incident'),
    para('Niveau d\'urgence :', { bold: true }),
    checkbox('Faible'), checkbox('Moyen'), checkbox('Élevé'), checkbox('Critique'),

    subHeading('2. RÉSUMÉ DU SIGNALEMENT'),
    blankLines(3),

    subHeading('3. CONTEXTE'),
    blankLines(3),

    subHeading('4. OBSERVATIONS CLINIQUES'),
    blankLines(3),

    subHeading('5. ÉVALUATION DU RISQUE'),
    para('Niveau de risque :', { bold: true }),
    checkbox('Faible'), checkbox('Moyen'), checkbox('Élevé'),
    para('Justification :', { bold: true }), blankLines(2),

    subHeading('6. RECOMMANDATIONS'),
    numberedItem(1), numberedItem(2), numberedItem(3),

    subHeading('7. PLAN D\'ACTION PRÉLIMINAIRE'),
    makeTable(['Action', 'Responsable', 'Délai']),

    subHeading('8. SUIVI RECOMMANDÉ'),
    blankLines(2),

    subHeading('9. POINTS À VÉRIFIER'),
    checkbox(''), checkbox(''), checkbox(''),

    ...signatureBlock(),
    blank(),
    para('AVERTISSEMENT : Ce rapport est généré à titre de brouillon. Il doit être validé par un professionnel qualifié.', { italics: true, color: GRAY }),
  ];
}

function evaluationComplete() {
  return [
    heading('ÉVALUATION COMPLÈTE'),
    para('SOS Villages d\'Enfants Tunisie', { italics: true, color: GRAY }),
    blank(),
    ...metaFields(),

    subHeading('1. RAPPEL DU CAS'),
    blankLines(3),

    subHeading('2. ENTRETIENS RÉALISÉS'),
    makeTable(['Date', 'Personne rencontrée', 'Rôle', 'Durée']),

    subHeading('3. ÉVALUATION PSYCHOLOGIQUE'),
    para('3.1 État émotionnel de l\'enfant :', { bold: true }), blankLines(2),
    para('3.2 Développement cognitif :', { bold: true }), blankLines(2),
    para('3.3 Relations interpersonnelles :', { bold: true }), blankLines(2),
    para('3.4 Comportement observé :', { bold: true }), blankLines(2),

    subHeading('4. TESTS ET OUTILS UTILISÉS'),
    makeTable(['Test/Outil', 'Résultat', 'Interprétation']),

    subHeading('5. DIAGNOSTIC / CONCLUSION'),
    para('Classification :', { bold: true }),
    checkbox('Sauvegarde'), checkbox('Prise en charge'), checkbox('Faux signalement'),
    para('Justification :', { bold: true }), blankLines(3),

    subHeading('6. FACTEURS DE RISQUE IDENTIFIÉS'),
    numberedItem(1), numberedItem(2), numberedItem(3),

    subHeading('7. FACTEURS DE PROTECTION'),
    numberedItem(1), numberedItem(2), numberedItem(3),

    subHeading('8. RECOMMANDATIONS DÉTAILLÉES'),
    blankLines(3),

    ...signatureBlock(),
  ];
}

function planAction() {
  return [
    heading('PLAN D\'ACTION'),
    para('SOS Villages d\'Enfants Tunisie', { italics: true, color: GRAY }),
    blank(),
    ...metaFields(),

    subHeading('1. OBJECTIFS'),
    para('1.1 Objectif principal :', { bold: true }), blankLines(2),
    para('1.2 Objectifs secondaires :', { bold: true }),
    numberedItem('•'), numberedItem('•'), numberedItem('•'),

    subHeading('2. ACTIONS À COURT TERME (0-2 semaines)'),
    makeTable(['#', 'Action', 'Responsable', 'Échéance', 'Indicateur de réussite'], 3),

    subHeading('3. ACTIONS À MOYEN TERME (2-8 semaines)'),
    makeTable(['#', 'Action', 'Responsable', 'Échéance', 'Indicateur de réussite']),

    subHeading('4. ACTIONS À LONG TERME (2+ mois)'),
    makeTable(['#', 'Action', 'Responsable', 'Échéance', 'Indicateur de réussite'], 1),

    subHeading('5. RESSOURCES NÉCESSAIRES'),
    checkbox('Soutien psychologique'), checkbox('Accompagnement éducatif'),
    checkbox('Intervention médicale'), checkbox('Médiation familiale'),
    checkbox('Signalement aux autorités'), checkbox('Autre'),

    subHeading('6. PLAN DE COMMUNICATION'),
    blankLines(3),

    subHeading('7. CRITÈRES DE CLÔTURE'),
    blankLines(3),

    ...signatureBlock(),
  ];
}

function rapportSuivi() {
  return [
    heading('RAPPORT DE SUIVI'),
    para('SOS Villages d\'Enfants Tunisie', { italics: true, color: GRAY }),
    blank(),
    ...metaFields([field('Période de suivi')]),

    subHeading('1. RAPPEL DES OBJECTIFS'),
    blankLines(3),

    subHeading('2. ACTIVITÉS RÉALISÉES'),
    makeTable(['Date', 'Activité', 'Participants', 'Observations']),

    subHeading('3. PROGRÈS OBSERVÉS'),
    para('3.1 Progrès sur l\'objectif principal :', { bold: true }), blankLines(2),
    para('3.2 Progrès sur les objectifs secondaires :', { bold: true }), blankLines(2),
    para('3.3 Changements comportementaux :', { bold: true }), blankLines(2),

    subHeading('4. DIFFICULTÉS RENCONTRÉES'),
    blankLines(3),

    subHeading('5. ÉVALUATION DE L\'ÉTAT ACTUEL'),
    para('État général de l\'enfant :', { bold: true }),
    checkbox('Amélioré'), checkbox('Stable'), checkbox('Dégradé'),
    para('Niveau de risque actuel :', { bold: true }),
    checkbox('Faible'), checkbox('Moyen'), checkbox('Élevé'),

    subHeading('6. AJUSTEMENTS DU PLAN D\'ACTION'),
    blankLines(3),

    subHeading('7. PROCHAINES ÉTAPES'),
    makeTable(['Action', 'Responsable', 'Échéance']),

    subHeading('8. RECOMMANDATION'),
    checkbox('Poursuivre le suivi'), checkbox('Réduire la fréquence de suivi'),
    checkbox('Escalader au niveau supérieur'), checkbox('Préparer la clôture'),
    para('Justification :', { bold: true }), blankLines(2),

    ...signatureBlock(),
  ];
}

function rapportFinal() {
  return [
    heading('RAPPORT FINAL — Sauvegarde de l\'Enfant'),
    para('SOS Villages d\'Enfants — Modèle Standard', { italics: true, color: GRAY }),
    blank(),
    ...metaFields([field('Réf. rapport initial')]),

    subHeading('1. RAPPEL DU CAS'),
    para('Résumé du signalement initial :', { bold: true }), blankLines(3),
    field('Date de prise en charge'),
    para('Classification du signalement :', { bold: true }),
    checkbox('Sauvegarde'), checkbox('Prise en charge'), checkbox('Faux signalement'),

    subHeading('2. ENTRETIENS RÉALISÉS'),
    para('Entretien avec l\'enfant :', { bold: true }),
    field('Date'), field('Durée (minutes)'),
    para('Résumé :', { bold: true }), blankLines(3),
    para('Entretien avec la famille / tuteur :', { bold: true }),
    field('Date'), field('Durée (minutes)'),
    para('Résumé :', { bold: true }), blankLines(3),
    para('Autres entretiens :', { bold: true }), blankLines(2),

    subHeading('3. ÉVALUATION PSYCHOLOGIQUE APPROFONDIE'),
    para('État psychologique de l\'enfant :', { bold: true }), blankLines(3),
    para('Facteurs de risque identifiés :', { bold: true }), blankLines(2),
    para('Facteurs de protection existants :', { bold: true }), blankLines(2),

    subHeading('4. DIAGNOSTIC / CONCLUSION'),
    para('Conclusion du psychologue :', { bold: true }), blankLines(4),
    para('Niveau de risque final :', { bold: true }),
    checkbox('Faible'), checkbox('Moyen'), checkbox('Élevé'), checkbox('Critique'),

    subHeading('5. PLAN D\'ACTION RECOMMANDÉ'),
    para('Actions immédiates :', { bold: true }),
    numberedItem(1), numberedItem(2), numberedItem(3),
    para('Actions à moyen terme :', { bold: true }),
    numberedItem(1), numberedItem(2), numberedItem(3),
    para('Suivi recommandé :', { bold: true }),
    checkbox('Suivi hebdomadaire'), checkbox('Suivi bimensuel'),
    checkbox('Suivi mensuel'), checkbox('Autre'),
    para('Orientation vers services externes :', { bold: true }),
    checkbox('Services sociaux'), checkbox('Services médicaux'),
    checkbox('Autorités judiciaires'), checkbox('Autre'),

    subHeading('6. RECOMMANDATION D\'ESCALADE'),
    para('Escalade nécessaire :', { bold: true }),
    checkbox('Non'),
    checkbox('Oui → Directeur du village'),
    checkbox('Oui → Bureau national'),
    para('Justification :', { bold: true }), blankLines(2),

    ...signatureBlock(),
  ];
}

/* ─── Build & Save ─── */
const templates = {
  rapport_initial_template: { fn: rapportInitial, title: 'Rapport Initial' },
  rapport_dpe_template:     { fn: rapportDpe,     title: 'Rapport DPE' },
  evaluation_complete_template: { fn: evaluationComplete, title: 'Évaluation Complète' },
  plan_action_template:     { fn: planAction,     title: 'Plan d\'Action' },
  rapport_suivi_template:   { fn: rapportSuivi,   title: 'Rapport de Suivi' },
  rapport_final_template:   { fn: rapportFinal,   title: 'Rapport Final' },
};

async function main() {
  for (const [name, { fn, title }] of Object.entries(templates)) {
    const children = fn();
    const doc = new Document({
      sections: [{
        properties: {},
        headers: { default: sosHeader(title) },
        footers: { default: confidentialFooter() },
        children,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const outPath = path.join(TEMPLATES_DIR, `${name}.docx`);
    fs.writeFileSync(outPath, buffer);
    console.log(`✓ ${outPath}`);
  }
  console.log('\nAll templates converted to .docx!');
}

main().catch(err => { console.error('Conversion failed:', err); process.exit(1); });
