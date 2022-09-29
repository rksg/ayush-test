import '@testing-library/jest-dom'
import { Form }       from 'antd'
import { rest }       from 'msw'
import socketIOClient from 'socket.io-client'
import MockedSocket   from 'socket.io-mock'

import { CommonUrlsInfo, websocketServerUrl }                               from '@acx-ui/rc/utils'
import { WlanSecurityEnum, PassphraseFormatEnum, PassphraseExpirationEnum } from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render }                                               from '@acx-ui/test-utils'

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
  type: 'dpsk',
  isCloudpathEnabled: false,
  venues: [
    {
      venueId: '6cf550cdb67641d798d804793aaa82db',
      name: 'My-Venue'
    }
  ],
  wlanSecurity: WlanSecurityEnum.WPA2Enterprise,
  dpskPassphraseGeneration: { 
    format: PassphraseFormatEnum.MOST_SECURED,
    length: 18,
    expiration: PassphraseExpirationEnum.UNLIMITED
  }
}

describe('SummaryForm', () => {
  let socket
  
  beforeEach(() => {
    socket = new MockedSocket()
    socketIOClient.mockReturnValue(socket)
    networkDeepResponse.name = 'AAA network test'
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(CommonUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse))),
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(CommonUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(networkDeepResponse))),
      rest.get(`http://localhost${websocketServerUrl}/`,
        (_, res, ctx) => res(ctx.json({})))
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
})
