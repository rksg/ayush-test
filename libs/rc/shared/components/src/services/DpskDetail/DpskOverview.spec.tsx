
import { rest } from 'msw'

import { useIsTierAllowed }           from '@acx-ui/feature-toggle'
import {
  ServiceType,
  DpskDetailsTabKey,
  getServiceRoutePath,
  ServiceOperation, CommonUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  mockedCloudpathDpsk
} from './__tests__/fixtures'
import { DpskOverview } from './DpskOverview'

jest.mock('./DpskInstancesTable', () => ({
  ...jest.requireActual('./DpskInstancesTable'),
  DpskInstancesTable: () => <div>DPSK Instances Table</div>
}))

describe('DpskDetails', () => {
  const paramsForOverviewTab = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    serviceId: '4b76b1952c80401b8500b00d68106576',
    activeTab: DpskDetailsTabKey.OVERVIEW
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render the overview page with cloudpath settings', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <DpskOverview data={mockedCloudpathDpsk} />
      </Provider>, {
        route: {
          params: paramsForOverviewTab,
          path: detailPath
        }
      }
    )

    expect(await screen.findByText('ACCEPT')).toBeVisible()

    jest.mocked(useIsTierAllowed).mockRestore()
  })
})
