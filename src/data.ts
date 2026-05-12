import {
  completeUserText,
  regionLabels,
  text,
  type LanguageCode,
  type LocalizedText,
  type UserLocalizedText,
} from "./i18n";

export type PromiseStatus =
  | "kept"
  | "in_progress"
  | "missed"
  | "not_started"
  | "at_risk";

export type CandidateStatus = "elected" | "archived";
export type OfficeCode = "governor" | "member_of_parliament" | "ward_representative";
export type RegionCode = keyof typeof regionLabels;
export type SectorCode =
  | "education"
  | "health"
  | "housing"
  | "infrastructure"
  | "jobs"
  | "safety"
  | "water";

export type Candidate = {
  id: string;
  name: string;
  office: OfficeCode;
  region: RegionCode;
  electionYear: number;
  partyOrAffiliation: LocalizedText;
  status: CandidateStatus;
};

export type Manifesto = {
  id: string;
  candidateId: string;
  title: LocalizedText;
  publishedDate: string;
  sourceLabel: LocalizedText;
  originalLanguage: LanguageCode;
};

export type Checkpoint = {
  label: LocalizedText;
  dueDate: string;
  complete: boolean;
};

export type PromiseRecord = {
  id: string;
  manifestoId: string;
  title: LocalizedText;
  sector: SectorCode;
  location: LocalizedText;
  deadline: string;
  status: PromiseStatus;
  checkpoints: Checkpoint[];
  summary: LocalizedText;
};

export type Evidence = {
  id: string;
  promiseId: string;
  type: "photo" | "document" | "community_report" | "public_record";
  note: UserLocalizedText;
  sourceLabel: LocalizedText;
  anonymous: boolean;
  createdAt: string;
  createdOffline: boolean;
};

export type ContextNote = {
  id: string;
  promiseId: string;
  note: UserLocalizedText;
  confidenceLabel: "community report" | "needs verification" | "public record";
  createdAt: string;
};

export type StatusHistory = {
  id: string;
  promiseId: string;
  status: PromiseStatus;
  reason: LocalizedText;
  evidenceIds: string[];
  createdAt: string;
};

export type SyncEnvelope = {
  id: string;
  entityType: "evidence" | "context_note" | "status_history";
  entityId: string;
  operation: "create" | "update";
  payload: Record<string, unknown>;
  createdAt: string;
  syncedAt?: string;
};

export const candidates: Candidate[] = [
  {
    id: "cand-amina",
    name: "Amina Njoroge",
    office: "governor",
    region: "lakeside_county",
    electionYear: 2027,
    partyOrAffiliation: text("People First Alliance", "People First Alliance", "People First Alliance"),
    status: "elected",
  },
  {
    id: "cand-david",
    name: "David Ochieng",
    office: "member_of_parliament",
    region: "kijani_east",
    electionYear: 2027,
    partyOrAffiliation: text("Independent", "Huru", "Indépendant"),
    status: "elected",
  },
  {
    id: "cand-mary",
    name: "Mary Wambui",
    office: "ward_representative",
    region: "mto_ward",
    electionYear: 2027,
    partyOrAffiliation: text("Civic Renewal Party", "Civic Renewal Party", "Civic Renewal Party"),
    status: "elected",
  },
  {
    id: "cand-joseph",
    name: "Joseph Barasa",
    office: "governor",
    region: "lakeside_county",
    electionYear: 2027,
    partyOrAffiliation: text(
      "County Reform Movement",
      "County Reform Movement",
      "County Reform Movement",
    ),
    status: "archived",
  },
  {
    id: "cand-nadia",
    name: "Nadia Hassan",
    office: "member_of_parliament",
    region: "kijani_east",
    electionYear: 2027,
    partyOrAffiliation: text("Green Homes Coalition", "Green Homes Coalition", "Green Homes Coalition"),
    status: "archived",
  },
];

