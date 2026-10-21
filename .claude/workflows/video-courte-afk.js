export const meta = {
  name: 'video-courte-afk',
  description: 'Produit une vidéo courte du sujet à la vidéo finale sans validation humaine : un producteur et un critique à chaque étape',
  whenToUse: "L'utilisateur donne un sujet de vidéo courte et veut la vidéo sans valider chaque étape (mode AFK). args : {sujet, slug}",
  phases: [
    { title: 'Dossier', detail: 'chercheur : la matière exacte du sujet' },
    { title: 'Script', detail: 'scénariste, puis critique' },
    { title: 'Exactitude', detail: 'expert : faux, trompeur, simplification acceptable' },
    { title: 'Storyboard', detail: 'storyboarder, puis critique ; la voix se fait en même temps' },
    { title: 'Voix', detail: 'voix.py, puis transcription' },
    { title: 'Animation', detail: 'animateur, puis critique sur les captures et les séquences' },
    { title: 'Rendu final', detail: 'monteur, puis critique de la checklist' },
    { title: 'Rapport', detail: 'suivi et points à vérifier' },
  ],
}

// Lancement : Workflow({name: 'video-courte-afk', args: {sujet: 'Le deadlock', slug: 'deadlock'}}).
// args.test = true vérifie seulement que le workflow se charge.
// Chaque appel passe par un agent dédié de .claude/agents/ (outils limités, modèle fixé dans sa fiche).
if (args && args.test) return { ok: true }
const sujet = args && args.sujet
const slug = args && args.slug
if (!sujet || !slug) return { erreur: 'args attendus : {sujet, slug}' }

const dossier = `videos/${slug}`
const REVISIONS = 2
// Une révision applique des corrections dictées au pixel près : Sonnet suffit là où la production demande Opus.
const REVISION = 'sonnet'
const AFK = `Mode AFK : l'utilisateur est absent ; chaque décision qu'il aurait prise, prends-la selon le skill video-courte et note-la dans ta réponse avec sa raison. Sujet : « ${sujet} ». Dossier de la vidéo : ${dossier} (crée-le au besoin). Cette vidéo se produit avec les poses existantes de la mascotte et un schéma entièrement en SVG, sans nouvelle image générée.`

const CRITIQUE = {
  type: 'object',
  properties: {
    bloquants: { type: 'array', items: { type: 'string' }, description: 'ce que le spectateur remarque ou comprend mal ; une correction par entrée : fichier, endroit, quoi changer' },
    mineurs: { type: 'array', items: { type: 'string' }, description: "ce que personne ne verra en regardant la vidéo, ou une amélioration possible ; même forme" },
    resume: { type: 'string', description: 'le verdict en une ou deux phrases' },
  },
  required: ['bloquants', 'mineurs', 'resume'],
}

// Le correcteur reçoit les retours et le rendu du passage précédent (ses choix et leurs raisons).
const corrections = (retours, precedent) => retours
  ? `\n\nUn critique demande ces corrections ; applique-les toutes, exactement :\n- ${retours.join('\n- ')}\n\nLe passage précédent a rendu ceci, avec ses choix et leurs raisons :\n${precedent}\nGarde ces choix, sauf ceux que visent les retours.`
  : ''
// Le critique reçoit les retours déjà demandés, pour vérifier leur correction avant tout point nouveau.
const critique = (nom, regles, historique) => `Nœud « ${nom} » de la vidéo, dossier ${dossier}.\n\n${regles}` + (historique.length
  ? `\n\nRetours déjà demandés aux passages précédents :\n- ${historique.join('\n- ')}`
  : '')
const ajoute = (liste, nouveaux) => liste.push(...nouveaux.filter(m => !liste.includes(m)))

// Un nœud : le producteur rend, le critique vérifie ; chaque retour bloquant repart au producteur, jusqu'à REVISIONS fois.
// Les retours mineurs ne relancent rien : ils vont au bilan, puis dans etapes.md.
// ouverts : les retours bloquants qu'un nœud amont n'a pas soldés ; le critique vérifie d'abord qu'ils le sont ici.
async function noeud(nom, producteur, consigne, regles, modeleRevision, ouverts = []) {
  const historique = [...ouverts], mineurs = []
  let rendu = await agent(`${AFK}\n\n${consigne}`, { label: `${nom} · production`, phase: nom, agentType: producteur })
  for (let tour = 0; ; tour++) {
    const avis = await agent(critique(nom, regles, historique),
      { label: `${nom} · critique ${tour + 1}`, phase: nom, agentType: 'critique', schema: CRITIQUE })
    if (!avis) return { nom, valide: false, retours: ['critique indisponible'], mineurs, rendu }
    ajoute(mineurs, avis.mineurs)
    if (!avis.bloquants.length) return { nom, valide: true, retours: [], mineurs, resume: avis.resume, rendu }
    if (tour === REVISIONS) {
      log(`${nom} : ${avis.bloquants.length} retours bloquants encore ouverts après ${REVISIONS} révisions`)
      return { nom, valide: false, retours: avis.bloquants, mineurs, resume: avis.resume, rendu }
    }
    log(`${nom} : ${avis.bloquants.length} retours bloquants, révision ${tour + 1}`)
    historique.push(...avis.bloquants)
    rendu = await agent(`${AFK}\n\n${consigne}${corrections(avis.bloquants, rendu)}`,
      { label: `${nom} · révision ${tour + 1}`, phase: nom, agentType: producteur, ...(modeleRevision && { model: modeleRevision }) })
  }
}

