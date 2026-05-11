export type PromiseStatus =
  | "kept"
  | "in_progress"
  | "missed"
  | "not_started"
  | "at_risk";

export type CandidateStatus = "elected" | "archived";

export type Candidate = {
  id: string;
  name: string;
  office: string;
  region: string;
  electionYear: number;
  partyOrAffiliation: string;
  status: CandidateStatus;
};

export type Manifesto = {
  id: string;
  candidateId: string;
  title: string;
  publishedDate: string;
  sourceLabel: string;
  language: "en" | "sw" | "sheng";
};

export type Checkpoint = {
  label: string;
  dueDate: string;
  complete: boolean;
};

export type PromiseRecord = {
  id: string;
  manifestoId: string;
  title: string;
  sector: string;
  location: string;
  deadline: string;
  status: PromiseStatus;
  checkpoints: Checkpoint[];
  summariesByLanguage: {
    en: string;
    sw: string;
    sheng: string;
  };
};

export type Evidence = {
  id: string;
  promiseId: string;
  type: "photo" | "document" | "community_report" | "public_record";
  note: string;
  sourceLabel: string;
  anonymous: boolean;
  createdAt: string;
  createdOffline: boolean;
};

export type ContextNote = {
  id: string;
  promiseId: string;
  note: string;
  language: "en" | "sw" | "sheng";
  confidenceLabel: "community report" | "needs verification" | "public record";
  createdAt: string;
};

export type StatusHistory = {
  id: string;
  promiseId: string;
  status: PromiseStatus;
  reason: string;
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
    office: "Governor",
    region: "Lakeside County",
    electionYear: 2027,
    partyOrAffiliation: "People First Alliance",
    status: "elected",
  },
  {
    id: "cand-david",
    name: "David Ochieng",
    office: "Member of Parliament",
    region: "Kijani East",
    electionYear: 2027,
    partyOrAffiliation: "Independent",
    status: "elected",
  },
  {
    id: "cand-mary",
    name: "Mary Wambui",
    office: "Ward Representative",
    region: "Mto Ward",
    electionYear: 2027,
    partyOrAffiliation: "Civic Renewal Party",
    status: "elected",
  },
  {
    id: "cand-joseph",
    name: "Joseph Barasa",
    office: "Governor",
    region: "Lakeside County",
    electionYear: 2027,
    partyOrAffiliation: "County Reform Movement",
    status: "archived",
  },
  {
    id: "cand-nadia",
    name: "Nadia Hassan",
    office: "Member of Parliament",
    region: "Kijani East",
    electionYear: 2027,
    partyOrAffiliation: "Green Homes Coalition",
    status: "archived",
  },
];

export const manifestos: Manifesto[] = [
  {
    id: "mani-amina",
    candidateId: "cand-amina",
    title: "Lakeside County Compact",
    publishedDate: "2027-06-02",
    sourceLabel: "Campaign booklet, page 8",
    language: "en",
  },
  {
    id: "mani-david",
    candidateId: "cand-david",
    title: "Kijani East Jobs and Services Plan",
    publishedDate: "2027-05-18",
    sourceLabel: "Town hall transcript",
    language: "en",
  },
  {
    id: "mani-mary",
    candidateId: "cand-mary",
    title: "Mto Ward Everyday Services Pledge",
    publishedDate: "2027-05-27",
    sourceLabel: "Ward debate flyer",
    language: "sw",
  },
  {
    id: "mani-joseph",
    candidateId: "cand-joseph",
    title: "County Reform Manifesto",
    publishedDate: "2027-06-10",
    sourceLabel: "Radio debate notes",
    language: "en",
  },
  {
    id: "mani-nadia",
    candidateId: "cand-nadia",
    title: "Green Homes Constituency Agenda",
    publishedDate: "2027-05-22",
    sourceLabel: "Campaign website archive",
    language: "en",
  },
];