export const manifestos: Manifesto[] = [
  {
    id: "mani-amina",
    candidateId: "cand-amina",
    title: text("Lakeside County Compact", "Makubaliano ya Kaunti ya Lakeside", "Pacte du comté de Lakeside"),
    publishedDate: "2027-06-02",
    sourceLabel: text("Campaign booklet, page 8", "Kijitabu cha kampeni, ukurasa 8", "Livret de campagne, page 8"),
    originalLanguage: "en",
  },
  {
    id: "mani-david",
    candidateId: "cand-david",
    title: text(
      "Kijani East Jobs and Services Plan",
      "Mpango wa Ajira na Huduma wa Kijani Mashariki",
      "Plan pour l'emploi et les services de Kijani Est",
    ),
    publishedDate: "2027-05-18",
    sourceLabel: text("Town hall transcript", "Nakala ya mkutano wa umma", "Transcription de réunion publique"),
    originalLanguage: "en",
  },
  {
    id: "mani-mary",
    candidateId: "cand-mary",
    title: text(
      "Mto Ward Everyday Services Pledge",
      "Ahadi ya Huduma za Kila Siku ya Wadi ya Mto",
      "Engagement pour les services quotidiens du quartier de Mto",
    ),
    publishedDate: "2027-05-27",
    sourceLabel: text("Ward debate flyer", "Kipeperushi cha mdahalo wa wadi", "Tract du débat de quartier"),
    originalLanguage: "sw",
  },
  {
    id: "mani-joseph",
    candidateId: "cand-joseph",
    title: text("County Reform Manifesto", "Manifesto ya Mageuzi ya Kaunti", "Manifeste pour la réforme du comté"),
    publishedDate: "2027-06-10",
    sourceLabel: text("Radio debate notes", "Madokezo ya mdahalo wa redio", "Notes du débat radio"),
    originalLanguage: "en",
  },
  {
    id: "mani-nadia",
    candidateId: "cand-nadia",
    title: text(
      "Green Homes Constituency Agenda",
      "Ajenda ya Makazi Salama ya Eneo Bunge",
      "Programme de logements sûrs de la circonscription",
    ),
    publishedDate: "2027-05-22",
    sourceLabel: text("Campaign website archive", "Hifadhi ya tovuti ya kampeni", "Archive du site de campagne"),
    originalLanguage: "en",
  },
];

