import { MachineCategory, CraneType } from "@/types/machine";

export const categories: MachineCategory[] = [
  "Excavator",
  "Concrete Pump",
  "Fiori",
  "JCB",
  "Crane",
];

export const craneTypes: CraneType[] = [
  "Hydra",
  "Mobile Crane",
  "Rough Terrain Crane",
  "Tower Crane",
];

// Companies for normal (non-crane) categories
export const companiesByCategory: { [key: string]: string[] } = {
  Excavator: ["JCB", "CAT", "Tata Hitachi", "Komatsu", "Volvo", "SANY", "Hyundai"],
  "Concrete Pump": [
    "Schwing Stetter",
    "SANY India",
    "Putzmeister India",
    "Aquarius Engineering",
    "Ajax Engineering",
  ],
  "Fiori": ["Ajax Engineering"],
  JCB: ["JCB"],
};

// Models for normal categories (category → company → models)
export const modelsByCategoryAndCompany: { [key: string]: { [key: string]: string[] } } = {
  Excavator: {
    JCB: [
      "520X", "JCB 8I", "JCB 130", "NXT 140", "NXT 145 Quarry Master",
      "NXT 150", "NXT 205", "NXT 210", "NXT 225 LCM", "345 LC", "385 LC",
    ],
    CAT: ["CAT 316GC", "CAT 321", "CAT 322", "CAT 324", "CAT 330GC", "CAT 350"],
    "Tata Hitachi": [
      "EX130 Prime", "ZAXIS 140H", "EX200 Infra", "EX200LC Prime",
      "EX210", "EX215 LCQ", "ZAXIS 220LC", "EX350", "ZAXIS 370 LCH",
    ],
    Komatsu: ["PC71", "PC81", "PC130-7", "PC136-7"],
    Volvo: ["EC950E", "EC750D", "EC550E", "EC480D", "EC380D", "EC300D"],
    SANY: [
      "SY55C", "SY75C", "SY80U", "SY135C", "SY135F",
      "SY155U", "SY155H", "SY365H", "SY375H", "SY550HD", "SY980H",
    ],
    Hyundai: [
      "R130", "R140", "R210", "R215", "R245LR",
      "R220LS", "R230", "R340L", "HX360L", "HX380", "HX520L",
    ],
  },
  "Concrete Pump": {
    "Schwing Stetter": [
      "BP 350", "SP 1000", "SP 1200", "SP 1300", "SP 1400",
      "SP 3500", "SP 4507", "SP 4800", "SP 8800",
    ],
    "SANY India": [
      "HGR21 III", "HGR28 III", "HGR 33 IV", "HGR 36 IV",
      "HGT45", "HGT51", "HGY18 III",
    ],
    "Putzmeister India": [
      "BSA 1404", "BSA 1405D", "BSA 1406-E", "BSA 1407-D",
      "BSA 1407-D Ultimata", "BSA 1407 HD", "BSA 1408",
      "BSA 1410", "BSA 2109 HD",
    ],
    "Aquarius Engineering": ["703D", "704D", "1405D", "1405D Prime", "1407D"],
    "Ajax Engineering": ["ASP 3009", "ASP 4011", "ASP 5009", "ARGO 7011", "ASP 10012"],
  },
  "Fiori": {
    "Ajax Engineering": [
      "Argo 1000", "Argo 2000", "Argo 2500",
      "Argo 3000", "Argo 4000", "Argo 4300", "Argo 4800",
      "Udaan",
    ],
  },
  JCB: {
    JCB: ["JCB 3DX", "JCB 3DX Super", "JCB 4DX", "JCB 3CX", "JCB 4CX"],
  },
};

// Companies for each crane sub-type
export const companiesByCraneType: { [key: string]: string[] } = {
  Hydra: ["ACE", "Escorts Kubota", "Indo Farm", "Tata Hitachi"],
  "Mobile Crane": ["ACE", "Escorts Kubota", "Tata Hitachi"],
  "Rough Terrain Crane": ["Escorts Kubota", "Tractors India"],
  "Tower Crane": ["Indo Farm"],
};

// Models for crane sub-types (craneType → company → models)
export const craneModelsByTypeAndCompany: { [key: string]: { [key: string]: string[] } } = {
  Hydra: {
    ACE: ["12XW", "14XW", "15XW", "15XWE", "16XW", "18XW", "20XW", "25XW"],
    "Escorts Kubota": ["Hydra 12", "Hydra 14", "Hydra 15"],
    "Indo Farm": [
      "15FN", "15FNV", "15FNT", "23FN",
      "15FNX", "17 FNX", "30 FNX",
    ],
    "Tata Hitachi": ["TFC 75", "TFC 280"],
  },
  "Mobile Crane": {
    ACE: ["Rhino 90C", "Rhino 110C", "HXP 150"],
    "Escorts Kubota": ["F-15", "F-15 Fighter", "F-17"],
    "Tata Hitachi": ["KH500"],
  },
  "Rough Terrain Crane": {
    "Escorts Kubota": ["RT20", "RT30", "RT40"],
    "Tractors India": ["Husky 620", "RT 630C", "RT 740B", "RT 760", "RT 880"],
  },
  "Tower Crane": {
    "Indo Farm": ["16T", "20T", "25T", "25T Mining Master"],
  },
};

export const companies = [
  ...new Set([
    ...Object.values(companiesByCategory).flat(),
    ...Object.values(companiesByCraneType).flat(),
  ]),
];

export const locations = [
  "Indore",
  "Dewas",
  "Ujjain",
  "Bhopal",
  "Pithampur",
  "Gwalior",
  "Other",
];