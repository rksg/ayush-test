import { FormInstance } from 'antd'

import { EdgePortTypeEnum, isSubnetOverlap } from '@acx-ui/rc/utils'

import { EdgePortConfigFormType } from '.'

export const INNER_PORT_FORM_ID_PREFIX = 'port_'
export const getInnerPortFormID = (index: number | string) => `${INNER_PORT_FORM_ID_PREFIX}${index}`

export async function lanPortsubnetValidator (
  currentSubnet: { ip: string, subnetMask: string },
  allSubnetWithoutCurrent: { ip: string, subnetMask: string } []
) {
  if(!!!currentSubnet.ip || !!!currentSubnet.subnetMask) {
    return
  }

  for(let item of allSubnetWithoutCurrent) {
    try {
      await isSubnetOverlap(currentSubnet.ip, currentSubnet.subnetMask,
        item.ip, item.subnetMask)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  return Promise.resolve()
}

export const getEnabledCorePortMac = (form: FormInstance) => {
  const portsData = form.getFieldsValue(true) as EdgePortConfigFormType

  let corePort
  let portConfig
  for(let portId in portsData) {
    portConfig = portsData[portId][0]
    if (portConfig.corePortEnabled && portConfig.enabled)
      corePort = portConfig.mac
  }
  return corePort
}

export const isWANPortExist = (allValues: EdgePortConfigFormType): boolean => {
  return Object.values(allValues)
    .filter(port =>
      port[0].enabled && port[0].portType === EdgePortTypeEnum.WAN
    ).length > 0
}