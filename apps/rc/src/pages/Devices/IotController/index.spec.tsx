import { rest } from 'msw'

import { rwgApi, venueApi }                 from '@acx-ui/rc/services'
import { IotUrlsInfo, IotControllerStatus } from '@acx-ui/rc/utils'
import { Provider, store }                  from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { IotController } from '.'

const iotControllerList = {
  requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f',
  response: {
    data: [{
      id: 'bbc41563473348d29a36b76e95c50381',
      name: 'ruckusdemos',
      inboundAddress: '192.168.1.1',
      iotSerialNumber: 'rewqfdsafasd',
      publicAddress: 'ruckusdemos.cloud',
      publicPort: 443,
      apiToken: 'xxxxxxxxxxxxxxxxxxx',
      tenantId: '3f10af1401b44902a88723cb68c4bc77',
      assocVenueId: 'db2b80ba868c419fb5c1732575160808'
    }, {
      id: 'e0dfcc8c-e328-4969-b5de-10aa91b98b82',
      name: 'iotController1',
      inboundAddress: '192.168.2.21',
      iotSerialNumber: 'jfsdjoiasdfjo',
      publicAddress: '35.229.207.4',
      publicPort: 443,
      apiToken: 'xxxxxxxxxxxxxxxxxxx',
      tenantId: '3f10af1401b44902a88723cb68c4bc77',
      assocVenueId: 'db2b80ba868c419fb5c1732575160808'
    }] as IotControllerStatus[]
  }
}

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))


describe('Iot Controller Table', () => {
  let params: { tenantId: string, venueId: string }
  beforeEach(async () => {
    store.dispatch(rwgApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(
        IotUrlsInfo.getIotControllerList.url,
        (req, res, ctx) => res(ctx.json(iotControllerList))
      ),
      rest.delete(
        IotUrlsInfo.deleteIotController.url,
        (req, res, ctx) => res(ctx.json({ requestId: '4cde2a1a-f916-4a19-bcac-869620d7f96f' }))
      )
    )
    params = {
      tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
      venueId: '3f10af1401b44902a88723cb68c4bc77'
    }
  })

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <IotController />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/iotController' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Add IoT Controller')
    expect(asFragment().querySelector('div[class="ant-space-item"]')).not.toBeNull()
  })

})
