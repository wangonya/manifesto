export const languageOptions = [
  { code: "en", label: "English", locale: "en-KE" },
  { code: "sw", label: "Kiswahili", locale: "sw-KE" },
  { code: "fr", label: "Français", locale: "fr-FR" },
] as const;

export type LanguageCode = (typeof languageOptions)[number]["code"];
export type LocalizedText = Record<LanguageCode, string>;

export type UserLocalizedText = {
  originalLanguage: LanguageCode;
  translationStatus: "complete" | "pending" | "failed";
  values: Partial<Record<LanguageCode, string>>;
};

export function text(en: string, sw: string, fr: string): LocalizedText {
  return { en, sw, fr };
}

export function localize(value: LocalizedText, language: LanguageCode) {
  return value[language] || value.en;
}

export function completeUserText(
  values: LocalizedText,
  originalLanguage: LanguageCode = "en",
): UserLocalizedText {
  return {
    originalLanguage,
    translationStatus: "complete",
    values,
  };
}

export function authoredUserText(value: string, language: LanguageCode): UserLocalizedText {
  return {
    originalLanguage: language,
    translationStatus: "pending",
    values: {
      [language]: value,
    },
  };
}

export function localizeUserText(value: UserLocalizedText, language: LanguageCode) {
  const localizedValue = value.values[language];
  if (localizedValue) {
    return {
      isFallback: false,
      originalLanguage: value.originalLanguage,
      text: localizedValue,
      translationStatus: value.translationStatus,
    };
  }

  const fallbackValue = value.values[value.originalLanguage] ?? Object.values(value.values)[0] ?? "";

  return {
    isFallback: true,
    originalLanguage: value.originalLanguage,
    text: fallbackValue,
    translationStatus: value.translationStatus,
  };
}

export function languageLabel(language: LanguageCode) {
  return languageOptions.find((option) => option.code === language)?.label ?? language.toUpperCase();
}

export function localeForLanguage(language: LanguageCode) {
  return languageOptions.find((option) => option.code === language)?.locale ?? "en-KE";
}

