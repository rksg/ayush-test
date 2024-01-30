export enum EdgePortTypeEnum {
  UNCONFIGURED = 'UNCONFIGURED',
  WAN = 'WAN',
  LAN = 'LAN',
  CLUSTER = 'CLUSTER'
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
  OFFLINE = '1_09_Offline',
  NEEDS_CONFIG = '1_10_NeedsConfig',
  OPERATIONAL = '2_00_Operational',
  APPLYING_FIRMWARE = '2_01_ApplyingFirmware',
  APPLYING_CONFIGURATION = '2_02_ApplyingConfiguration',
  FIRMWARE_UPDATE_FAILED = '3_02_FirmwareUpdateFailed',
  CONFIGURATION_UPDATE_FAILED = '3_03_ConfigurationUpdateFailed',
  DISCONNECTED_FROM_CLOUD = '3_04_DisconnectedFromCloud',
  REBOOTING = '4_01_Rebooting',
  RESETTING = '4_02_Resetting',
  HEARTBEAT_LOST = '4_04_HeartbeatLost'
}

export enum EdgeStatusSeverityEnum {
  IN_SETUP_PHASE = '1_InSetupPhase',
  OFFLINE = '1_InSetupPhase_Offline',
  OPERATIONAL = '2_Operational',
  REQUIRES_ATTENTION = '3_RequiresAttention',
  TRANSIENT_ISSUE = '4_TransientIssue'
}

export enum EdgeServiceTypeEnum {
  DHCP = 'DHCP',
  FIREWALL = 'FIREWALL',
  NETWORK_SEGMENTATION = 'NETWORK_SEGMENTATION',
  SD_LAN = 'SDLAN'
}

export enum EdgeServiceStatusEnum {
  GOOD = 'GOOD',
  REQUIRES_ATTENTION = 'REQUIRES_ATTENTION',
  POOR = 'POOR',
  UNKNOWN = 'UNKNOWN'
}

export enum EdgeLagTypeEnum {
  STATIC = 'STATIC',
  LACP = 'LACP'
}

export enum EdgeLagLacpModeEnum {
  ACTIVE = 'ACTIVE',
  PASSIVE = 'PASSIVE'
}

export enum EdgeLagTimeoutEnum {
  SHORT = 'SHORT',
  LONG = 'LONG'
}
