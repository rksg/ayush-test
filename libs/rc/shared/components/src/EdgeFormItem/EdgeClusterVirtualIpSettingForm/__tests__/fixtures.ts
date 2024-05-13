
import {
  EdgeGeneralFixtures
} from '@acx-ui/rc/utils'

const { mockedHaNetworkSettings } = EdgeGeneralFixtures

export const mockVipConfig = mockedHaNetworkSettings.virtualIpSettings.map(item => {
  return {
    interfaces: item.ports,
    vip: item.virtualIp
  }
})
