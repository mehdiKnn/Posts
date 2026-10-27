export const meta = {
  name: 'video-courte-afk',
  description: "Produit une vidéo courte du sujet à la vidéo finale avec une seule validation humaine, la planche d'autocollants : un producteur et un critique à chaque étape",
  whenToUse: "L'utilisateur donne un sujet de vidéo courte et veut la vidéo sans valider chaque étape (mode AFK). args : {sujet, slug}, puis {sujet, slug, planche: 'validee'} une fois la planche validée, ou {sujet, slug, planche: '<retour>'} pour la refaire",
  phases: [
    { title: 'Script', detail: 'scénariste, puis critique' },
    { title: 'Storyboard', detail: 'storyboarder, puis critique' },
    { title: 'Autocollants', detail: "illustrateur, puis pause : l'utilisateur valide la planche" },
    { title: 'Voix', detail: 'voix.py, puis transcription' },
    { title: 'Animation', detail: 'animateur, puis critique sur les captures et les séquences' },
    { title: 'Rendu final', detail: 'monteur, puis critique de la checklist' },
    { title: 'Rapport', detail: 'suivi et points à vérifier' },
  ],
}

// Lancement : Workflow({name: 'video-courte-afk', args: {sujet: 'Le deadlock', slug: 'deadlock'}}) : script, storyboard,
// puis la planche d'autocollants, et le passage s'arrête pour que l'utilisateur la valide.
// Avec args.planche = 'validee', il reprend à la voix ; avec un autre texte, il refait la planche selon ce retour.
// Avec en plus args.voix, le bilan d'une voix déjà produite et vérifiée, il reprend à l'animation.
// args.test = true vérifie seulement que le workflow se charge.
// Chaque appel passe par un agent dédié de .claude/agents/ (outils limités, modèle fixé dans sa fiche).
if (args && args.test) return { ok: true }
const sujet = args && args.sujet
const slug = args && args.slug
if (!sujet || !slug) return { erreur: 'args attendus : {sujet, slug}' }

const dossier = `videos/${slug}`
const planche = args.planche
const REVISIONS = 2
// Une révision applique des corrections dictées au pixel près : Sonnet suffit là où la production demande Opus.
const REVISION = 'sonnet'
const AFK = `Mode AFK : l'utilisateur est absent ; chaque décision qu'il aurait prise, prends-la selon le skill video-courte et note-la dans ta réponse avec sa raison. Sujet : « ${sujet} ». Dossier de la vidéo : ${dossier} (crée-le au besoin). Cette vidéo se produit avec les poses existantes de la mascotte ; les objets du schéma sont les autocollants de ${dossier}/autocollants/, que l'utilisateur valide ; ce qui relie ou change se trace en SVG.`

const CRITIQUE = {
  type: 'object',
  properties: {
    bloquants: { type: 'array', items: { type: 'string' }, description: 'ce que le spectateur remarque ou comprend mal ; une correction par entrée : fichier, endroit, quoi changer' },
    mineurs: { type: 'array', items: { type: 'string' }, description: "ce que personne ne verra en regardant la vidéo, ou une amélioration possible ; même forme" },
    resume: { type: 'string', description: 'le verdict en une ou deux phrases' },
  },
  required: ['bloquants', 'mineurs', 'resume'],
}

// Le correcteur reçoit les retours et le rendu du passage précédent (ses choix et leurs raisons). Une formulation que
// propose le critique est un exemple : les règles du skill priment (le sel a perdu son « M'sieur, …, non ? » ainsi).
const corrections = (retours, precedent) => retours
  ? `\n\nUn critique demande ces corrections ; applique-les toutes :\n- ${retours.join('\n- ')}\n\nUne formulation qu'il propose (une réplique, un mot) est un exemple : si elle s'écarte d'une règle du skill, comme la forme de l'ouverture dans script.md, garde la règle et dis ce que tu as adapté.\n\nLe passage précédent a rendu ceci, avec ses choix et leurs raisons :\n${precedent}\nGarde ces choix, sauf ceux que visent les retours.`
  : ''
