export enum EdgePortTypeEnum {
  UNCONFIGURED = 'UNCONFIGURED',
  WAN = 'WAN',
  LAN = 'LAN'
}

export enum EdgeIpModeEnum {
  DHCP = 'DHCP',
  STATIC = 'STATIC'
}

export enum EdgePortAdminStatusEnum {
  Enabled = 'Enabled',
  Disabled = 'Disabled'
}

export enum EdgeResourceUtilizationEnum {
  CPU = 'CPU',
  MEMORY = 'MEMORY',
  STORAGE = 'STORAGE'
}

export enum EdgeStatusEnum {
  NEVER_CONTACTED_CLOUD = '1_01_NeverContactedCloud',
  INITIALIZING = '1_07_Initializing',
  NEEDS_CONFIG = '1_10_NeedsConfig',
  OPERATIONAL = '2_00_Operational',
  APPLYING_CONFIGURATION = '2_02_ApplyingConfiguration',
  DISCONNECTED_FROM_CLOUD = '3_04_DisconnectedFromCloud'
}

export enum EdgeStatusSeverityEnum {
  IN_SETUP_PHASE = '1_InSetupPhase',
  OFFLINE = '1_InSetupPhase_Offline',
  OPERATIONAL = '2_Operational',
  REQUIRES_ATTENTION = '3_RequiresAttention',
  TRANSIENT_ISSUE = '4_TransientIssue'
}

export enum EdgeDhcpServiceStatusEnum {
  GOOD = 'Good',
  REQUIRES_ATTENTION = 'Requires Attention',
  POOR = 'Poor',
  UNKNOWN = 'Unknown'
}