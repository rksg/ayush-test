import { WifiNetworkFixtures } from '@acx-ui/rc/utils'

import { filterNetworksByVenueApGroupFilters } from './networkVenueUtils'

const { mockedNetworkList } = WifiNetworkFixtures

describe('WifiNetwork Venue utils', () => {
  describe('filterNetworksByVenueApGroupFilters', () => {
    it('filter by apGroupIds correctly', async () => {
      const filters = { 'venueApGroups.apGroupIds': ['0118133c4727456ea10e05cd0217c110'] }

      const filteredList = filterNetworksByVenueApGroupFilters(mockedNetworkList, filters)
      expect(filteredList.length).toBe(3)
      expect(filteredList[0].id).toBe('4699c3895fb54aadba3f85d1fac61513')
      expect(filteredList[1].id).toBe('22783306a02d41e2ba481e9c496e1500')
      expect(filteredList[2].id).toBe('e3d1588049774c79ac13b87afd9b4b24')
    })

    it('filter by apGroupIds and isAllApGroups correctly', async () => {
      const filters = {
        'venueApGroups.apGroupIds': ['0118133c4727456ea10e05cd0217c110'],
        'venueApGroups.isAllApGroups': [false]
      }

      const filteredList = filterNetworksByVenueApGroupFilters(mockedNetworkList, filters)
      expect(filteredList.length).toBe(1)
      expect(filteredList[0].id).toBe('e3d1588049774c79ac13b87afd9b4b24')
    })

    it('filters is undefined', async () => {
      const filteredList = filterNetworksByVenueApGroupFilters(mockedNetworkList, undefined)
      expect(filteredList.length).toBe(5)
    })

    it('filters is empty', async () => {
      const filteredList = filterNetworksByVenueApGroupFilters(mockedNetworkList, {})
      expect(filteredList.length).toBe(5)
    })
  })
})