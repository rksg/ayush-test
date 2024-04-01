import _ from 'lodash'

import {
  ClusterNetworkSettings,
  EdgeGeneralFixtures,
  EdgeIpModeEnum,
  EdgePort,
  EdgePortInfo,
  EdgePortTypeEnum
} from '@acx-ui/rc/utils'

const { mockedHaNetworkSettings } = EdgeGeneralFixtures

const getTargetInterface = (
  serialNumber: string, portName: string,
  lagSettings: ClusterNetworkSettings['lagSettings'],
  portSettings: ClusterNetworkSettings['portSettings']
) => {
  if(portName.startsWith('l')) {
    return lagSettings.find(item => item.serialNumber === serialNumber)
      ?.lags.find(item => item.id.toString() === portName.charAt(3))
  } else {
    return portSettings.find(item => item.serialNumber === serialNumber)
      ?.ports.find(item => item.interfaceName === portName)
  }
}

export const mockVipConfig = mockedHaNetworkSettings.virtualIpSettings.map(item => {
  return {
    interfaces: _.reduce(item.ports, (result, port) => {
      const targetInterfaceInfo = getTargetInterface(
        port.serialNumber,
        port.portName,
        mockedHaNetworkSettings.lagSettings,
        mockedHaNetworkSettings.portSettings
      )
      result[port.serialNumber] = {
        serialNumber: port.serialNumber,
        id: targetInterfaceInfo?.id.toString() ?? '',
        portName: port.portName,
        ipMode: targetInterfaceInfo?.ipMode ?? EdgeIpModeEnum.DHCP,
        ip: targetInterfaceInfo?.ip ?? '',
        mac: (targetInterfaceInfo as EdgePort).mac ?? '',
        subnet: targetInterfaceInfo?.subnet ?? '',
        portType: targetInterfaceInfo?.portType ?? EdgePortTypeEnum.UNCONFIGURED,
        isCorePort: false,
        isLag: false,
        isLagMember: false,
        portEnabled: true
      }
      return result
    }, {} as {
      [key: string]: EdgePortInfo
    }),
    vip: item.virtualIp
  }
})
