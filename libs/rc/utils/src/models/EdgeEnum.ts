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