export const promises: PromiseRecord[] = [
  {
    id: "promise-clinic",
    manifestoId: "mani-amina",
    title: "Open three 24-hour maternal health clinics",
    sector: "Health",
    location: "Lakeside County",
    deadline: "2028-12-31",
    status: "in_progress",
    checkpoints: [
      { label: "Publish clinic sites", dueDate: "2028-03-30", complete: true },
      { label: "Hire night-shift nurses", dueDate: "2028-08-31", complete: false },
      { label: "Open all three clinics", dueDate: "2028-12-31", complete: false },
    ],
    summariesByLanguage: {
      en: "The county promised three clinics where mothers can receive care at night and on weekends.",
      sw: "Kaunti iliahidi kliniki tatu za uzazi zitakazofunguliwa usiku na wikendi.",
      sheng: "County ilisema kutakuwa na clinics tatu za akina mama, open hadi usiku.",
    },
  },
  {
    id: "promise-water",
    manifestoId: "mani-amina",
    title: "Repair stalled boreholes in dry wards",
    sector: "Water",
    location: "North Ridge and Mto Ward",
    deadline: "2028-06-30",
    status: "at_risk",
    checkpoints: [
      { label: "Audit stalled boreholes", dueDate: "2028-01-31", complete: true },
      { label: "Publish repair budget", dueDate: "2028-03-31", complete: false },
      { label: "Restore first ten sites", dueDate: "2028-06-30", complete: false },
    ],
    summariesByLanguage: {
      en: "Communities in dry wards should see broken boreholes audited, funded, and repaired.",
      sw: "Visima vibovu katika maeneo kame vinapaswa kukaguliwa, kuwekewa fedha, na kurekebishwa.",
      sheng: "Boreholes za dry wards ziliwekwa kwa promise ya kurepairiwa na budget iwe public.",
    },
  },
  {
    id: "promise-market",
    manifestoId: "mani-amina",
    title: "Build covered market stalls for small traders",
    sector: "Jobs",
    location: "Lakeside Town",
    deadline: "2029-03-31",
    status: "not_started",
    checkpoints: [
      { label: "Agree trader allocation rules", dueDate: "2028-09-30", complete: false },
      { label: "Begin market works", dueDate: "2028-12-31", complete: false },
    ],
    summariesByLanguage: {
      en: "The county said small traders would get safer covered stalls before the long rains.",
      sw: "Kaunti ilisema wafanyabiashara wadogo watapata vibanda vilivyofunikwa kabla ya mvua ndefu.",
      sheng: "Mama mboga na traders waliambiwa watapata stalls ziko covered before long rains.",
    },
  },
  {
    id: "promise-bursary",
    manifestoId: "mani-david",
    title: "Publish bursary awards every school term",
    sector: "Education",
    location: "Kijani East",
    deadline: "2028-04-30",
    status: "kept",
    checkpoints: [
      { label: "Open public application window", dueDate: "2028-01-15", complete: true },
      { label: "Publish first awards list", dueDate: "2028-04-30", complete: true },
    ],
    summariesByLanguage: {
      en: "Families can see who received education bursaries and when the next round opens.",
      sw: "Familia zinaweza kuona waliopata bursary na tarehe ya maombi yajayo.",
      sheng: "List ya bursary iko wazi sasa, parents wanaweza kucheck awards na next round.",
    },
  },
  {
    id: "promise-road",
    manifestoId: "mani-david",
    title: "Grade feeder roads before harvest season",
    sector: "Infrastructure",
    location: "Kijani East",
    deadline: "2028-02-28",
    status: "missed",
    checkpoints: [
      { label: "Map blocked farm routes", dueDate: "2027-12-15", complete: true },
      { label: "Complete first grading pass", dueDate: "2028-02-28", complete: false },
    ],
    summariesByLanguage: {
      en: "Farmers were promised graded feeder roads before harvest transport became urgent.",
      sw: "Wakulima waliahidiwa barabara za mashambani zitengenezwe kabla ya mavuno.",
      sheng: "Roads za kutoa mazao shambani zilikuwa promised before harvest, lakini deadline imepita.",
    },
  },
  {
    id: "promise-streetlights",
    manifestoId: "mani-mary",
    title: "Install solar streetlights near the bus stage",
    sector: "Safety",
    location: "Mto Ward",
    deadline: "2028-07-31",
    status: "in_progress",
    checkpoints: [
      { label: "Hold safety walk with residents", dueDate: "2028-02-10", complete: true },
      { label: "Install first ten lights", dueDate: "2028-07-31", complete: false },
    ],
    summariesByLanguage: {
      en: "Residents identified dark areas near the stage where solar lighting should improve safety.",
      sw: "Wakazi walitaja maeneo yenye giza karibu na stage ambapo taa za sola zinahitajika.",
      sheng: "Wasee walipoint spots za giza kwa stage; lights za solar zinafaa kuwekwa hapo.",
    },
  },
  {
    id: "promise-youth",
    manifestoId: "mani-joseph",
    title: "Launch a youth public works fund",
    sector: "Jobs",
    location: "Lakeside County",
    deadline: "2028-10-31",
    status: "not_started",
    checkpoints: [
      { label: "Release fund rules", dueDate: "2028-04-30", complete: false },
      { label: "Open first works round", dueDate: "2028-10-31", complete: false },
    ],
    summariesByLanguage: {
      en: "The archived campaign promised paid public works for young people across the county.",
      sw: "Kampeni iliyohifadhiwa iliahidi kazi za umma za kulipwa kwa vijana wa kaunti.",
      sheng: "Archived promise ilikuwa jobs za youth kwa public works county-wide.",
    },
  },
  {
    id: "promise-housing",
    manifestoId: "mani-nadia",
    title: "Map unsafe rental housing near factories",
    sector: "Housing",
    location: "Kijani East",
    deadline: "2028-05-31",
    status: "not_started",
    checkpoints: [
      { label: "Train tenant safety volunteers", dueDate: "2028-03-15", complete: false },
      { label: "Publish anonymous risk map", dueDate: "2028-05-31", complete: false },
    ],
    summariesByLanguage: {
      en: "The archived candidate proposed a tenant-led map of unsafe rental blocks near factories.",
      sw: "Mgombea aliyehifadhiwa alipendekeza ramani ya nyumba hatari karibu na viwanda.",
      sheng: "Idea ilikuwa tenants wa-map rentals unsafe around factories bila kujiweka kwa risk.",
    },
  },
];

