/* eslint-disable max-len */
import { BaseQueryApi, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'

import { FacilityEnum, FlowLevelEnum, PoliciesConfigTemplateUrlsInfo, SyslogPolicyDetailType, SyslogPolicyListType, SyslogUrls, VenueSyslogSettingType } from '@acx-ui/rc/utils'
import { RequestPayload }                                                                                                                                from '@acx-ui/types'
import { batchApi, createHttpRequest, TableResult }                                                                                                      from '@acx-ui/utils'

import { addSyslogPolicyFn, getSyslogPolicyFn, transformGetVenueSyslog, updateSyslogPolicyFn } from './syslog'

jest.mock('@acx-ui/utils')
describe('addSyslogPolicy', () => {
  const fetchWithBQ = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockPolicyPayload: SyslogPolicyDetailType = {
    name: 'test-policy',
    primary: {},
    secondary: {},
    venues: [{ id: 'venueId1', name: 'venueName1' }]
  }

  it('should successfully add a syslog policy without RBAC', async () => {
    const args = {
      params: {},
      payload: mockPolicyPayload,
      enableRbac: false
    }
    const mockResponse = { data: { response: { id: 'policy-id' }, requestId: '123' } }
    fetchWithBQ.mockResolvedValue(mockResponse)
    await addSyslogPolicyFn()(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(SyslogUrls.addSyslogPolicy, args.params)
    expect(fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
      body: JSON.stringify(args.payload)
    }))
  })

  it('should successfully add a syslog policy with RBAC', async () => {
    const args = {
      params: {},
      payload: mockPolicyPayload,
      enableRbac: true
    }
    const mockResponse = { data: { response: { id: 'policy-id' } } }
    fetchWithBQ.mockResolvedValue(mockResponse)

    await addSyslogPolicyFn()(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(SyslogUrls.addSyslogPolicyRbac, args.params)
    expect(fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
      body: JSON.stringify({
        name: mockPolicyPayload.name,
        primary: mockPolicyPayload.primary,
        secondary: mockPolicyPayload.secondary
      })
    }))
    expect(batchApi).toHaveBeenCalledWith(SyslogUrls.bindVenueSyslog, [{ params: { venueId: 'venueId1', policyId: 'policy-id' } }], fetchWithBQ)
  })

  it('should use template URLs when isTemplate is true', async () => {
    const args = {
      params: {},
      payload: mockPolicyPayload,
      enableRbac: true
    }
    const mockResponse = { data: { response: { id: 'policy-id' } } }
    fetchWithBQ.mockResolvedValue(mockResponse)

    await addSyslogPolicyFn(true)(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(PoliciesConfigTemplateUrlsInfo.addSyslogPolicyRbac, args.params)
    expect(batchApi).toHaveBeenCalledWith(PoliciesConfigTemplateUrlsInfo.bindVenueSyslog, [{ params: { venueId: 'venueId1', policyId: 'policy-id' } }], fetchWithBQ)
  })
})


describe('updateSyslogPolicy', () => {
  const fetchWithBQ = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockPolicyPayload: SyslogPolicyDetailType = {
    id: 'policy-id',
    name: 'test-policy',
    primary: {},
    secondary: {},
    venues: [{ id: 'venueId1', name: '' }, { id: 'venueId2', name: '' }],
    oldVenues: []
  }

  it('should successfully update a syslog policy without RBAC', async () => {
    const args = {
      params: {},
      payload: mockPolicyPayload,
      enableRbac: false
    }
    const mockResponse = { data: { requestId: '123' } }
    fetchWithBQ.mockResolvedValue(mockResponse)
    await updateSyslogPolicyFn()(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(SyslogUrls.updateSyslogPolicy, args.params)
    expect(fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
      body: JSON.stringify(mockPolicyPayload)
    }))
  })

  it('should successfully update a syslog policy with RBAC', async () => {
    const args = {
      params: {},
      payload: mockPolicyPayload,
      enableRbac: true
    }
    const mockResponse = { data: { response: { id: 'policy-id' } } }
    fetchWithBQ.mockResolvedValue(mockResponse)
    await updateSyslogPolicyFn()(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(SyslogUrls.updateSyslogPolicyRbac, args.params)
    expect(fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
      body: JSON.stringify({
        id: mockPolicyPayload.id,
        name: mockPolicyPayload.name,
        primary: mockPolicyPayload.primary,
        secondary: mockPolicyPayload.secondary
      })
    }))
    const expectedBindVenueIds = [{ params: { venueId: 'venueId1', policyId: 'policy-id' } }, { params: { venueId: 'venueId2', policyId: 'policy-id' } }]
    expect(batchApi).toHaveBeenCalledWith(SyslogUrls.bindVenueSyslog, expectedBindVenueIds, fetchWithBQ)
  })

  it('should use template URLs when isTemplate is true', async () => {
    const args = {
      params: {},
      payload: mockPolicyPayload,
      enableRbac: true
    }
    const mockResponse = { data: { response: { id: 'policy-id' } } }
    fetchWithBQ.mockResolvedValue(mockResponse)

    await updateSyslogPolicyFn(true)(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(PoliciesConfigTemplateUrlsInfo.updateSyslogPolicyRbac, args.params)
    const expectedBindVenueIds = [{ params: { venueId: 'venueId1', policyId: 'policy-id' } }, { params: { venueId: 'venueId2', policyId: 'policy-id' } }]
    expect(batchApi).toHaveBeenCalledWith(PoliciesConfigTemplateUrlsInfo.bindVenueSyslog, expectedBindVenueIds, fetchWithBQ)
  })
})


