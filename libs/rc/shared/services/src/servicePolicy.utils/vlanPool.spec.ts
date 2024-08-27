import {
  TableResult, VlanPoolRbacUrls,
  VlanPoolUrls, VLANPoolViewModelRbacType, VLANPoolViewModelType
} from '@acx-ui/rc/utils'

import { mockQueryApi }                                   from './__tests__/fixtures'
import {
  createVLANPoolVenuesHttpRequest, createVLANPoolListHttpRequest,
  getVLANPoolPolicyViewModelListFn, getVLANPoolVenuesFn
} from './vlanPool'

const mockedCreateHttpRequest = jest.fn()
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createHttpRequest: (...args: any) => mockedCreateHttpRequest.apply(null, args)
}))

describe('vlanPool.utils', () => {
  const mockedPayload = { sortField: 'name', sortOrder: 'ASC' }

  afterEach(() => {
    jest.clearAllMocks()
  })
  describe('getVLANPoolVenuesFn', () => {
    it('isTemplate is false and enableRbac is false', async () => {
      const fetchWithBQFn = jest.fn()
      const queryFn = getVLANPoolVenuesFn()

      fetchWithBQFn.mockResolvedValueOnce({ error: 'error' })
      const errorResult = await queryFn({
        params: {},
        payload: mockedPayload,
        enableRbac: false
      }, mockQueryApi, {}, fetchWithBQFn)

      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(VlanPoolUrls.getVLANPoolVenues, {})
      expect(errorResult).toEqual({ error: 'error' })

      fetchWithBQFn.mockResolvedValueOnce({ data: 'success' })
      const successResult = await queryFn({
        params: {},
        payload: mockedPayload,
        enableRbac: false
      }, mockQueryApi, {}, fetchWithBQFn)

      expect(successResult).toEqual({ data: 'success' })
    })
    it('isTemplate is false and enableRbac is true', async () => {
      const fetchWithBQFn = jest.fn()
      const queryFn = getVLANPoolVenuesFn()

      const mockedData: TableResult<VLANPoolViewModelRbacType> = {
        data: [{
          id: '12345',
          name: 'VLAN-1',
          vlanMembers: [],
          wifiNetworkVenueApGroups: []
        }],
        page: 1,
        totalCount: 1
      }
      fetchWithBQFn.mockResolvedValueOnce({ data: mockedData })
      const successResult = await queryFn({
        params: {},
        payload: mockedPayload,
        enableRbac: true
      }, mockQueryApi, {}, fetchWithBQFn)

      // eslint-disable-next-line max-len
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(VlanPoolRbacUrls.getVLANPoolPolicyList, {})
      expect(successResult).toEqual({ data: {} })
    })
  })

  describe('getVLANPoolPolicyViewModelListFn', () => {
    it('isTemplate is false and enableRbac is false', async () => {
      const fetchWithBQFn = jest.fn()
      const queryFn = getVLANPoolPolicyViewModelListFn()

      const mockedData: TableResult<VLANPoolViewModelType> = {
        data: [{
          id: '12345',
          name: 'VLAN-1',
          vlanMembers: [],
          venueIds: [],
          venueApGroups: []
        }],
        page: 1,
        totalCount: 1
      }
      fetchWithBQFn.mockResolvedValueOnce({ data: mockedData })
      const successResult = await queryFn({
        params: {},
        payload: mockedPayload,
        enableRbac: false
      }, mockQueryApi, {}, fetchWithBQFn)

      expect(successResult).toEqual({ data: mockedData })
    })

    it('isTemplate is false and enableRbac is true', async () => {
      const fetchWithBQFn = jest.fn()
      const queryFn = getVLANPoolPolicyViewModelListFn()

      const mockedData: TableResult<VLANPoolViewModelRbacType> = {
        data: [{
          id: '12345',
          name: 'VLAN-1',
          vlanMembers: [],
          wifiNetworkVenueApGroups: []
        }],
        page: 1,
        totalCount: 1
      }
      fetchWithBQFn.mockResolvedValueOnce({ data: mockedData })
      const successResult = await queryFn({
        params: {},
        payload: mockedPayload,
        enableRbac: true
      }, mockQueryApi, {}, fetchWithBQFn)

      expect(successResult).toEqual({ data: {
        totalCount: 1,
        page: 1,
        data: [{
          id: mockedData.data[0].id,
          name: mockedData.data[0].name,
          vlanMembers: mockedData.data[0].vlanMembers,
          networkIds: mockedData.data[0].wifiNetworkIds,
          venueApGroups: [],
          venueIds: []
        }]
      } })
    })
  })

  it('createVLANPoolVenuesHttpRequest', () => {
    createVLANPoolVenuesHttpRequest({}, false, false)
    expect(mockedCreateHttpRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/vlanPools/:policyId/venues',
      oldUrl: '/api/vlanPools/:policyId/venues',
      newApi: true
    }, {})

    createVLANPoolVenuesHttpRequest({}, false, true)
    expect(mockedCreateHttpRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/templates/vlanPools/:policyId/venues',
      newApi: true
    }, {})

    createVLANPoolVenuesHttpRequest({}, true, false)
    expect(mockedCreateHttpRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/vlanPoolProfiles/query',
      newApi: true,
      defaultHeaders: {
        'Accept': 'application/vnd.ruckus.v1+json',
        'Content-Type': 'application/vnd.ruckus.v1+json'
      }
    }, {})

    createVLANPoolVenuesHttpRequest({}, true, true)
    expect(mockedCreateHttpRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/templates/vlanPoolProfiles/query',
      newApi: true,
      defaultHeaders: {
        'Accept': 'application/vnd.ruckus.v1+json',
        'Content-Type': 'application/vnd.ruckus.v1+json'
      }
    }, {})
  })

  it('createVLANPoolListHttpRequest', () => {
    createVLANPoolListHttpRequest({}, false, false)
    expect(mockedCreateHttpRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/enhancedVlanPoolProfiles/query',
      newApi: true
    }, {})

    createVLANPoolListHttpRequest({}, false, true)
    expect(mockedCreateHttpRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/templates/enhancedVlanPoolProfiles/query',
      newApi: true
    }, {})

    createVLANPoolListHttpRequest({}, true, false)
    expect(mockedCreateHttpRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/vlanPoolProfiles/query',
      newApi: true,
      defaultHeaders: {
        'Accept': 'application/vnd.ruckus.v1+json',
        'Content-Type': 'application/vnd.ruckus.v1+json'
      }
    }, {})

    createVLANPoolListHttpRequest({}, true, true)
    expect(mockedCreateHttpRequest).toHaveBeenCalledWith({
      method: 'post',
      url: '/templates/vlanPoolProfiles/query',
      newApi: true,
      defaultHeaders: {
        'Accept': 'application/vnd.ruckus.v1+json',
        'Content-Type': 'application/vnd.ruckus.v1+json'
      }
    }, {})
  })
})
