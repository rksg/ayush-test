import { BaseQueryApi } from '@reduxjs/toolkit/query/react'

import { ConfigTemplateUrlsInfo, NetworkVenue, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { createHttpRequest }                                  from '@acx-ui/utils'

import { updateNetworkVenueFn } from './network'

jest.mock('@acx-ui/utils')
describe('updateNetworkVenue', () => {
  const fetchWithBQ = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockPayload = {
    newData: {} as NetworkVenue,
    oldData: {} as NetworkVenue
  }

  it('should successfully update without RBAC', async () => {
    const args = {
      params: {},
      payload: mockPayload,
      enableRbac: false
    }
    const mockResponse = { data: { requestId: '123' } }
    fetchWithBQ.mockResolvedValue(mockResponse)
    await updateNetworkVenueFn()(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest)
      // eslint-disable-next-line max-len
      .toHaveBeenCalledWith(WifiUrlsInfo.updateNetworkVenue, args.params, { 'x-rks-new-ui': 'true' })
    expect(fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
      body: JSON.stringify(mockPayload.newData)
    }))
  })

  it('should successfully update with RBAC', async () => {
    const args = {
      params: {},
      payload: mockPayload,
      enableRbac: true
    }
    const mockResponse = { data: { response: { id: 'policy-id' } } }
    fetchWithBQ.mockResolvedValue(mockResponse)
    await updateNetworkVenueFn()(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest)
      // eslint-disable-next-line max-len
      .toHaveBeenCalledWith(WifiUrlsInfo.updateNetworkVenue, args.params, { 'x-rks-new-ui': 'true' })
    expect(fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
      body: JSON.stringify(mockPayload.newData)
    }))
  })

  it('should successfully update template without rbac when isTemplate is true', async () => {
    const args = {
      params: {},
      payload: mockPayload,
      enableRbac: false
    }
    const mockResponse = { data: { response: { id: 'policy-id' } } }
    fetchWithBQ.mockResolvedValue(mockResponse)

    await updateNetworkVenueFn(true)(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest)
      .toHaveBeenCalledWith(ConfigTemplateUrlsInfo.updateNetworkVenueTemplate, args.params, {
        'x-rks-new-ui': 'true' })
    expect(fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
      body: JSON.stringify(mockPayload.newData)
    }))
  })

  it('should successfully update template with rbac when isTemplate is true', async () => {
    const args = {
      params: {},
      payload: mockPayload,
      enableRbac: true
    }
    const mockResponse = { data: { response: { id: 'policy-id' } } }
    fetchWithBQ.mockResolvedValue(mockResponse)

    await updateNetworkVenueFn(true)(args, {} as BaseQueryApi, {}, fetchWithBQ)

    expect(createHttpRequest)
      .toHaveBeenCalledWith(ConfigTemplateUrlsInfo.updateNetworkVenueTemplate, args.params, {
        'x-rks-new-ui': 'true' })
    expect(fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
      body: JSON.stringify(mockPayload.newData)
    }))
  })
})
