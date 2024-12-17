import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ClientIsolationUrls,
  CommonUrlsInfo,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  CommonRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'

import { mockedClientIsolationQueryApListData, mockedClientIsolationQueryData, mockedNetworkQueryData, mockedVenueData, mockedVenueUsage } from './__tests__/fixtures'
import { ClientIsolationInstancesTable }                                                                                                   from './ClientIsolationInstancesTable'

describe('ClientIsolationInstancesTable', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    policyId: '4b76b1952c80401b8500b00d68106576'
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.DETAIL })

  it.skip('should render the table view', async () => {
    mockServer.use(
      rest.post(
        ClientIsolationUrls.getVenueUsageByClientIsolation.url,
        (req, res, ctx) => res(ctx.json({ ...mockedVenueUsage }))
      )
    )

    render(
      <Provider>
        <ClientIsolationInstancesTable/>
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    // eslint-disable-next-line max-len
    const targetRow = await screen.findByRole('row', { name: new RegExp(mockedVenueUsage.data[0].venueName) })
    expect(targetRow).toBeVisible()
  })

  it('should render the table view with rbac api', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE
      || ff === Features.WIFI_ETHERNET_CLIENT_ISOLATION_TOGGLE)

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (req, res, ctx) => res(ctx.json(mockedVenueData))
      ),
      rest.post(
        CommonUrlsInfo.getWifiNetworksList.url,
        (req, res, ctx) => res(ctx.json(mockedNetworkQueryData))
      ),
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(mockedClientIsolationQueryApListData))
      ),
      rest.post(
        ClientIsolationUrls.queryClientIsolation.url,
        (req, res, ctx) => res(ctx.json(mockedClientIsolationQueryData))
      )
    )

    render(
      <Provider>
        <ClientIsolationInstancesTable/>
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    const targetRow = await screen.findByRole('row', { name: /My-Venue/ })
    expect(targetRow).toBeVisible()
    expect(within(targetRow).getByText('1')).toBeVisible()
    expect(within(targetRow).getByText('85 Main St,New York,United States')).toBeVisible()
    const targetRow2 = await screen.findByRole('row', { name: /venue1/ })
    expect(targetRow2).toBeVisible()
    expect(within(targetRow2).getByText('1')).toBeVisible()
    expect(within(targetRow2).getByText('350 W Java Dr, Sunnyvale, CA 94089, USA')).toBeVisible()
    expect(within(targetRow2).getByText('2')).toBeVisible()
    const targetRow2Cell = screen.getAllByRole('cell', { name: '2' })
    await userEvent.hover(within(targetRow2Cell[0]).getByText('2'))
    expect(await screen.findByRole('tooltip', { hidden: false }))
      .toHaveTextContent('AP-R610AP-R510')
  })
})
