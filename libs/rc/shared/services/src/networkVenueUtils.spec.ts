import { BaseQueryApi } from '@reduxjs/toolkit/query'

import { ConfigTemplateUrlsInfo, WifiNetworkFixtures } from '@acx-ui/rc/utils'
import { createHttpRequest }                           from '@acx-ui/utils'

import { filterNetworksByVenueApGroupFilters } from './networkVenueUtils'
import { addNetworkVenueFn }                   from './servicePolicy.utils/network'

const { mockedRbacWifiNetworkList } = WifiNetworkFixtures

jest.mock('@acx-ui/utils')

describe('WifiNetwork Venue utils', () => {
  describe('filterNetworksByVenueApGroupFilters', () => {
    it('filter by apGroupIds correctly', async () => {
      const filters = { 'venueApGroups.apGroupIds': ['0118133c4727456ea10e05cd0217c110'] }

      const filteredList = filterNetworksByVenueApGroupFilters(mockedRbacWifiNetworkList, filters)
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

      const filteredList = filterNetworksByVenueApGroupFilters(mockedRbacWifiNetworkList, filters)
      expect(filteredList.length).toBe(1)
      expect(filteredList[0].id).toBe('e3d1588049774c79ac13b87afd9b4b24')
    })

    it('filters is undefined', async () => {
      const filteredList = filterNetworksByVenueApGroupFilters(mockedRbacWifiNetworkList, undefined)
      expect(filteredList.length).toBe(5)
    })

    it('filters is empty', async () => {
      const filteredList = filterNetworksByVenueApGroupFilters(mockedRbacWifiNetworkList, {})
      expect(filteredList.length).toBe(5)
    })
  })

  describe('networkVenueFn', () => {
    const fetchWithBQ = jest.fn()

    afterEach(() => {
      jest.clearAllMocks()
    })

    const mockNetworkVenuePayload = {
      apGroups: [],
      scheduler: {
        type: 'ALWAYS_ON'
      },
      isAllApGroups: true,
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: [
        '2.4-GHz',
        '5-GHz'
      ],
      venueId: 'venueId',
      networkId: 'networkId'
    }

    xit('should successfully add a networkVenue with RBAC and template', async () => {
      const args = {
        // eslint-disable-next-line max-len
        params: { tenantId: 'tenantId', venueId: mockNetworkVenuePayload.venueId, networkId: mockNetworkVenuePayload.networkId },
        payload: mockNetworkVenuePayload,
        enableRbac: true
      }
      const mockResponse = { data: { response: { }, requestId: 'req' } }
      fetchWithBQ.mockResolvedValue(mockResponse)
      await addNetworkVenueFn()(args, {} as BaseQueryApi, {}, fetchWithBQ)

      // eslint-disable-next-line max-len
      expect(createHttpRequest).toHaveBeenCalledWith(
        ConfigTemplateUrlsInfo.addNetworkVenueTemplateRbac,
        args.params
      )
      expect(fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
        body: JSON.stringify(args.payload)
      }))
    })
  })

})
