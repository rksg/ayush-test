import _ from 'lodash'

import {
  ClusterNetworkSettings,
  EdgeClusterStatus,
  EdgeGeneralFixtures,
  EdgeIpModeEnum,
  EdgePort,
  EdgePortConfigFixtures,
  EdgePortTypeEnum,
  EdgeSdLanFixtures,
  EdgeSdLanViewDataP2
} from '@acx-ui/rc/utils'

import { VirtualIpConfigFormType }   from '../../EditEdgeCluster/VirtualIp'
import { InterfaceSettingsFormType } from '../InterfaceSettings/types'

const { mockedHaNetworkSettings, mockEdgeClusterList } = EdgeGeneralFixtures
const { mockedPortsStatus } = EdgePortConfigFixtures
const { mockedSdLanServiceP2Dmz } = EdgeSdLanFixtures

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

export const mockClusterConfigWizardData = {
  portSettings: _.reduce(mockedHaNetworkSettings.portSettings,
    (result, port) => {
      result[port.serialNumber] = _.groupBy(port.ports, 'interfaceName')
      return result
    }, {} as InterfaceSettingsFormType['portSettings']),
  lagSettings: mockedHaNetworkSettings.lagSettings,
  vipConfig: mockedHaNetworkSettings.virtualIpSettings.map(item => {
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
      }, {} as VirtualIpConfigFormType['interfaces']),
      vip: item.virtualIp
    }
  }),
  timeout: 3
}

export const defaultCxtData = {
  clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
  portsStatus: mockedPortsStatus,
  edgeSdLanData: mockedSdLanServiceP2Dmz as EdgeSdLanViewDataP2,
  isLoading: false,
  isFetching: false
}

export const getTargetInterfaceFromInterfaceSettingsFormData = (
  serialNumber: string, portName: string,
  lagSettings: InterfaceSettingsFormType['lagSettings'],
  portSettings: InterfaceSettingsFormType['portSettings']
) => {
  if(portName.startsWith('l')) {
    return lagSettings.find(item => item.serialNumber === serialNumber)
      ?.lags.find(item => item.id.toString() === portName.charAt(3))
  } else {
    return portSettings[serialNumber]?.[portName]?.[0]
  }
}