describe('getSyslogPolicy', () => {
  const fetchWithBQ = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully get a syslog policy without RBAC', async () => {
    const args = {
      params: { policyId: 'policy-id' },
      enableRbac: false
    }
    const mockResponse = { data: { id: 'policy-id', name: 'test-policy', primary: {}, secondary: {} } }
    fetchWithBQ.mockResolvedValue(mockResponse)

    const result = await getSyslogPolicyFn()(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(SyslogUrls.getSyslogPolicy, args.params)
    expect(result).toEqual({ data: mockResponse.data })
  })

  it('should successfully get a syslog policy with RBAC', async () => {
    const args = {
      params: { policyId: 'policy-id' },
      enableRbac: true
    }
    const mockRes = { data: { id: 'policy-id', name: 'test-policy', primary: {}, secondary: {} } }
    const mockViewModelRes = { data: { data: [{ venueIds: ['venue1', 'venue2'] }] } }
    fetchWithBQ
      .mockResolvedValueOnce(mockRes)
      .mockResolvedValueOnce(mockViewModelRes)

    const result = await getSyslogPolicyFn()(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(SyslogUrls.getSyslogPolicyRbac, args.params)
    expect(createHttpRequest).toHaveBeenCalledWith(SyslogUrls.querySyslog, args.params)
    expect(fetchWithBQ).toHaveBeenCalledTimes(2)
    expect(result).toEqual({
      data: {
        ...mockRes.data,
        venues: [
          { id: 'venue1', name: '' },
          { id: 'venue2', name: '' }
        ]
      }
    })
  })

  it('should return an error when fetch fails without RBAC', async () => {
    const args = {
      params: { policyId: 'policy-id' },
      enableRbac: false
    }
    const mockError = { error: { status: 500, data: 'Internal Server Error' } }
    fetchWithBQ.mockResolvedValue(mockError)

    const result = await getSyslogPolicyFn()(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(result).toEqual({ error: mockError.error })
  })

  it('should return an error when fetch fails with RBAC', async () => {
    const args = {
      params: { policyId: 'policy-id' },
      enableRbac: true
    }
    const mockError = { error: { status: 500, data: 'Internal Server Error' } }
    fetchWithBQ
      .mockResolvedValueOnce(mockError)
      .mockResolvedValueOnce({ data: {} })

    const result = await getSyslogPolicyFn()(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(result).toEqual({ error: mockError.error })
  })

  it('should use template URLs when isTemplate is true', async () => {
    const args = {
      params: { policyId: 'policy-id' },
      enableRbac: false
    }
    const mockResponse = { data: { id: 'policy-id', name: 'test-policy', primary: {}, secondary: {} } }
    fetchWithBQ.mockResolvedValue(mockResponse)

    const result = await getSyslogPolicyFn(true)(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest).toHaveBeenCalledWith(PoliciesConfigTemplateUrlsInfo.getSyslogPolicy, args.params)
    expect(result).toEqual({ data: mockResponse.data })
  })
})

describe('transformGetVenueSyslog', () => {
  const mockArg: RequestPayload = {
    params: { policyId: 'policy-id' },
    enableRbac: false
  }

  it('should return response directly when enableRbac is false', () => {
    const response: VenueSyslogSettingType = {
      serviceProfileId: 'profile-id',
      enabled: true
    }

    const result = transformGetVenueSyslog(response, {} as FetchBaseQueryMeta, mockArg)

    expect(result).toEqual(response)
  })

  it('should transform response when enableRbac is true and data is present', () => {
    const mockArgWithRbac: RequestPayload = {
      ...mockArg,
      enableRbac: true
    }
    const response: TableResult<SyslogPolicyListType> = {
      data: [{ id: 'policy-id', name: '', facility: FacilityEnum.KEEP_ORIGINAL, flowLevel: FlowLevelEnum.ALL }],
      page: 0,
      totalCount: 1
    }

    const result = transformGetVenueSyslog(response, {} as FetchBaseQueryMeta, mockArgWithRbac)

    expect(result).toEqual({ serviceProfileId: 'policy-id', enabled: true })
  })

  it('should return enabled false when enableRbac is true and no data is present', () => {
    const mockArgWithRbac: RequestPayload = {
      ...mockArg,
      enableRbac: true
    }
    const response: TableResult<SyslogPolicyListType> = {
      data: [],
      page: 0,
      totalCount: 0
    }

    const result = transformGetVenueSyslog(response, {} as FetchBaseQueryMeta, mockArgWithRbac)

    expect(result).toEqual({ enabled: false })
  })
})