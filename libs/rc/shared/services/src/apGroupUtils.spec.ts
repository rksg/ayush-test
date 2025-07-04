import { BaseQueryApi } from '@reduxjs/toolkit/query'
import _                from 'lodash'

import {
  APGeneralFixtures,
  APGroupFixtures,
  ApGroupViewModel,
  NewAPModel,
  NewApGroupViewModelResponseType,
  Venue,
  WifiNetwork,
  ApGroupConfigTemplateUrlsInfo
} from '@acx-ui/rc/utils'
import { TableResult, createHttpRequest } from '@acx-ui/utils'

import {
  addApGroupFn,
  aggregateApGroupApInfo,
  aggregateApGroupNetworkInfo,
  aggregateApGroupVenueInfo,
  deleteApGroupsTemplateFn,
  getApGroupFn,
  getApGroupsListFn,
  updateApGroupFn,
  getNewApGroupViewmodelPayloadFromOld
} from './apGroupUtils'

const { mockRbacAPGroupList } = APGroupFixtures
const { mockVenueList } = APGeneralFixtures

jest.mock('@acx-ui/utils')
const fetchWithBQ = jest.fn()

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

describe('AP group utils Fn', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('getApGroupsListFn with rbac', async () => {
    const mockPayload = {
      fields: ['id', 'name', 'venueName', 'venueId', 'members', 'networks'],
      searchTargetFields: ['id'],
      searchString: 'apGroupId'
    }

    const mockTransformRbacPayload = {
      fields: ['id', 'name', 'venueName', 'venueId', 'apSerialNumbers', 'wifiNetworkIds'],
      searchTargetFields: ['id'],
      searchString: 'apGroupId'
    }

    const args = {
      // eslint-disable-next-line max-len
      params: { tenantId: 'tenantId' },
      payload: mockPayload,
      page: 1,
      pageSize: 10,
      enableRbac: true
    }
    const mockResponse = { data: { data: [
      {
        id: '22e749bea9354cb48aee9db181c96856',
        name: 'apgroup-temp-1-modify',
        venueId: '3046e23a9ef8458b945a38ee39c4b2e7',
        wifiNetworkIds: [
          'ae6e97d0067244dfb659d1c060a929b9'
        ]
      }
    ], requestId: 'req' } }

    const mockNetworkResponse = { data: { data: [], requestId: 'req' } }

    fetchWithBQ.mockImplementation((arg) => {
      // eslint-disable-next-line max-len
      if (JSON.stringify(arg?.body).indexOf('apGroupId')) {
        return Promise.resolve(mockResponse)
      }
      // eslint-disable-next-line max-len
      if (JSON.stringify(arg?.body).indexOf(mockResponse.data.data[0].wifiNetworkIds[0])) {
        return Promise.resolve(mockNetworkResponse)
      }
      return Promise.reject(new Error('error'))
    })
    await getApGroupsListFn(true)(args, {} as BaseQueryApi, {}, fetchWithBQ)

    // eslint-disable-next-line max-len
    expect(createHttpRequest).toHaveBeenCalledWith(
      ApGroupConfigTemplateUrlsInfo.getApGroupsListRbac,
      args.params
    )
    expect(fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
      body: JSON.stringify(mockTransformRbacPayload)
    }))
  })

  it('getApGroupFn with rbac', async () => {
    const mockResponse = { data: { data: [], requestId: 'req' } }

    const args = {
      // eslint-disable-next-line max-len
      params: { tenantId: 'tenantId' },
      page: 1,
      pageSize: 10,
      enableRbac: true
    }

    fetchWithBQ.mockImplementation(() => {
      return Promise.resolve(mockResponse)
    })
    await getApGroupFn(true)(args, {} as BaseQueryApi, {}, fetchWithBQ)

    // eslint-disable-next-line max-len
    expect(createHttpRequest).toHaveBeenCalledWith(
      ApGroupConfigTemplateUrlsInfo.getApGroupRbac,
      args.params
    )
  })

  it('addApGroupFn with rbac', async () => {
    const mockPayload = {
      searchString: 'apgroup-temp-2',
      fields: [
        'name',
        'id'
      ],
      searchTargetFields: [
        'name'
      ],
      filters: {
        venueId: [
          '3046e23a9ef8458b945a38ee39c4b2e7'
        ]
      },
      pageSize: 10000
    }

    const mockTransformRbacPayload = {
      searchString: 'apgroup-temp-2',
      fields: [
        'name',
        'id'
      ],
      searchTargetFields: [
        'name'
      ],
      filters: {
        venueId: [
          '3046e23a9ef8458b945a38ee39c4b2e7'
        ]
      },
      pageSize: 10000,
      apSerialNumbers: []
    }

    const args = {
      // eslint-disable-next-line max-len
      params: { tenantId: 'tenantId' },
      payload: mockPayload,
      page: 1,
      pageSize: 10,
      enableRbac: true
    }
    const mockResponse = { data: { data: [], requestId: 'req' } }

    fetchWithBQ.mockImplementation(() => {
      return Promise.resolve(mockResponse)
    })
    await addApGroupFn(true)(args, {} as BaseQueryApi, {}, fetchWithBQ)

    // eslint-disable-next-line max-len
    expect(createHttpRequest).toHaveBeenCalledWith(
      ApGroupConfigTemplateUrlsInfo.addApGroup,
      args.params
    )
    expect(fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
      body: JSON.stringify(mockTransformRbacPayload)
    }))
  })

  it('updateApGroupFn with rbac', async () => {
    const mockPayload = {
      name: 'apgroup-temp-1-modify-n',
      venueId: '3046e23a9ef8458b945a38ee39c4b2e7',
      apSerialNumbers: []
    }

    const args = {
      // eslint-disable-next-line max-len
      params: { tenantId: 'tenantId' },
      payload: mockPayload,
      page: 1,
      pageSize: 10,
      enableRbac: true
    }
    const mockResponse = { data: { data: [], requestId: 'req' } }

    fetchWithBQ.mockImplementation(() => {
      return Promise.resolve(mockResponse)
    })
    await updateApGroupFn(true)(args, {} as BaseQueryApi, {}, fetchWithBQ)

    // eslint-disable-next-line max-len
    expect(createHttpRequest).toHaveBeenCalledWith(
      ApGroupConfigTemplateUrlsInfo.updateApGroupRbac,
      args.params
    )
    expect(fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
      body: JSON.stringify(mockPayload)
    }))
  })

  it('deleteApGroupsTemplateFn with rbac', async () => {
    const mockPayload = {
      searchString: '',
      fields: [
        'id',
        'venueId'
      ],
      filters: {
        id: [
          '0e56aa832e434a4ab129c776029d012a'
        ]
      },
      pageSize: 1
    }

    const args = {
      // eslint-disable-next-line max-len
      params: { tenantId: 'tenantId' },
      payload: mockPayload,
      page: 1,
      pageSize: 10,
      enableRbac: true
    }
    const mockResponse = { data: { data: [], requestId: 'req' } }

    fetchWithBQ.mockImplementation(() => {
      return Promise.resolve(mockResponse)
    })
    await deleteApGroupsTemplateFn()(args, {} as BaseQueryApi, {}, fetchWithBQ)

    // eslint-disable-next-line max-len
    expect(createHttpRequest).toHaveBeenCalledWith(
      ApGroupConfigTemplateUrlsInfo.deleteApGroupRbac,
      args.params
    )
    expect(fetchWithBQ).toBeCalledTimes(2) // apListQuery + deleteApGroup
  })
})
