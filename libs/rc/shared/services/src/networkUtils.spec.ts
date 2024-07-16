import { BaseQueryApi } from '@reduxjs/toolkit/query'

import { ConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { createHttpRequest }      from '@acx-ui/utils'

import { addNetworkVenueFn } from './networkUtils'

jest.mock('@acx-ui/utils')
const fetchWithBQ = jest.fn()

describe('networkUtils', () => {
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

  it('should successfully add a networkVenue with RBAC and template', async () => {
    const args = {
      // eslint-disable-next-line max-len
      params: { tenantId: 'tenantId', venueId: mockNetworkVenuePayload.venueId, networkId: mockNetworkVenuePayload.networkId },
      payload: mockNetworkVenuePayload,
      enableRbac: true
    }
    const mockResponse = { data: { response: { }, requestId: 'req' } }
    fetchWithBQ.mockResolvedValue(mockResponse)
    await addNetworkVenueFn(true)(args, {} as BaseQueryApi, {}, fetchWithBQ)

    // eslint-disable-next-line max-len
    expect(createHttpRequest).toHaveBeenCalledWith(
      ConfigTemplateUrlsInfo.addNetworkVenueTemplateRbac,
      args.params,
      // eslint-disable-next-line max-len
      { 'Accept': 'application/vnd.ruckus.v1+json', 'Content-Type': 'application/vnd.ruckus.v1+json' }
    )
    expect(fetchWithBQ).toHaveBeenCalledWith(expect.objectContaining({
      body: JSON.stringify(args.payload)
    }))
  })
})