export const promises: PromiseRecord[] = [
  {
    id: "promise-clinic",
    manifestoId: "mani-amina",
    title: text(
      "Open three 24-hour maternal health clinics",
      "Fungua kliniki tatu za uzazi za saa 24",
      "Ouvrir trois cliniques de santé maternelle ouvertes 24 h/24",
    ),
    sector: "health",
    location: text("Lakeside County", "Kaunti ya Lakeside", "Comté de Lakeside"),
    deadline: "2028-12-31",
    status: "in_progress",
    checkpoints: [
      {
        label: text("Publish clinic sites", "Chapisha maeneo ya kliniki", "Publier les sites des cliniques"),
        dueDate: "2028-03-30",
        complete: true,
      },
      {
        label: text("Hire night-shift nurses", "Ajiri wauguzi wa zamu ya usiku", "Recruter des infirmières de nuit"),
        dueDate: "2028-08-31",
        complete: false,
      },
      {
        label: text("Open all three clinics", "Fungua kliniki zote tatu", "Ouvrir les trois cliniques"),
        dueDate: "2028-12-31",
        complete: false,
      },
    ],
    summary: text(
      "The county promised three clinics where mothers can receive care at night and on weekends.",
      "Kaunti iliahidi kliniki tatu ambako akina mama wanaweza kupata huduma usiku na wikendi.",
      "Le comté a promis trois cliniques où les mères peuvent recevoir des soins la nuit et le week-end.",
    ),
  },
  {
    id: "promise-water",
    manifestoId: "mani-amina",
    title: text(
      "Repair stalled boreholes in dry wards",
      "Rekebisha visima vilivyokwama katika wadi kame",
      "Réparer les forages bloqués dans les quartiers arides",
    ),
    sector: "water",
    location: text("North Ridge and Mto Ward", "North Ridge na Wadi ya Mto", "North Ridge et quartier de Mto"),
    deadline: "2028-06-30",
    status: "at_risk",
    checkpoints: [
      {
        label: text("Audit stalled boreholes", "Kagua visima vilivyokwama", "Auditer les forages bloqués"),
        dueDate: "2028-01-31",
        complete: true,
      },
      {
        label: text("Publish repair budget", "Chapisha bajeti ya ukarabati", "Publier le budget de réparation"),
        dueDate: "2028-03-31",
        complete: false,
      },
      {
        label: text("Restore first ten sites", "Rejesha maeneo kumi ya kwanza", "Remettre en service les dix premiers sites"),
        dueDate: "2028-06-30",
        complete: false,
      },
    ],
    summary: text(
      "Communities in dry wards should see broken boreholes audited, funded, and repaired.",
      "Jamii katika wadi kame zinapaswa kuona visima vibovu vikikaguliwa, kupewa fedha, na kurekebishwa.",
      "Les communautés des quartiers arides devraient voir les forages défectueux audités, financés et réparés.",
    ),
  },
  {
    id: "promise-market",
    manifestoId: "mani-amina",
    title: text(
      "Build covered market stalls for small traders",
      "Jenga vibanda vilivyofunikwa kwa wafanyabiashara wadogo",
      "Construire des étals couverts pour les petits commerçants",
    ),
    sector: "jobs",
    location: text("Lakeside Town", "Mji wa Lakeside", "Ville de Lakeside"),
    deadline: "2029-03-31",
    status: "not_started",
    checkpoints: [
      {
        label: text(
          "Agree trader allocation rules",
          "Kubali kanuni za kugawa vibanda",
          "Convenir des règles d'attribution aux commerçants",
        ),
        dueDate: "2028-09-30",
        complete: false,
      },
      {
        label: text("Begin market works", "Anza kazi za soko", "Commencer les travaux du marché"),
        dueDate: "2028-12-31",
        complete: false,
      },
    ],
    summary: text(
      "The county said small traders would get safer covered stalls before the long rains.",
      "Kaunti ilisema wafanyabiashara wadogo watapata vibanda salama vilivyofunikwa kabla ya mvua ndefu.",
      "Le comté a déclaré que les petits commerçants recevraient des étals couverts plus sûrs avant les longues pluies.",
    ),
  },
  {
    id: "promise-bursary",
    manifestoId: "mani-david",
    title: text(
      "Publish bursary awards every school term",
      "Chapisha orodha ya bursary kila muhula",
      "Publier les bourses attribuées à chaque trimestre scolaire",
    ),
    sector: "education",
    location: text("Kijani East", "Kijani Mashariki", "Kijani Est"),
    deadline: "2028-04-30",
    status: "kept",
    checkpoints: [
      {
        label: text(
          "Open public application window",
          "Fungua muda wa maombi kwa umma",
          "Ouvrir la période de candidature publique",
        ),
        dueDate: "2028-01-15",
        complete: true,
      },
      {
        label: text("Publish first awards list", "Chapisha orodha ya kwanza ya waliopata", "Publier la première liste des bénéficiaires"),
        dueDate: "2028-04-30",
        complete: true,
      },
    ],
    summary: text(
      "Families can see who received education bursaries and when the next round opens.",
      "Familia zinaweza kuona waliopata bursary na wakati awamu inayofuata itafunguliwa.",
      "Les familles peuvent voir qui a reçu les bourses scolaires et quand le prochain cycle ouvrira.",
    ),
  },
  {
    id: "promise-road",
    manifestoId: "mani-david",
    title: text(
      "Grade feeder roads before harvest season",
      "Tengeneza barabara za mashambani kabla ya msimu wa mavuno",
      "Niveler les routes de desserte avant la saison des récoltes",
    ),
    sector: "infrastructure",
    location: text("Kijani East", "Kijani Mashariki", "Kijani Est"),
    deadline: "2028-02-28",
    status: "missed",
    checkpoints: [
      {
        label: text("Map blocked farm routes", "Tambua njia za mashambani zilizoziba", "Cartographier les routes agricoles bloquées"),
        dueDate: "2027-12-15",
        complete: true,
      },
      {
        label: text("Complete first grading pass", "Kamilisha awamu ya kwanza ya kutengeneza barabara", "Achever le premier passage de nivellement"),
        dueDate: "2028-02-28",
        complete: false,
      },
    ],
    summary: text(
      "Farmers were promised graded feeder roads before harvest transport became urgent.",
      "Wakulima waliahidiwa barabara za mashambani zitengenezwe kabla usafirishaji wa mavuno uwe wa dharura.",
      "Les agriculteurs avaient reçu la promesse de routes de desserte nivelées avant que le transport des récoltes devienne urgent.",
    ),
  },
  {
    id: "promise-streetlights",
    manifestoId: "mani-mary",
    title: text(
      "Install solar streetlights near the bus stage",
      "Weka taa za sola karibu na kituo cha basi",
      "Installer des lampadaires solaires près de l'arrêt de bus",
    ),
    sector: "safety",
    location: text("Mto Ward", "Wadi ya Mto", "Quartier de Mto"),
    deadline: "2028-07-31",
    status: "in_progress",
    checkpoints: [
      {
        label: text("Hold safety walk with residents", "Fanya matembezi ya usalama na wakazi", "Organiser une marche de sécurité avec les habitants"),
        dueDate: "2028-02-10",
        complete: true,
      },
      {
        label: text("Install first ten lights", "Weka taa kumi za kwanza", "Installer les dix premiers lampadaires"),
        dueDate: "2028-07-31",
        complete: false,
      },
    ],
    summary: text(
      "Residents identified dark areas near the stage where solar lighting should improve safety.",
      "Wakazi walitaja maeneo yenye giza karibu na stage ambapo taa za sola zinapaswa kuboresha usalama.",
      "Les habitants ont identifié des zones sombres près de l'arrêt où l'éclairage solaire devrait améliorer la sécurité.",
    ),
  },
  {
    id: "promise-youth",
    manifestoId: "mani-joseph",
    title: text(
      "Launch a youth public works fund",
      "Anzisha mfuko wa kazi za umma kwa vijana",
      "Lancer un fonds de travaux publics pour les jeunes",
    ),
    sector: "jobs",
    location: text("Lakeside County", "Kaunti ya Lakeside", "Comté de Lakeside"),
    deadline: "2028-10-31",
    status: "not_started",
    checkpoints: [
      {
        label: text("Release fund rules", "Toa kanuni za mfuko", "Publier les règles du fonds"),
        dueDate: "2028-04-30",
        complete: false,
      },
      {
        label: text("Open first works round", "Fungua awamu ya kwanza ya kazi", "Ouvrir le premier cycle de travaux"),
        dueDate: "2028-10-31",
        complete: false,
      },
    ],
    summary: text(
      "The archived campaign promised paid public works for young people across the county.",
      "Kampeni iliyohifadhiwa iliahidi kazi za umma za kulipwa kwa vijana kote kaunti.",
      "La campagne archivée promettait des travaux publics rémunérés pour les jeunes dans tout le comté.",
    ),
  },
  {
    id: "promise-housing",
    manifestoId: "mani-nadia",
    title: text(
      "Map unsafe rental housing near factories",
      "Tambua nyumba za kupanga zisizo salama karibu na viwanda",
      "Cartographier les logements locatifs dangereux près des usines",
    ),
    sector: "housing",
    location: text("Kijani East", "Kijani Mashariki", "Kijani Est"),
    deadline: "2028-05-31",
    status: "not_started",
    checkpoints: [
      {
        label: text("Train tenant safety volunteers", "Funza wajitolea wa usalama wa wapangaji", "Former des bénévoles locataires à la sécurité"),
        dueDate: "2028-03-15",
        complete: false,
      },
      {
        label: text("Publish anonymous risk map", "Chapisha ramani ya hatari bila majina", "Publier une carte anonyme des risques"),
        dueDate: "2028-05-31",
        complete: false,
      },
    ],
    summary: text(
      "The archived candidate proposed a tenant-led map of unsafe rental blocks near factories.",
      "Mgombea aliyehifadhiwa alipendekeza ramani inayoongozwa na wapangaji ya nyumba hatari karibu na viwanda.",
      "La candidate archivée proposait une carte menée par les locataires des immeubles dangereux près des usines.",
    ),
  },
];