export const uiCopy = {
  add: text("+ Add", "+ Ongeza", "+ Ajouter"),
  addAnonymousContextNote: text(
    "Add anonymous context note",
    "Ongeza dokezo bila jina",
    "Ajouter une note de contexte anonyme",
  ),
  addAnonymousEvidence: text(
    "Add anonymous evidence",
    "Ongeza ushahidi bila jina",
    "Ajouter une preuve anonyme",
  ),
  addContext: text("Add context", "Ongeza muktadha", "Ajouter un contexte"),
  addEvidence: text("Add evidence", "Ongeza ushahidi", "Ajouter une preuve"),
  anonymous: text("Anonymous", "Bila jina", "Anonyme"),
  anonymousCommunityRecord: text(
    "Anonymous community record",
    "Rekodi ya jamii bila majina",
    "Registre communautaire anonyme",
  ),
  anonymousByDefault: text(
    "Anonymous by default",
    "Bila jina kwa msingi",
    "Anonyme par défaut",
  ),
  archived: text("Archived", "Imehifadhiwa", "Archivé"),
  availableLanguages: text("Available", "Zinapatikana", "Disponibles"),
  allChangesRelayed: text(
    "All changes relayed",
    "Mabadiliko yote yametumwa",
    "Tous les changements ont été relayés",
  ),
  archivedOnServer: text(
    "Archived on server",
    "Imehifadhiwa kwenye seva",
    "Archivé sur le serveur",
  ),
  autoSync: text("Auto-sync", "Usawazishaji wa moja kwa moja", "Synchronisation automatique"),
  brandTagline: text(
    "Promise tracking for civic memory",
    "Ufuatiliaji wa ahadi kwa kumbukumbu ya raia",
    "Suivi des promesses pour la mémoire civique",
  ),
  browse: text("Browse", "Vinjari", "Parcourir"),
  candidate: text("Candidate", "Mgombea", "Candidat"),
  candidates: text("Candidates", "Wagombea", "Candidats"),
  checkPoints: text("Checkpoints", "Hatua", "Jalons"),
  chooseSourceLabel: text("Choose a source label", "Chagua lebo ya chanzo", "Choisir une source"),
  communityContext: text("Community context", "Muktadha wa jamii", "Contexte communautaire"),
  complete: text("Complete", "Imekamilika", "Terminé"),
  confidenceLabel: text("Confidence label", "Lebo ya uhakika", "Niveau de confiance"),
  context: text("Context", "Muktadha", "Contexte"),
  contextNote: text("Context note", "Dokezo la muktadha", "Note de contexte"),
  contextNotes: text("Notes", "Madokezo", "Notes"),
  createdOffline: text("Created offline", "Imeundwa nje ya mtandao", "Créé hors ligne"),
  createdOnDevice: text(
    "Created on device",
    "Iliundwa kwenye kifaa",
    "Créé sur l'appareil",
  ),
  dashboard: text("Dashboard", "Dashibodi", "Tableau de bord"),
  deadline: text("Deadline", "Mwisho", "Échéance"),
  deviceSync: text("Device sync", "Usawazishaji wa vifaa", "Synchronisation des appareils"),
  due: text("Due", "Mwisho", "Échéance"),
  elected: text("Elected", "Alichaguliwa", "Élu"),
  evidence: text("Evidence", "Ushahidi", "Preuves"),
  evidenceAndContextPrivacy: text(
    "Evidence and context notes are displayed without identity.",
    "Ushahidi na madokezo ya muktadha huonyeshwa bila utambulisho.",
    "Les preuves et notes de contexte sont affichées sans identité.",
  ),
  evidenceNote: text("Evidence note", "Dokezo la ushahidi", "Note de preuve"),
  evidencePlaceholder: text(
    "What changed, where, and when?",
    "Nini kilibadilika, wapi, na lini?",
    "Qu'est-ce qui a changé, où et quand ?",
  ),
  evidenceType: text("Evidence type", "Aina ya ushahidi", "Type de preuve"),
  following: text("Following", "Unafuatilia", "Suivi"),
  followingDashboard: text(
    "Following dashboard",
    "Dashibodi ya ufuatiliaji",
    "Tableau de bord du suivi",
  ),
  history: text("History", "Historia", "Historique"),
  identityHidden: text("Identity hidden", "Utambulisho umefichwa", "Identité masquée"),
  interests: text("Interests", "Maslahi", "Centres d'intérêt"),
  dashboardHeaderBody: text(
    "Track followed promises, evidence, and anonymous context from one compact workspace.",
    "Fuatilia ahadi unazofuata, ushahidi, na muktadha bila majina kutoka sehemu moja fupi.",
    "Suivez les promesses suivies, les preuves et le contexte anonyme dans un espace compact.",
  ),
  manifestoHeaderBody: text(
    "Search current and archived manifestos without losing the selected promise record.",
    "Tafuta manifesto za sasa na zilizohifadhiwa bila kupoteza rekodi ya ahadi uliyochagua.",
    "Recherchez les manifestes actuels et archivés sans perdre la promesse sélectionnée.",
  ),
  language: text("Language", "Lugha", "Langue"),
  linkedEvidencePlural: text("linked evidence items", "vipengee vya ushahidi vilivyounganishwa", "éléments de preuve liés"),
  linkedEvidenceSingular: text("linked evidence item", "kipengee cha ushahidi kilichounganishwa", "élément de preuve lié"),
  manifesto: text("Manifesto", "Manifesto", "Manifeste"),
  manifestoBrowser: text("Manifesto browser", "Kivinjari cha manifesto", "Navigateur de manifestes"),
  noCommunityContext: text(
    "No community context notes have been added for this promise yet.",
    "Hakuna madokezo ya muktadha wa jamii yaliyoongezwa kwa ahadi hii bado.",
    "Aucune note de contexte communautaire n'a encore été ajoutée à cette promesse.",
  ),
  noContextForCandidate: text(
    "No context notes for this candidate yet.",
    "Hakuna madokezo ya muktadha kwa mgombea huyu bado.",
    "Aucune note de contexte pour ce candidat pour l'instant.",
  ),
  noEvidence: text(
    "No evidence has been added for this promise yet.",
    "Hakuna ushahidi umeongezwa kwa ahadi hii bado.",
    "Aucune preuve n'a encore été ajoutée à cette promesse.",
  ),
  noIdentityCollected: text(
    "No identity collected",
    "Hakuna utambulisho unaokusanywa",
    "Aucune identité collectée",
  ),
  noManifesto: text("No manifesto found", "Hakuna manifesto iliyopatikana", "Aucun manifeste trouvé"),
  noLocalChanges: text(
    "No local changes",
    "Hakuna mabadiliko ya kifaa",
    "Aucun changement local",
  ),
  noQueuedChanges: text(
    "No queued local changes.",
    "Hakuna mabadiliko ya kifaa yaliyopangwa.",
    "Aucun changement local en file.",
  ),
  noRelayedChanges: text(
    "No relayed changes yet.",
    "Hakuna mabadiliko yaliyotumwa bado.",
    "Aucun changement relayé pour l'instant.",
  ),
  noStatusChanges: text(
    "No status changes recorded yet.",
    "Hakuna mabadiliko ya hali yaliyorekodiwa bado.",
    "Aucun changement de statut enregistré pour l'instant.",
  ),
  noStatusForCandidate: text(
    "No status changes recorded for this candidate yet.",
    "Hakuna mabadiliko ya hali yaliyorekodiwa kwa mgombea huyu bado.",
    "Aucun changement de statut enregistré pour ce candidat pour l'instant.",
  ),
  office: text("Office", "Afisi", "Fonction"),
  offline: text("Offline", "Nje ya mtandao", "Hors ligne"),
  online: text("Online", "Mtandaoni", "En ligne"),
  original: text("Original", "Asili", "Original"),
  overview: text("Overview", "Muhtasari", "Vue d'ensemble"),
  pending: text("Pending", "Inasubiri", "En attente"),
  phoneRelayAdvertises: text(
    "This device advertises queued encrypted bundles nearby.",
    "Kifaa hiki hutangaza vifurushi vilivyosimbwa vilivyopangwa karibu.",
    "Cet appareil annonce les lots chiffrés en file à proximité.",
  ),
  phoneRelayCopies: text(
    "Nearby phones copy the bundle and can carry it forward.",
    "Simu zilizo karibu hunakili kifurushi na zinaweza kukipeleka mbele.",
    "Les téléphones proches copient le lot et peuvent le transporter plus loin.",
  ),
  phoneRelayPreview: text(
    "Nearby phone relay preview",
    "Onyesho la kupitisha kupitia simu zilizo karibu",
    "Aperçu du relais par téléphone proche",
  ),
  phoneRelayServerSeparate: text(
    "Server archive remains a separate sync target.",
    "Hifadhi ya seva hubaki kuwa lengo tofauti la usawazishaji.",
    "L'archive serveur reste une cible de synchronisation distincte.",
  ),
  place: text("Place", "Mahali", "Lieu"),
  primaryViews: text("Primary views", "Mitazamo mikuu", "Vues principales"),
  preparingStore: text(
    "Preparing local store",
    "Inatayarisha hifadhi ya kifaa",
    "Préparation du stockage local",
  ),
  priorityPromises: text("Priority promises", "Ahadi za kipaumbele", "Promesses prioritaires"),
  promiseDetail: text("Promise detail", "Maelezo ya ahadi", "Détail de la promesse"),
  promiseFacts: text("Promise facts", "Taarifa za ahadi", "Faits sur la promesse"),
  promiseStatusCounts: text("Promise status counts", "Hesabu za hali ya ahadi", "Comptes des statuts des promesses"),
  published: text("Published", "Ilichapishwa", "Publié"),
  queuedRecords: text("Queued records", "Rekodi zilizopangwa", "Enregistrements en file"),
  queued: text("queued", "zimepangwa", "en file"),
  queuedForSync: text("Queued for sync", "Imepangwa kwa usawazishaji", "En file pour synchronisation"),
  relayDevice: text("Relay device", "Kifaa cha kupokea", "Appareil relais"),
  relayedRecords: text("Relayed records", "Rekodi zilizotumwa", "Enregistrements relayés"),
  previewOnly: text("Preview only", "Onyesho tu", "Aperçu seulement"),
  recent: text("Recent", "Mpya", "Récent"),
  searchCandidatesAndPromises: text(
    "Search candidates and promises",
    "Tafuta wagombea na ahadi",
    "Rechercher des candidats et des promesses",
  ),
  searchPlaceholder: text(
    "Search place, office, sector",
    "Tafuta mahali, afisi, sekta",
    "Rechercher un lieu, une fonction, un secteur",
  ),
  sector: text("Sector", "Sekta", "Secteur"),
  selectPromise: text("Select a promise", "Chagua ahadi", "Sélectionner une promesse"),
  selectedManifestoStatusCounts: text(
    "Selected manifesto status counts",
    "Hesabu za hali za manifesto iliyochaguliwa",
    "Comptes des statuts du manifeste sélectionné",
  ),
  sentToRelay: text("Sent to relay", "Imetumwa kwenye kifaa", "Envoyé au relais"),
  sentToServer: text("Sent to server", "Imetumwa kwenye seva", "Envoyé au serveur"),
  serverArchive: text("Server archive", "Hifadhi ya seva", "Archive serveur"),
  serverArchiveRecords: text(
    "Synced records",
    "Rekodi zilizosawazishwa",
    "Enregistrements synchronisés",
  ),
  serverAutoSyncBody: text(
    "Online changes auto-sync to the simulated server. Offline changes stay queued until the device is back online.",
    "Mabadiliko ya mtandaoni husawazishwa moja kwa moja na seva ya mfano. Mabadiliko ya nje ya mtandao husalia kwenye foleni hadi kifaa kirudi mtandaoni.",
    "Les changements en ligne se synchronisent automatiquement avec le serveur simulé. Les changements hors ligne restent en file jusqu'au retour en ligne.",
  ),
  serverOfflineBody: text(
    "Offline mode is on. Evidence and context are saved locally and queued for the simulated server.",
    "Hali ya nje ya mtandao imewashwa. Ushahidi na muktadha huhifadhiwa kwenye kifaa na kupangwa kwa seva ya mfano.",
    "Le mode hors ligne est actif. Les preuves et le contexte sont enregistrés localement et mis en file pour le serveur simulé.",
  ),
  source: text("Source", "Chanzo", "Source"),
  sourceLabel: text("Source label", "Lebo ya chanzo", "Libellé de source"),
  statusChanges: text("Status changes", "Mabadiliko ya hali", "Changements de statut"),
  statusHistory: text("Status history", "Historia ya hali", "Historique du statut"),
  statusReason: text("Why the status changed", "Kwa nini hali ilibadilika", "Pourquoi le statut a changé"),
  storeAndForward: text("Store-and-forward", "Hifadhi kisha tuma", "Stocker puis transmettre"),
  syncFailed: text(
    "Could not update the local sync queue. Try again.",
    "Haikuweza kusasisha foleni ya kifaa. Jaribu tena.",
    "Impossible de mettre à jour la file locale. Réessayez.",
  ),
  syncLocalChanges: text(
    "Sync local changes",
    "Sawazisha mabadiliko ya kifaa",
    "Synchroniser les changements locaux",
  ),
  syncing: text("Syncing", "Inasawazisha", "Synchronisation"),
  syncedToRelay: text("Synced to relay", "Imesawazishwa kwenye kifaa", "Synchronisé au relais"),
  syncedToServer: text(
    "Synced to simulated server",
    "Imesawazishwa na seva ya mfano",
    "Synchronisé avec le serveur simulé",
  ),
  thisDevice: text("This device", "Kifaa hiki", "Cet appareil"),
  thisDeviceQueue: text("This device queue", "Foleni ya kifaa hiki", "File de cet appareil"),
  translationPending: text(
    "Translation pending",
    "Tafsiri inasubiri",
    "Traduction en attente",
  ),
  voiceAndAccountability: text("Voice & accountability", "Sauti na uwajibikaji", "Voix et redevabilité"),
  viewDetailsFor: text("View details for", "Tazama maelezo ya", "Voir les détails de"),
  watched: text("Watched", "Zinazofuatiliwa", "Surveillés"),
};

