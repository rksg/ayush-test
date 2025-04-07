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
  PIN = 'PIN',
  SD_LAN = 'SDLAN',
  SD_LAN_P2 = 'SDLAN_P2',
  MV_SD_LAN = 'MV_SDLAN',
  MDNS_PROXY = 'MDNS_PROXY',
  TUNNEL_PROFILE = 'TUNNEL_PROFILE'
}

export enum EdgeClusterProfileTypeEnum {
  TUNNEL_PROFILE = 'TUNNEL_PROFILE'
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

export enum ClusterNodeStatusEnum {
  CLUSTER_NODE_CONFIGS_NEEDED = 'CLUSTER_NODE_CONFIGS_NEEDED',
  CLUSTER_NODE_GETTING_READY = 'CLUSTER_NODE_GETTING_READY',
  CLUSTER_NODE_READY = 'CLUSTER_NODE_READY',
  CLUSTER_NODE_UNHEALTHY = 'CLUSTER_NODE_UNHEALTHY'
}

export enum ClusterStatusEnum {
  CLUSTER_CONFIGS_NEEDED = 'CLUSTER_CONFIGS_NEEDED',
  CLUSTER_IS_FORMING = 'CLUSTER_IS_FORMING',
  CLUSTER_READY = 'CLUSTER_READY',
  CLUSTER_UNHEALTHY = 'CLUSTER_UNHEALTHY'
}

export enum NodeClusterRoleEnum {
  CLUSTER_ROLE_ACTIVE = 'CLUSTER_ROLE_ACTIVE',
  CLUSTER_ROLE_BACKUP = 'CLUSTER_ROLE_BACKUP'
}

export enum ClusterHighAvailabilityModeEnum {
  ACTIVE_ACTIVE = 'ACTIVE_ACTIVE',
  ACTIVE_STANDBY = 'ACTIVE_STANDBY'
}

export enum ClusterHaFallbackScheduleTypeEnum {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  INTERVAL = 'INTERVAL'
}

export enum ClusterHaLoadDistributionEnum {
  RANDOM = 'RANDOM',
  AP_GROUP = 'AP_GROUP'
}

export enum CompatibilityEntityTypeEnum {
  VENUE = 'venue',
  CLUSTER = 'cluster',
  DEVICE = 'device'
}

// ========== Multi WAN ===========
export enum EdgeMultiWanModeEnum {
  NONE = 'NONE',
  ACTIVE_BACKUP = 'ACTIVE_BACKUP'
}

export enum EdgeMultiWanProtocolEnum {
  NONE = 'NONE',
  PING = 'PING'
}

export enum EdgeLinkDownCriteriaEnum {
  INVALID = 'INVALID',
  ALL_TARGETS_DOWN = 'ALL_TARGETS_DOWN',
  ANY_TARGET_DOWN = 'ANY_TARGET_DOWN'
}
// ========== Multi WAN ===========
