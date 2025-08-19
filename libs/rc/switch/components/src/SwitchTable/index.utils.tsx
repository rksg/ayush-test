import { cssStr }         from '@acx-ui/components'
import {
  SwitchStatusEnum,
  transformSwitchStatus
} from '@acx-ui/rc/utils'

export const seriesSwitchStatusMapping = () => [
  { key: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
    name: transformSwitchStatus(SwitchStatusEnum.NEVER_CONTACTED_CLOUD).message,
    color: cssStr('--acx-neutrals-50')
  },
  { key: SwitchStatusEnum.INITIALIZING,
    name: transformSwitchStatus(SwitchStatusEnum.INITIALIZING).message,
    color: cssStr('--acx-neutrals-50')
  },
  { key: SwitchStatusEnum.FIRMWARE_UPD_START,
    name: transformSwitchStatus(SwitchStatusEnum.FIRMWARE_UPD_START).message,
    color: cssStr('--acx-semantics-yellow-40')
  },
  { key: SwitchStatusEnum.OPERATIONAL,
    name: transformSwitchStatus(SwitchStatusEnum.OPERATIONAL, true, true).message,
    color: cssStr('--acx-semantics-green-50')
  },
  { key: SwitchStatusEnum.DISCONNECTED,
    name: transformSwitchStatus(SwitchStatusEnum.DISCONNECTED).message,
    color: cssStr('--acx-semantics-red-50')
  },
  { key: SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED,
    name: transformSwitchStatus(SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED).message,
    color: cssStr('--acx-neutrals-50')
  }
] as Array<{ key: string, name: string, color: string }>