export const allOfficeFilterLabel = text("All offices", "Afisi zote", "Toutes les fonctions");
export const allSectorFilterLabel = text("All sectors", "Sekta zote", "Tous les secteurs");

export const officeLabels = {
  governor: text("Governor", "Gavana", "Gouverneur"),
  member_of_parliament: text("Member of Parliament", "Mbunge", "Député"),
  ward_representative: text("Ward Representative", "Mwakilishi wa wadi", "Représentant de quartier"),
} as const;

export const regionLabels = {
  kijani_east: text("Kijani East", "Kijani Mashariki", "Kijani Est"),
  lakeside_county: text("Lakeside County", "Kaunti ya Lakeside", "Comté de Lakeside"),
  mto_ward: text("Mto Ward", "Wadi ya Mto", "Quartier de Mto"),
} as const;

export const sectorLabels = {
  education: text("Education", "Elimu", "Éducation"),
  health: text("Health", "Afya", "Santé"),
  housing: text("Housing", "Makazi", "Logement"),
  infrastructure: text("Infrastructure", "Miundombinu", "Infrastructures"),
  jobs: text("Jobs", "Ajira", "Emploi"),
  safety: text("Safety", "Usalama", "Sécurité"),
  water: text("Water", "Maji", "Eau"),
} as const;

export const statusLabels = {
  at_risk: text("At risk", "Iko hatarini", "À risque"),
  in_progress: text("In progress", "Inaendelea", "En cours"),
  kept: text("Kept", "Imetimizwa", "Tenue"),
  missed: text("Missed", "Haikutimizwa", "Manquée"),
  not_started: text("Not started", "Haijaanza", "Non commencée"),
} as const;

export const evidenceTypeLabels = {
  community_report: text("Community report", "Ripoti ya jamii", "Rapport communautaire"),
  document: text("Document", "Hati", "Document"),
  photo: text("Photo", "Picha", "Photo"),
  public_record: text("Public record", "Rekodi ya umma", "Registre public"),
} as const;

export const confidenceLabels = {
  "community report": text("Community report", "Ripoti ya jamii", "Rapport communautaire"),
  "needs verification": text("Needs verification", "Inahitaji uthibitisho", "À vérifier"),
  "public record": text("Public record", "Rekodi ya umma", "Registre public"),
} as const;
