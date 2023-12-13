import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { CommonUrlsInfo, DpskUrls, NetworkTypeEnum, RadioEnum, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { WlanSecurityEnum, PassphraseFormatEnum, PassphraseExpirationEnum }   from '@acx-ui/rc/utils'
import { Provider }                                                           from '@acx-ui/store'
import { mockServer, render }                                                 from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                       from '@acx-ui/user'

import {
  venuesResponse,
  networksResponse,
  successResponse,
  cloudpathResponse,
  networkDeepResponse,
  venueListResponse
} from '../__tests__/fixtures'

import { SummaryForm } from './SummaryForm'


jest.mock('socket.io-client')

const mockSummary = {
  name: 'test',
  type: NetworkTypeEnum.DPSK,
  isCloudpathEnabled: false,
  enableAuthProxy: true,
  venues: [
    {
      venueId: '6cf550cdb67641d798d804793aaa82db',
      name: 'My-Venue',
      allApGroupsRadio: RadioEnum.Both
    }
  ],
  wlanSecurity: WlanSecurityEnum.WPA2Enterprise,
  dpskPassphraseGeneration: {
    format: PassphraseFormatEnum.MOST_SECURED,
    length: 18,
    expiration: PassphraseExpirationEnum.UNLIMITED
  }
}

const dpskListResponse = {
  content: [
    {
      id: '123456789',
      name: 'DPSK Service 1',
      passphraseLength: 18,
      passphraseFormat: 'MOST_SECURED',
      expirationType: null
    }
  ],
  totalElements: 1,
  totalPages: 1,
  pageable: {
    pageNumber: 0,
    pageSize: 10
  },
  sort: []
}

describe('SummaryForm', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'AAA network test'
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(WifiUrlsInfo.addNetworkDeep.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.put(WifiUrlsInfo.updateNetworkDeep.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [networkDeepResponse] }))),
      rest.get(DpskUrls.getDpskList.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(dpskListResponse)))
    )
  })
  it('should render cloudpath enabled successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    mockSummary.isCloudpathEnabled = true
    const { asFragment } = render(
      <Provider>
        <Form>
          <SummaryForm summaryData={mockSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it('should render cloudpath disabled successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    mockSummary.isCloudpathEnabled = false
    const { asFragment } = render(
      <Provider>
        <Form>
          <SummaryForm summaryData={mockSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should show proxy service disable for non proxy support', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    mockSummary.isCloudpathEnabled = true
    mockSummary.enableAuthProxy = false
    const { asFragment } = render(
      <Provider>
        <Form>
          <SummaryForm summaryData={mockSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
