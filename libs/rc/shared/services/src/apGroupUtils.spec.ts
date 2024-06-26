import _ from 'lodash'

import {
  APGeneralFixtures,
  APGroupFixtures,
  ApGroupViewModel,
  NewAPModel,
  NewApGroupViewModelResponseType,
  TableResult,
  Venue,
  WifiNetwork
} from '@acx-ui/rc/utils'

import {
  aggregateApGroupApInfo,
  aggregateApGroupNetworkInfo,
  aggregateApGroupVenueInfo,
  getNewApGroupViewmodelPayloadFromOld
} from './apGroupUtils'

const { mockRbacAPGroupList } = APGroupFixtures
const { mockVenueList } = APGeneralFixtures

describe('AP group utils', () => {
  describe('getNewApGroupViewmodelPayloadFromOld', () => {
    it('transform correctly', async () => {
      const payload = {
        fields: ['id', 'name', 'venueId', 'venueName', 'members', 'networks', 'clients'],
        searchTargetFields: ['name'],
        sortField: 'venueName',
        sortOrder: 'ASC',
        filters: { isDefault: [false] }
      }

      const newPayload = getNewApGroupViewmodelPayloadFromOld(payload)
      // eslint-disable-next-line max-len
      expect(newPayload.fields).toStrictEqual(['id', 'name', 'venueId', 'venueName', 'apSerialNumbers', 'wifiNetworkIds', 'clientCount'])
      expect(newPayload.sortField).toBe('venueName')
      expect(newPayload.sortOrder).toBe('ASC')
      expect(newPayload.searchTargetFields).toStrictEqual(['name'])
      expect(newPayload.filters).toStrictEqual({ isDefault: [false] })
    })

    it('when using new field name', async () => {
      const payload = {
        // eslint-disable-next-line max-len
        fields: ['id', 'name', 'venueId', 'venueName', 'apSerialNumbers', 'networks', 'clients', 'aps'],
        searchTargetFields: ['name'],
        sortField: 'name',
        sortOrder: 'ASC',
        filters: { isDefault: [false] }
      }

      const newPayload = getNewApGroupViewmodelPayloadFromOld(payload)
      // eslint-disable-next-line max-len
      expect(newPayload.fields).toStrictEqual(['id', 'name', 'venueId', 'venueName', 'apSerialNumbers', 'wifiNetworkIds', 'clientCount'])
      expect(newPayload.sortField).toBe('name')
      expect(newPayload.sortOrder).toBe('ASC')
      expect(newPayload.searchTargetFields).toStrictEqual(['name'])
      expect(newPayload.filters).toStrictEqual({ isDefault: [false] })
    })

    it('when only a few fields', async () => {
      const payload = {
        fields: ['id', 'name']
      }

      const newPayload = getNewApGroupViewmodelPayloadFromOld(payload)
      expect(newPayload.fields).toStrictEqual(['id', 'name'])
      expect(newPayload.sortField).toBe(undefined)
      expect(newPayload.sortOrder).toBe(undefined)
      expect(newPayload.searchTargetFields).toBe(undefined)
      expect(newPayload.filters).toBe(undefined)
    })
  })

  describe('aggregateApGroupVenueInfo', () => {
    it('data well format', async () => {
      const apGroupList = mockRbacAPGroupList as TableResult<ApGroupViewModel>
      aggregateApGroupVenueInfo(apGroupList, mockVenueList as TableResult<Venue>)
      expect(apGroupList.data[0].venueName).toBe('My-Venue')
      expect(apGroupList.data[1].venueName).toBe('test')
    })

    it('when venueId is missing from data', async () => {
      const apGroupList = {
        ...mockRbacAPGroupList,
        data: mockRbacAPGroupList.data.map(item => _.omit(item, 'venueId'))
      } as unknown as TableResult<ApGroupViewModel>

      aggregateApGroupVenueInfo(apGroupList, mockVenueList as TableResult<Venue>)
      expect(apGroupList.data[0].venueName).toBe(undefined)
      expect(apGroupList.data[1].venueName).toBe(undefined)
    })
  })

  describe('aggregateApGroupNetworkInfo', () => {
    const mockNetworkList = {
      totalCount: 2,
      page: 1,
      data: [{
        id: 'mock_network_1',
        name: 'Network-1'
      }, {
        id: 'mock_network_2',
        name: 'Network-2'
      }]
    } as unknown as TableResult<WifiNetwork>

    it('data well format', async () => {
      // eslint-disable-next-line max-len
      const rbacApGroupList = _.cloneDeep(mockRbacAPGroupList) as TableResult<NewApGroupViewModelResponseType>
      const apGroupList = {
        ...rbacApGroupList,
        data: rbacApGroupList.data.map(item => _.omit(item, 'wifiNetworkIds'))
      } as TableResult<ApGroupViewModel>

      aggregateApGroupNetworkInfo(apGroupList, rbacApGroupList, mockNetworkList)
      expect(apGroupList.data[0].networks).toStrictEqual({
        count: 2,
        names: ['Network-1', 'Network-2']
      })
      expect(apGroupList.data[1].networks).toStrictEqual({
        count: 0,
        names: []
      })
    })

    it('when wifiNetworkIds is missing from data', async () => {
      const rbacApGroupList = {
        ...mockRbacAPGroupList,
        data: mockRbacAPGroupList.data.map(item => _.omit(item, 'wifiNetworkIds'))
      } as unknown as TableResult<NewApGroupViewModelResponseType>
      const apGroupList = {
        ...rbacApGroupList
      } as TableResult<ApGroupViewModel>

      aggregateApGroupNetworkInfo(apGroupList, rbacApGroupList, mockNetworkList)
      expect(apGroupList.data[0].networks).toStrictEqual({ count: 0, names: [] })
      expect(apGroupList.data[1].networks).toStrictEqual({ count: 0, names: [] })
    })
  })

  describe('aggregateApGroupApInfo', () => {
    const mockAPList = {
      totalCount: 2,
      page: 1,
      data: [{
        serialNumber: 'mock_ap_1',
        name: 'AP-1'
      }, {
        serialNumber: 'mock_ap_2',
        name: 'AP-2'
      }, {
        serialNumber: 'mock_ap_3',
        name: 'AP-3'
      }]
    } as unknown as TableResult<NewAPModel>

    it('data well format', async () => {
      // eslint-disable-next-line max-len
      const rbacApGroupList = _.cloneDeep(mockRbacAPGroupList) as TableResult<NewApGroupViewModelResponseType>
      const apGroupList = {
        ...rbacApGroupList,
        data: rbacApGroupList.data.map(item => _.omit(item, 'apSerialNumbers'))
      } as TableResult<ApGroupViewModel>

      aggregateApGroupApInfo(apGroupList, rbacApGroupList, mockAPList)
      expect(apGroupList.data[0].members).toStrictEqual({
        count: 1,
        names: ['AP-1']
      })
      expect(apGroupList.data[1].members).toStrictEqual({
        count: 2,
        names: ['AP-2', 'AP-3']
      })
    })

    it('when some fields are missing from data', async () => {
      const rbacApGroupList = {
        ...mockRbacAPGroupList,
        data: mockRbacAPGroupList.data.map(item => _.omit(item, 'apSerialNumbers'))
      } as unknown as TableResult<NewApGroupViewModelResponseType>
      const apGroupList = {
        ...rbacApGroupList
      } as TableResult<ApGroupViewModel>

      aggregateApGroupApInfo(apGroupList, rbacApGroupList, mockAPList)
      expect(apGroupList.data[0].members).toStrictEqual({ count: 0, names: [] })
      expect(apGroupList.data[1].members).toStrictEqual({ count: 0, names: [] })
    })
  })
})