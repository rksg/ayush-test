export enum FeatureFlag {
  DEFAULT_TREATMENT = 'on',
  DEFAULT_TREATMENT_ON = 'on',
  DEFAULT_TREATMENT_OFF = 'off'
}

export enum Tier {
  TIER_GOLD = 'Gold-NA',
  TIER_FREEMIUM = 'Default-GLOBAL',
  TIER_PLATINUM = 'Platinum-NA'
}

export enum Region {
  REGION_NA = 'NA',
  REGION_EU = 'EU',
  REGION_ASIA = 'AS'
}

export enum Vertical {
  VERTICAL_DEFAULT = 'Default',
  VERTICAL_HOSPITALITY = 'Hospitality',
  VERTICAL_EDU = 'Education',
}

export enum TenantType {
  REC = 'REC',
  MSP = 'MSP'
}

export const defaultConfig = {
  'feature-REC-Default': ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS',
    'ANLT-ESNTLS', 'ANLT-FNDT', 'PLCY ESNTLS', 'API-CLOUD'],
  'feature-REC-Education': ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS',
    'ANLT-ESNTLS', 'ANLT-FNDT', 'PLCY ESNTLS', 'API-CLOUD'],
  'feature-MSP-Default': ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS',
    'ANLT-FNDT', 'ANLT-ADV', 'ANLT-STUDIO', 'PLCY ESNTLS', 'PLCY-SGMNT', 'API-CLOUD'],
  'feature-MSP-Hospitality': ['ADMN-ESNTLS', 'CNFG-ESNTLS', 'NTFY-ESNTLS', 'ANLT-ESNTLS',
    'ANLT-FNDT', 'ANLT-ADV', 'ANLT-STUDIO', 'PLCY ESNTLS', 'PLCY-SGMNT', 'API-CLOUD']
}