export const evidence: Evidence[] = [
  {
    id: "evidence-bursary-list",
    promiseId: "promise-bursary",
    type: "public_record",
    note: completeUserText(
      text(
        "First term bursary list posted at the constituency office and copied to school heads.",
        "Orodha ya bursary ya muhula wa kwanza iliwekwa katika afisi ya eneo bunge na kutumwa kwa wakuu wa shule.",
        "La liste des bourses du premier trimestre a été affichée au bureau de la circonscription et transmise aux chefs d'établissement.",
      ),
    ),
    sourceLabel: text("Constituency notice board", "Ubao wa matangazo wa eneo bunge", "Tableau d'affichage de la circonscription"),
    anonymous: true,
    createdAt: "2028-05-02T09:30:00.000Z",
    createdOffline: false,
  },
  {
    id: "evidence-road-photos",
    promiseId: "promise-road",
    type: "community_report",
    note: completeUserText(
      text(
        "Two feeder roads remain impassable after rain; residents report no grader visit since January.",
        "Barabara mbili za mashambani bado hazipitiki baada ya mvua; wakazi wanasema grader haijafika tangu Januari.",
        "Deux routes de desserte restent impraticables après la pluie ; les habitants signalent qu'aucune niveleuse n'est venue depuis janvier.",
      ),
    ),
    sourceLabel: text("Anonymous resident report", "Ripoti ya mkazi bila jina", "Rapport anonyme d'un habitant"),
    anonymous: true,
    createdAt: "2028-03-07T16:10:00.000Z",
    createdOffline: true,
  },
  {
    id: "evidence-water-audit",
    promiseId: "promise-water",
    type: "document",
    note: completeUserText(
      text(
        "County audit lists 17 stalled boreholes but no repair budget line yet.",
        "Ukaguzi wa kaunti unaorodhesha visima 17 vilivyokwama lakini hakuna bajeti ya ukarabati bado.",
        "L'audit du comté recense 17 forages bloqués, mais aucune ligne budgétaire de réparation n'est encore prévue.",
      ),
    ),
    sourceLabel: text("County water committee minutes", "Muhtasari wa kamati ya maji ya kaunti", "Procès-verbal du comité de l'eau du comté"),
    anonymous: true,
    createdAt: "2028-04-12T11:45:00.000Z",
    createdOffline: false,
  },
];

