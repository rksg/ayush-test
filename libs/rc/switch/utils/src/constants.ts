import { defineMessage } from 'react-intl'

import { SwitchModelInfoMap } from './types'

export const SWITCH_DEFAULT_VLAN_NAME = 'DEFAULT-VLAN'

export enum DeviceConnectionStatus {
  INITIAL = 'initial',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ALERTING = 'alerting'
}

export enum ProfileTypeEnum {
  REGULAR = 'Regular',
  CLI = 'CLI'
}

export enum AclTypeEnum {
  STANDARD = 'standard',
  EXTENDED = 'extended',
  IPv6 = 'IPv6'
}

export enum AclRuleActionEnum {
  PERMIT = 'permit',
  DENY = 'deny'
}

export enum TrustedPortTypeEnum {
  ALL = 'all',
  DHCP = 'dhcp',
  ARP = 'arp'
}

export const SWITCH_DISCONNECTED = defineMessage({
  defaultMessage: 'Switch disconnected'
})

export const BACKUP_DISABLE_TOOLTIP = defineMessage({
  // eslint-disable-next-line max-len
  defaultMessage: 'The switch status must be "Operational" before you can create the backup configuration file.'
})

export const BACKUP_IN_PROGRESS_TOOLTIP = defineMessage({
  defaultMessage: 'Backup creation is in progress'
})

export const RESTORE_IN_PROGRESS_TOOLTIP = defineMessage({
  defaultMessage: 'Backup restore is in progress'
})

export enum ConfigurationBackupStatus {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export enum PortTaggedEnum {
  EMPTY = '',
  TAGGED = 'TAGGED',
  UNTAGGED = 'UNTAGGED',
  LAG = 'LAG'
}

export enum UnitStatus {
  OK = 'OK',
  FAILED = 'FAILED',
  NOT_PRESENT = 'NOT_PRESENT', // Legacy value - need confirm
  OTHER = 'OTHER', // Somehow SZ may send 'Other' status
}

// Deprecated: no port prefix for all models
export enum PortLabelType {
  GENERAL = '', // 1, 2. For high end models, fiber port doesn't have port label too
  COPPER = 'C', // C1, C2
  FIBER = 'X', // X1, X2 for 10G fiber port
  FIBER_1G = 'F' // F1, F2 for 1G fiber port
}

export const ICX_MODELS_INFORMATION: SwitchModelInfoMap = {
  ICX7150: {
    'C12P': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    'C08P': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    'C08PT': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    'C10ZP': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24P': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24F': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48P': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48PF': {
      powerSlots: 1, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48ZP': {
      powerSlots: 2, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    }
  },
  ICX7550: {
    '24': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24P': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48P': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24ZP': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48ZP': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24F': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48F': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24XZP': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    }
  },
  ICX7650: {
    '48P': {
      powerSlots: 2, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48ZP': {
      powerSlots: 2, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48F': {
      powerSlots: 2, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    }
  },
  ICX7850: {
    '32Q': {
      powerSlots: 2, fanSlots: 6, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48FS': {
      powerSlots: 2, fanSlots: 5, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48F': {
      powerSlots: 2, fanSlots: 5, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48C': {
      powerSlots: 2, fanSlots: 5, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    }
  },
  ICX8200: {
    '24': {
      powerSlots: 1, fanSlots: 1, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24P': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48': {
      powerSlots: 2, fanSlots: 5, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48P': {
      powerSlots: 2, fanSlots: 5, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48PF': {
      powerSlots: 1, fanSlots: 1, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48PF2': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    // 'C08P': {
    //   powerSlots: 1, fanSlots: 0, portModuleSlots: [
    //     { portLabel: PortLabelType.GENERAL },
    //     { portLabel: PortLabelType.GENERAL }
    //   ]
    // },
    'C08PF': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24ZP': {
      powerSlots: 1, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48ZP2': {
      powerSlots: 2, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24FX': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24F': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48F': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    'C08ZP': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    // 'C08PT': {
    //   powerSlots: 1, fanSlots: 0, portModuleSlots: [
    //     { portLabel: PortLabelType.GENERAL },
    //     { portLabel: PortLabelType.GENERAL }
    //   ]
    // },
    // 'C08PDC': {
    //   powerSlots: 1, fanSlots: 0, portModuleSlots: [
    //     { portLabel: PortLabelType.GENERAL },
    //     { portLabel: PortLabelType.GENERAL }
    //   ]
    // }
    '24PV': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    'C08PFV': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    }
  },
  ICX8100: {
    '24': {
      powerSlots: 1, fanSlots: 1, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24P': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48': {
      powerSlots: 1, fanSlots: 1, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48P': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    'C08PF': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24-X': {
      powerSlots: 1, fanSlots: 1, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24P-X': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48-X': {
      powerSlots: 1, fanSlots: 1, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48P-X': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    'C08PF-X': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    }
  }
}

export const VLAN_PREFIX = {
  VLAN: 'VLAN-',
  POOL: 'VLAN Pool: '
}

export enum PowerSavingStatusEnum {
  NORMAL = 'NORMAL',
  POWER_SAVING = 'POWER_SAVING',
  POWER_SAVING_PLUS = 'POWER_SAVING_PLUS'
}