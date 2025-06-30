import { isEqual, isMatch, pick } from 'lodash'

import { WifiApSetting } from './types/ap'
import { VenueLanPorts } from './types/venue'

export const isEqualLanPort = (
  currentLan: VenueLanPorts | WifiApSetting, otherLan: VenueLanPorts | WifiApSetting) => {
  if (!currentLan || ! currentLan.lanPorts || !otherLan || !otherLan.lanPorts ) {
    return false
  }

  const poeProperties = ['poeMode', 'poeOut', 'poeOutMode']
  if (poeProperties.some(prop => prop in otherLan) &&
    !isMatch(pick(currentLan, poeProperties), pick(otherLan, poeProperties))) {
    return false
  }

  const lanPortProperties =
    ['enabled', 'portId', 'ethernetPortProfileId', 'untagId', 'vlanMembers']
  for (let i = 0; i < currentLan.lanPorts.length; i++) {
    let current = pick(currentLan.lanPorts[i], lanPortProperties)
    let other = pick(otherLan.lanPorts[i], lanPortProperties)
    if (!isEqual(current, other)) {
      return false
    }
  }

  return true
}