export const contextNotes: ContextNote[] = [
  {
    id: "context-clinic-staffing",
    promiseId: "promise-clinic",
    note: completeUserText(
      text(
        "Clinic construction alone will not meet the pledge unless night staffing is funded.",
        "Ujenzi wa kliniki pekee hautatimiza ahadi bila fedha za wafanyakazi wa usiku.",
        "La construction des cliniques ne suffira pas à tenir la promesse sans financement du personnel de nuit.",
      ),
    ),
    confidenceLabel: "community report",
    createdAt: "2028-04-16T08:20:00.000Z",
  },
  {
    id: "context-road-harvest",
    promiseId: "promise-road",
    note: completeUserText(
      text(
        "The missed grading deadline matters because maize transport starts before the next county sitting.",
        "Mwisho uliokosekana wa kutengeneza barabara ni muhimu kwa sababu usafirishaji wa mahindi huanza kabla ya kikao kijacho cha kaunti.",
        "L'échéance manquée du nivellement compte parce que le transport du maïs commence avant la prochaine séance du comté.",
      ),
    ),
    confidenceLabel: "needs verification",
    createdAt: "2028-03-08T13:00:00.000Z",
  },
];

export const statusHistory: StatusHistory[] = [
  {
    id: "history-bursary-kept",
    promiseId: "promise-bursary",
    status: "kept",
    reason: text(
      "Published award list was confirmed after the first term application window.",
      "Orodha iliyochapishwa ya waliopata ilithibitishwa baada ya kipindi cha maombi ya muhula wa kwanza.",
      "La liste publiée des bénéficiaires a été confirmée après la période de candidature du premier trimestre.",
    ),
    evidenceIds: ["evidence-bursary-list"],
    createdAt: "2028-05-04T10:00:00.000Z",
  },
  {
    id: "history-road-missed",
    promiseId: "promise-road",
    status: "missed",
    reason: text(
      "The harvest-season deadline passed with only mapping complete.",
      "Mwisho wa msimu wa mavuno ulipita huku utambuzi wa njia pekee ukiwa umekamilika.",
      "L'échéance de la saison des récoltes est passée alors que seule la cartographie était terminée.",
    ),
    evidenceIds: ["evidence-road-photos"],
    createdAt: "2028-03-09T10:00:00.000Z",
  },
  {
    id: "history-water-risk",
    promiseId: "promise-water",
    status: "at_risk",
    reason: text(
      "The audit is done, but the repair budget checkpoint is late.",
      "Ukaguzi umekamilika, lakini hatua ya bajeti ya ukarabati imechelewa.",
      "L'audit est terminé, mais le jalon du budget de réparation est en retard.",
    ),
    evidenceIds: ["evidence-water-audit"],
    createdAt: "2028-04-15T10:00:00.000Z",
  },
];

export const syncQueue: SyncEnvelope[] = [
  {
    id: "sync-evidence-road-photos",
    entityType: "evidence",
    entityId: "evidence-road-photos",
    operation: "create",
    payload: { promiseId: "promise-road", createdOffline: true },
    createdAt: "2028-03-07T16:10:00.000Z",
  },
];
