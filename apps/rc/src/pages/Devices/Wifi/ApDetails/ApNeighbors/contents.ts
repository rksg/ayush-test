import { MessageDescriptor, defineMessage } from 'react-intl'

import { ApLldpNeighbor } from '@acx-ui/rc/utils'

export type LldpNeighborsDisplayFields = Omit<ApLldpNeighbor, 'neighborManaged' | 'lldpUPOE'>

// eslint-disable-next-line max-len
export const lldpNeighborsFieldLabelMapping: Record<keyof LldpNeighborsDisplayFields, MessageDescriptor> = {
  lldpInterface: defineMessage({ defaultMessage: 'Interface' }),
  lldpTime: defineMessage({ defaultMessage: 'Time' }),
  lldpSysName: defineMessage({ defaultMessage: 'System Name' }),
  lldpSysDesc: defineMessage({ defaultMessage: 'System Description' }),
  lldpChassisID: defineMessage({ defaultMessage: 'Chassis ID' }),
  lldpMgmtIP: defineMessage({ defaultMessage: 'Mgmt IP' }),
  lldpPortID: defineMessage({ defaultMessage: 'Port ID' }),
  lldpClass: defineMessage({ defaultMessage: 'Power Class' }),
  lldpVia: defineMessage({ defaultMessage: 'via' }),
  lldpRID: defineMessage({ defaultMessage: 'RID' }),
  lldpCapability: defineMessage({ defaultMessage: 'Capability' }),
  lldpPortDesc: defineMessage({ defaultMessage: 'Port Description' }),
  lldpMFS: defineMessage({ defaultMessage: 'MFS' }),
  lldpPMDAutoNeg: defineMessage({ defaultMessage: 'PMD AutoNeg' }),
  lldpAdv: defineMessage({ defaultMessage: 'Adv' }),
  lldpMAUOperType: defineMessage({ defaultMessage: 'MAU Oper Type' }),
  lldpMDIPower: defineMessage({ defaultMessage: 'MDI Power' }),
  lldpDeviceType: defineMessage({ defaultMessage: 'Device Type' }),
  lldpPowerPairs: defineMessage({ defaultMessage: 'Power Pairs' }),
  lldpPowerType: defineMessage({ defaultMessage: 'Power Type' }),
  lldpPowerSource: defineMessage({ defaultMessage: 'Power Source' }),
  lldpPowerPriority: defineMessage({ defaultMessage: 'Power Priority' }),
  lldpPDReqPowerVal: defineMessage({ defaultMessage: 'Requested Power Value' }),
  lldpPSEAllocPowerVal: defineMessage({ defaultMessage: 'PSE Allocated Power Value' })
}