phase('Dossier')
await agent(`${AFK}\n\nPrépare le dossier de ${dossier}.`, { label: 'Dossier · recherche', phase: 'Dossier', agentType: 'chercheur' })

phase('Script')
const script = await noeud('Script', 'scenariste',
  `Écris le pitch et le dialogue en un seul passage, à partir de ${dossier}/dossier.md.`,
  `Lis .claude/skills/video-courte/script.md, la checklist de SKILL.md et voix.md (balises de jeu), puis ${dossier}/dossier.md, ${dossier}/script.md et ${dossier}/dialogue.json. Le dialogue ne contredit pas le dossier ; l'accroche est la retenue parmi trois formulations, les deux autres sont gardées dans script.md. Le vérificateur donne les mots, la durée estimée et les voix. Juge : l'ouverture, où l'élève avance en 3 s au plus une idée fausse plausible et précise, que la mascotte réfute dès ses premiers mots ; 5 beats au plus ; chaque info racontée une seule fois ; le mécanisme en un moment clé, avec le dispositif du tableau « La forme suit le fond » ; un seul exemple, et chaque phrase à son service ; des actions dites qui peuvent se montrer en mouvement ; du code de 4 lignes au plus ; un français naturel à l'oral.`)

// Une vidéo publiée sous le nom d'un studio ne dit rien d'inexact : l'expert relit le dialogue contre le dossier, et un « faux »
// ou un « trompeur » repart au scénariste (REVISIONS fois), avant que la voix ne soit payée.
phase('Exactitude')
let rendu = script.rendu
const historiqueExact = []
let exact = null
for (let tour = 0; ; tour++) {
  exact = await agent(critique('Exactitude',
    `Lis ${dossier}/dossier.md (la matière et ses sources), puis ${dossier}/dialogue.json et ${dossier}/script.md. Juge l'exactitude technique de chaque affirmation de la voix, de l'idée fausse de l'élève, de l'exemple et de la règle finale : faux et trompeur sont bloquants ; une simplification acceptable est un retour mineur, avec ce qui est omis.`, historiqueExact),
    { label: `Exactitude · expert ${tour + 1}`, phase: 'Exactitude', agentType: 'expert', schema: CRITIQUE })
  if (!exact || !exact.bloquants.length || tour === REVISIONS) break
  log(`Exactitude : ${exact.bloquants.length} retours bloquants, révision ${tour + 1}`)
  historiqueExact.push(...exact.bloquants)
  rendu = await agent(`${AFK}\n\nCorrige le dialogue (dialogue.json et script.md ensemble).${corrections(exact.bloquants, rendu)}`,
    { label: `Exactitude · révision ${tour + 1}`, phase: 'Exactitude', agentType: 'scenariste', model: REVISION })
}

// Le storyboard et la voix ne dépendent que du dialogue : ils se font en même temps.
phase('Storyboard')
const VOIX_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean', description: 'la transcription correspond au dialogue' },
    duree: { type: 'number', description: 'durée totale de voix.mp3, en secondes' },
    ecarts: { type: 'array', items: { type: 'string' } },
    anglicismes: { type: 'array', items: { type: 'string' }, description: 'anglicismes absents du lexique, à faire écouter' },
  },
  required: ['ok', 'duree', 'ecarts', 'anglicismes'],
}
const [storyboard, voix] = await parallel([
  () => noeud('Storyboard', 'storyboarder',
  'Écris le storyboard du script validé.',
  `Lis la checklist de .claude/skills/video-courte/SKILL.md, les règles de script.md, texte.md, animation.md et charte.md, puis ${dossier}/script.md, ${dossier}/dialogue.json et ${dossier}/storyboard.md. Le vérificateur contrôle les repères de synchro (présents dans dialogue.json, dans l'ordre, une fois chacun). Juge d'abord la règle « L'image suit la voix » : à chaque repère, l'image prévue montre-t-elle, en mouvement, l'action que dit la phrase, puis ce mouvement s'efface-t-il ; un objet sans rapport avec la phrase dite est bloquant. Puis la section « Mouvement » d'animation.md : un seul geste à la fois (sauf la collision), seul bouge ce qui sert le concept. Les durées et les tenues ne se jugent pas ici : la voix n'existe pas encore, elles se calent à l'animation sur la voix réelle. Puis : la checklist sur le papier ; le texte à l'écran limité au sujet, aux valeurs du schéma et au code, sans mot-clé de conclusion ; le schéma prévu remplit sa zone (animation.md, « Place du schéma ») ; un seul tremblement d'écran ; tout le schéma en SVG ; la pose de la mascotte selon qui parle.`),
  () => agent(`${AFK}\n\nProduis et vérifie la voix de ${dossier}.`, {
    label: 'Voix · génération et transcription', phase: 'Voix', agentType: 'voix', schema: VOIX_SCHEMA }),
])
if (voix && !voix.ok) log(`Voix : écarts de transcription restants (${voix.ecarts.length})`)