export const evidence: Evidence[] = [
  {
    id: "evidence-bursary-list",
    promiseId: "promise-bursary",
    type: "public_record",
    note: "First term bursary list posted at the constituency office and copied to school heads.",
    sourceLabel: "Constituency notice board",
    anonymous: true,
    createdAt: "2028-05-02T09:30:00.000Z",
    createdOffline: false,
  },
  {
    id: "evidence-road-photos",
    promiseId: "promise-road",
    type: "community_report",
    note: "Two feeder roads remain impassable after rain; residents report no grader visit since January.",
    sourceLabel: "Anonymous resident report",
    anonymous: true,
    createdAt: "2028-03-07T16:10:00.000Z",
    createdOffline: true,
  },
  {
    id: "evidence-water-audit",
    promiseId: "promise-water",
    type: "document",
    note: "County audit lists 17 stalled boreholes but no repair budget line yet.",
    sourceLabel: "County water committee minutes",
    anonymous: true,
    createdAt: "2028-04-12T11:45:00.000Z",
    createdOffline: false,
  },
];

export const contextNotes: ContextNote[] = [
  {
    id: "context-clinic-staffing",
    promiseId: "promise-clinic",
    note: "Clinic construction alone will not meet the pledge unless night staffing is funded.",
    language: "en",
    confidenceLabel: "community report",
    createdAt: "2028-04-16T08:20:00.000Z",
  },
  {
    id: "context-road-harvest",
    promiseId: "promise-road",
    note: "The missed grading deadline matters because maize transport starts before the next county sitting.",
    language: "en",
    confidenceLabel: "needs verification",
    createdAt: "2028-03-08T13:00:00.000Z",
  },
];

export const statusHistory: StatusHistory[] = [
  {
    id: "history-bursary-kept",
    promiseId: "promise-bursary",
    status: "kept",
    reason: "Published award list was confirmed after the first term application window.",
    evidenceIds: ["evidence-bursary-list"],
    createdAt: "2028-05-04T10:00:00.000Z",
  },
  {
    id: "history-road-missed",
    promiseId: "promise-road",
    status: "missed",
    reason: "The harvest-season deadline passed with only mapping complete.",
    evidenceIds: ["evidence-road-photos"],
    createdAt: "2028-03-09T10:00:00.000Z",
  },
  {
    id: "history-water-risk",
    promiseId: "promise-water",
    status: "at_risk",
    reason: "The audit is done, but the repair budget checkpoint is late.",
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
