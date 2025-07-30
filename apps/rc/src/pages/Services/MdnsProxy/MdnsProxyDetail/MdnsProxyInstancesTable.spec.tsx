import { rest } from 'msw'

import { apApi }       from '@acx-ui/rc/services'
import {
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType,
  SwitchRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { mockedApList, mockedVenueList } from '../MdnsProxyForm/__tests__/fixtures'

import { MdnsProxyInstancesTable } from './MdnsProxyInstancesTable'

mockServer.use(
  rest.post(
    CommonUrlsInfo.getApsList.url,
    (req, res, ctx) => res(ctx.json({ ...mockedApList }))
  )
)

describe('MdnsProxyInstancesTable', () => {

  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    mockServer.use(
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(mockedApList))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockedVenueList))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json({ data: [], totalCount: 0 }))
      )
    )
  })

  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    serviceId: '4b76b1952c80401b8500b00d68106576'
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.DETAIL })

  it('should render the table view', async () => {
    render(
      <Provider>
        <MdnsProxyInstancesTable apList={mockedApList.data.map(a => a.serialNumber)} />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    await waitFor(async () =>
      expect(await screen.findByText(/Instances \(1\)/)).toBeVisible()
    )
    // eslint-disable-next-line max-len
    const targetRow = await screen.findByRole('row', { name: new RegExp(mockedApList.data[0].name) })
    expect(targetRow).toBeInTheDocument()
  })
})