phase('Animation')
const REGLES_ANIMATION = `Le vérificateur donne les repères et la phrase dite à chacun, les couleurs hors charte, les éléments hors des zones sûres, l'emprise du schéma, les textes sous 48 px, les temps morts du schéma et les gestes qui se chevauchent. Regarde ensuite, à l'aveugle, ${dossier}/captures.png puis chaque séquence de ${dossier}/sequences/ (une par repère, dans l'ordre du vérificateur, quatre instants de −0,1 à +1 s) : décris ce que montre chacune et compare à la phrase dite. Lis seulement après .claude/skills/video-courte/animation.md, texte.md, charte.md, ${dossier}/storyboard.md et ${dossier}/index.html. Juge : l'image suit la voix, en mouvement, sur son mot (la voix prime sur la tenue d'un état), et aucun temps mort pendant une explication ; le schéma remplit sa zone (animation.md, « Place du schéma ») : une emprise sous l'attendu du vérificateur est bloquante ; un seul geste à la fois, sauf la collision (un chevauchement relevé par le vérificateur peut être la fin d'un même geste : tranche sur les séquences) ; les courbes et durées du tableau d'animation.md, anticipation comprise ; les éléments restent séparés et lisibles ; le texte tient dans les zones sûres, à 48 px au moins, net et immobile après son entrée ; la mascotte est à la place d'animation.md, dans la pose de celui qui parle ; les couleurs et les polices sont celles de la charte.`
const restes = storyboard.retours.length
  ? `\n\nLe storyboard garde ces retours ouverts ; règle-les dans l'animation :\n- ${storyboard.retours.join('\n- ')}`
  : ''
const animation = await noeud('Animation', 'animateur', `Construis l'animation du storyboard validé, puis ses contrôles.${restes}`,
  REGLES_ANIMATION, REVISION, storyboard.retours)

phase('Rendu final')
const exporter = () => agent(`${AFK}\n\nExporte la vidéo et ses images de contrôle.`,
  { label: 'Rendu · export', phase: 'Rendu final', agentType: 'monteur' })
let montage = await exporter()
let final = null
// Les retours bloquants que l'animation n'a pas soldés se vérifient aussi sur la vidéo.
const historiqueRendu = [...animation.retours]
const mineursRendu = []
for (let tour = 0; ; tour++) {
  final = await agent(critique('Rendu final',
    `Lis la checklist de .claude/skills/video-courte/SKILL.md, puis regarde ${dossier}/controle.png, des images extraites de la vidéo finale. Le vérificateur donne la fiche technique (1080 × 1920, 30 images par seconde, H.264 et AAC, durée) et dit si la vidéo est plus ancienne que la page. Vérifie chaque case de la checklist sur les images. Le critique de l'animation a déjà jugé le mouvement sur les séquences : ne rejuge pas ce qu'il a tranché.\n\nLe monteur a rendu ceci (l'instant et le beat de chaque image) :\n${montage}`, historiqueRendu),
    { label: `Rendu · critique ${tour + 1}`, phase: 'Rendu final', agentType: 'critique', schema: CRITIQUE })
  if (final) ajoute(mineursRendu, final.mineurs)
  if (!final || !final.bloquants.length || tour === 1) break
  log(`Rendu final : ${final.bloquants.length} retours bloquants, correction de l'animation puis nouvel export`)
  historiqueRendu.push(...final.bloquants)
  await agent(`${AFK}\n\nCorrige l'animation.${corrections(final.bloquants, animation.rendu)}`,
    { label: "Rendu · correction de l'animation", phase: 'Rendu final', agentType: 'animateur', model: REVISION })
  montage = await exporter()
}

const bilan = {
  sujet, dossier, video: `${dossier}/video.mp4`,
  exactitude: exact && { valide: !exact.bloquants.length, retours: exact.bloquants, mineurs: exact.mineurs, resume: exact.resume },
  noeuds: [script, storyboard, animation].map(n => ({ nom: n.nom, valide: n.valide, retours: n.retours, mineurs: n.mineurs, resume: n.resume })),
  voix: voix && { ok: voix.ok, duree: voix.duree, ecarts: voix.ecarts },
  rendu: final && { valide: !final.bloquants.length, retours: final.bloquants, mineurs: mineursRendu, resume: final.resume },
  aEcouter: (voix && voix.anglicismes) || [],
}

phase('Rapport')
await agent(`Bilan du passage AFK de ${dossier} : ${JSON.stringify(bilan)}`,
  { label: 'Rapport · etapes.md', phase: 'Rapport', agentType: 'suivi', effort: 'low' })

return bilan