// Le critique reçoit les retours déjà demandés, pour vérifier leur correction avant tout point nouveau ; ce que ses
// corrections ont écrit se rejuge aussi selon les règles, sans quoi il validerait sa propre formulation.
const critique = (nom, regles, historique) => `Nœud « ${nom} » de la vidéo, dossier ${dossier}.\n\n${regles}` + (historique.length
  ? `\n\nRetours déjà demandés aux passages précédents :\n- ${historique.join('\n- ')}\n\nVérifie d'abord qu'ils sont réglés, puis juge le livrable entier selon les règles, y compris ce que ces corrections ont écrit : une correction appliquée ne dispense d'aucune règle.`
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

// La planche d'autocollants : l'illustrateur la génère et la découpe, puis le passage s'arrête pour l'utilisateur.
const fabrique = retour => agent(`${AFK}\n\nLe coût d'une planche (une image GPT Image) est accepté. ${retour
  ? `Refais la planche d'autocollants selon ce retour de l'utilisateur : ${retour}`
  : "Fabrique la planche d'autocollants du storyboard."}`, { label: 'Autocollants · planche', phase: 'Autocollants', agentType: 'illustrateur' })
const pause = rendu => ({ pause: 'planche', planche: `${dossier}/autocollants/planche.png`, rendu,
  suite: "Montre la planche à l'utilisateur, puis relance le workflow avec les mêmes args et planche: 'validee', ou planche: '<son retour>'." })

if (planche && planche !== 'validee') {
  phase('Autocollants')
  return pause(await fabrique(planche))
}

if (!planche) {
  phase('Script')
  const script = await noeud('Script', 'scenariste',
    'Écris le pitch et le dialogue en un seul passage.',
    `Lis .claude/skills/video-courte/script.md, la checklist de SKILL.md et voix.md (balises de jeu), puis ${dossier}/script.md et ${dossier}/dialogue.json. Le vérificateur donne les mots, la durée estimée et les voix. Juge : l'ouverture, dans la forme de script.md (« M'sieur, <l'idée fausse>, non ? »), sans limite de durée, une vraie question en phrase complète et naturelle à l'oral (pas une suite de mots-clés), avec une idée fausse plausible, précise et fausse dans la réalité, sur un problème général : rien de l'exemple de la mascotte n'y entre (ni objet, ni personnage, ni valeur), elle se comprend seule, et la mascotte la réfute dès ses premiers mots ; 5 beats au plus ; chaque info racontée une seule fois ; le mécanisme en un moment clé, avec le dispositif du tableau « La forme suit le fond » ; un seul exemple, et chaque phrase à son service ; des actions dites qui peuvent se montrer en mouvement ; du code de 4 lignes au plus ; un français naturel à l'oral.`)

  phase('Storyboard')
  const storyboard = await noeud('Storyboard', 'storyboarder',
    'Écris le storyboard du script validé.',
    `Lis la checklist de .claude/skills/video-courte/SKILL.md, les règles de script.md, texte.md, animation.md et charte.md, puis ${dossier}/script.md, ${dossier}/dialogue.json et ${dossier}/storyboard.md. Le vérificateur contrôle les repères de synchro (présents dans dialogue.json, dans l'ordre, une fois chacun). Juge d'abord la règle « L'image suit la voix » : à chaque repère, l'image prévue montre-t-elle, en mouvement, l'action que dit la phrase, puis ce mouvement s'efface-t-il ; un objet sans rapport avec la phrase dite est bloquant. Puis la section « Mouvement » d'animation.md : un seul geste à la fois (sauf la collision), seul bouge ce qui sert le concept. Les durées et les tenues ne se jugent pas ici : la voix n'existe pas encore, elles se calent à l'animation sur la voix réelle. Puis : la checklist sur le papier ; le texte à l'écran limité au sujet, aux valeurs du schéma et au code, sans mot-clé de conclusion ; le schéma prévu remplit sa zone (animation.md, « Place du schéma ») ; un seul tremblement d'écran ; les objets concrets en autocollants, 4 au plus, listés dans « Visuels prévus » avec leur nom de fichier, et ce qui relie ou change en SVG ; la pose de la mascotte selon qui parle.`)

  phase('Autocollants')
  const rendu = await fabrique()
  phase('Rapport')
  await agent(`Bilan de la première partie du passage AFK de ${dossier}, arrêtée pour la validation de la planche d'autocollants par l'utilisateur : ${JSON.stringify({
    sujet, dossier, noeuds: [script, storyboard].map(n => ({ nom: n.nom, valide: n.valide, retours: n.retours, mineurs: n.mineurs, resume: n.resume })),
    autocollants: `${dossier}/autocollants/planche.png, à valider par l'utilisateur`,
  })}`, { label: 'Rapport · etapes.md', phase: 'Rapport', agentType: 'suivi', effort: 'low' })
  return pause(rendu)
}

// Planche validée : la suite du passage.
phase('Voix')
// Le CLI ElevenLabs se fige quand plusieurs passages l'appellent en même temps (rafraîchissement de session, trousseau) :
// la session principale produit alors les voix une à une, et args.voix porte son bilan ({ ok, duree, ecarts, anglicismes }).
const voix = args.voix || await agent(`${AFK}\n\nProduis et vérifie la voix de ${dossier}.`, {
  label: 'Voix · génération et transcription', phase: 'Voix', agentType: 'voix', schema: {
    type: 'object',
    properties: {
      ok: { type: 'boolean', description: 'la transcription correspond au dialogue' },
      duree: { type: 'number', description: 'durée totale de voix.mp3, en secondes' },
      ecarts: { type: 'array', items: { type: 'string' } },
      anglicismes: { type: 'array', items: { type: 'string' }, description: 'anglicismes absents du lexique, à faire écouter' },
    },
    required: ['ok', 'duree', 'ecarts', 'anglicismes'],
  } })
// Sans voix, rien ne se juge en aval : le passage s'arrête et le dit, au lieu d'animer et de critiquer à vide.
if (!voix || !voix.duree) {
  log('Voix : aucune voix produite, arrêt du passage')
  phase('Rapport')
  await agent(`Bilan de la seconde partie du passage AFK de ${dossier}, arrêtée au nœud voix, faute de voix produite : ${JSON.stringify({ sujet, dossier, voix })}`,
    { label: 'Rapport · etapes.md', phase: 'Rapport', agentType: 'suivi', effort: 'low' })
  return { sujet, dossier, arret: 'voix', voix }
}
if (!voix.ok) log(`Voix : écarts de transcription restants (${voix.ecarts.length})`)

phase('Animation')
const REGLES_ANIMATION = `Le vérificateur donne les repères et la phrase dite à chacun, les couleurs hors charte, les éléments hors des zones sûres, l'emprise du schéma, les textes sous 48 px, les temps morts du schéma, les gestes qui se chevauchent, les gestes avant que la mascotte parle, les apparitions trop serrées et les traits qui touchent un autocollant. Regarde ensuite, à l'aveugle, ${dossier}/captures.png puis chaque séquence de ${dossier}/sequences/ (une par repère, dans l'ordre du vérificateur, quatre instants de −0,1 à +1 s) : décris ce que montre chacune et compare à la phrase dite. Lis seulement après .claude/skills/video-courte/animation.md, texte.md, charte.md, ${dossier}/storyboard.md et ${dossier}/index.html. Juge : l'image suit la voix, en mouvement, sur son mot (la voix prime sur la tenue d'un état), et aucun temps mort pendant une explication ; le schéma remplit sa zone (animation.md, « Place du schéma ») : une emprise sous l'attendu du vérificateur est bloquante ; un seul geste à la fois, sauf la collision (un chevauchement relevé par le vérificateur peut être la fin d'un même geste : tranche sur les séquences) ; les courbes et durées du tableau d'animation.md, anticipation comprise ; les éléments restent séparés et lisibles ; le texte tient dans les zones sûres, à 48 px au moins, net et immobile après son entrée ; les objets du schéma sont les autocollants de ${dossier}/autocollants/, posés par colle() ; les sous-titres du gabarit sont là, sur deux lignes au plus, sans toucher le schéma ; la mascotte est à la place d'animation.md, dans la pose de celui qui parle ; les couleurs et les polices sont celles de la charte.`
// Les retours que le storyboard n'a pas soldés sont dans etapes.md, écrit à la fin de la première partie.
const restes = `\n\nLes retours du storyboard encore ouverts sont dans ${dossier}/etapes.md ; règle-les dans l'animation.`
const animation = await noeud('Animation', 'animateur', `Construis l'animation du storyboard validé, puis ses contrôles.${restes}`,
  REGLES_ANIMATION + restes.replace("règle-les dans l'animation", "vérifie d'abord qu'ils sont réglés"), REVISION)

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
  noeuds: [animation].map(n => ({ nom: n.nom, valide: n.valide, retours: n.retours, mineurs: n.mineurs, resume: n.resume })),
  voix: voix && { ok: voix.ok, duree: voix.duree, ecarts: voix.ecarts },
  rendu: final && { valide: !final.bloquants.length, retours: final.bloquants, mineurs: mineursRendu, resume: final.resume },
  aEcouter: (voix && voix.anglicismes) || [],
}

phase('Rapport')
await agent(`Bilan de la seconde partie du passage AFK de ${dossier}, après la validation de la planche d'autocollants par l'utilisateur : ${JSON.stringify(bilan)}`,
  { label: 'Rapport · etapes.md', phase: 'Rapport', agentType: 'suivi', effort: 'low' })

return bilan
