import { rest } from 'msw'

import { clientApi }          from '@acx-ui/rc/services'
import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider, store }    from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { HistoricalClientsTable } from '.'

const histClientList = {
  totalCount: 2,
  page: 1,
  data: [{
    clientIP: '10.206.1.70',
    clientMac: '24:41:8c:c3:16:df',
    disconnectTime: '1668068167',
    eventId: '204',
    event_datetime: '2022-11-10 08:16:07 +0000',
    hostname: 'LP-YGUO1',
    id: '1de34a75f8414e759bfb9761130ac33c',
    serialNumber: '302002015736',
    ssid: 'NMS-app6-WLAN',
    userName: '24418cc316df',
    venueId: '4c778ed630394b76b17bce7fe230cf9f'
  }, {
    clientMac: 'b2:db:24:a0:08:a9',
    disconnectTime: '1667448262',
    eventId: '205',
    event_datetime: '2022-11-03 04:04:22 +0000',
    id: '228f155adae54b89ae3e2296587a2116',
    serialNumber: '302002015736',
    ssid: 'guest pass wlan',
    venueId: '4c778ed630394b76b17bce7fe230cf9f'
  }]
}

const eventMetaList = {
  data: [{
    apName: '302002015736-0802',
    id: '1de34a75f8414e759bfb9761130ac33c',
    isApExists: false,
    isClientExists: false,
    isVenueExists: false,
    networkId: '3f04e252a9d04180855813131d007aca',
    venueName: 'My-Venue'
  }, {
    apName: '302002015736-0802',
    id: '228f155adae54b89ae3e2296587a2116',
    isApExists: true,
    isClientExists: false,
    isVenueExists: true,
    venueName: 'My-Venue'
  }]
}

describe('HistoricalClientsTable', () => {
  beforeEach(() => {
    store.dispatch(clientApi.util.resetApiState())
    mockServer.use(
      rest.post(CommonUrlsInfo.getHistoricalClientList.url,
        (_, res, ctx) => res(ctx.json(histClientList))),
      rest.post(CommonUrlsInfo.getEventListMeta.url,
        (_, res, ctx) => res(ctx.json(eventMetaList)))
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    const { asFragment } = render(<Provider>
      <HistoricalClientsTable
        searchString='24'
        setHistoricalClientCount={jest.fn()}
        id={'historicalClient'} />
    </Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('24:41:8c:c3:16:df')
    expect(asFragment()).toMatchSnapshot()
  })
})
