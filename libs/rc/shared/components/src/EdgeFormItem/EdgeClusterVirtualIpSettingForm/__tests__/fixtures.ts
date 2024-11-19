import {
  EdgeGeneralFixtures,
  EdgePortConfigFixtures
} from '@acx-ui/rc/utils'

import { VipInterface } from '..'

const { mockedHaNetworkSettings } = EdgeGeneralFixtures
const { mockLanInterfaces } = EdgePortConfigFixtures

export const mockVipConfig = mockedHaNetworkSettings.virtualIpSettings.map(item => {
  return {
    interfaces: item.ports,
    vip: item.virtualIp
  }
})

export const mockVipInterfaces: { [serialNumber: string]: VipInterface[] } =
Object.entries(mockLanInterfaces).reduce(
  (acc, [serialNumber, interfaces]) => {
    acc[serialNumber] = interfaces.map(item => ({
      ...item,
      interfaceName: item.portName
    }))
    return acc
  },
  {} as Record<string, VipInterface[]>
)
