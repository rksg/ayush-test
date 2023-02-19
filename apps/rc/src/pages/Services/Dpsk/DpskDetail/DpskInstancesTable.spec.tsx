import { rest } from 'msw'

import {
  CommonUrlsInfo,
  ServiceType,
  DpskDetailsTabKey,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockedNetworks } from './__tests__/fixtures'
import DpskInstancesTable from './DpskInstancesTable'

describe('DpskInstancesTable', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    serviceId: '4b76b1952c80401b8500b00d68106576',
    activeTab: DpskDetailsTabKey.OVERVIEW
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })

  mockServer.use(
    rest.post(
      CommonUrlsInfo.getVMNetworksList.url,
      (req, res, ctx) => res(ctx.json(mockedNetworks))
    )
  )

  it('should render the table', async () => {
    const targetNetwork = mockedNetworks.data[0]
    const networkLink =
      `/t/${params.tenantId}/networks/wireless/${targetNetwork.id}/network-details/overview`

    render(
      <Provider>
        <DpskInstancesTable />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    const targetRow = await screen.findByRole('link', { name: targetNetwork.name })
    expect(targetRow).toHaveAttribute('href', networkLink)
  })
})
