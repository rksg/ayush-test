import { isEqual, pick } from 'lodash'

import { WifiApSetting } from './types/ap'
import { VenueLanPorts } from './types/venue'

export const isEqualLanPort = (
  currentLan: VenueLanPorts | WifiApSetting, otherLan: VenueLanPorts | WifiApSetting) => {
  if (!currentLan || ! currentLan.lanPorts || !otherLan || !otherLan.lanPorts ) {
    return false
  }

  const poeProperties = ['poeMode', 'poeOut', 'poeOutMode']
  if (poeProperties.some(prop => prop in currentLan) &&
    !isEqual(pick(currentLan, poeProperties), pick(otherLan, poeProperties))) {
    return false
  }

  const lanPortProperties = ['enabled', 'portId', 'type', 'untagId', 'vlanMembers']
  for (let i = 0; i < currentLan.lanPorts.length; i++) {
    if (!isEqual(pick(currentLan.lanPorts[i], lanPortProperties),
      pick(otherLan.lanPorts[i], lanPortProperties))) {
      return false
    }
  }

  return true
}
