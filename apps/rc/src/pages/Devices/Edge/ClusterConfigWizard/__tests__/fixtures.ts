import _ from 'lodash'

import {
  EdgeClusterStatus,
  EdgeGeneralFixtures,
  EdgePortConfigFixtures,
  EdgeSdLanFixtures,
  EdgeSdLanViewDataP2
} from '@acx-ui/rc/utils'

import { InterfaceSettingsFormType } from '../InterfaceSettings/types'

const { mockedHaNetworkSettings, mockEdgeClusterList } = EdgeGeneralFixtures
const { mockedPortsStatus } = EdgePortConfigFixtures
const { mockedSdLanServiceP2Dmz } = EdgeSdLanFixtures

export const mockClusterConfigWizardData = {
  portSettings: _.reduce(mockedHaNetworkSettings.portSettings,
    (result, port) => {
      result[port.serialNumber] = _.groupBy(port.ports, 'interfaceName')
      return result
    }, {} as InterfaceSettingsFormType['portSettings']),
  lagSettings: mockedHaNetworkSettings.lagSettings,
  vipConfig: mockedHaNetworkSettings.virtualIpSettings.map(item => {
    return {
      interfaces: item.ports,
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
