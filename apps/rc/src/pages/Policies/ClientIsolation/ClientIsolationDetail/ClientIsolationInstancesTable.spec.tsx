import { rest } from 'msw'

import {
  ClientIsolationUrls,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockedVenueUsage }              from './__tests__/fixtures'
import { ClientIsolationInstancesTable } from './ClientIsolationInstancesTable'


describe('ClientIsolationInstancesTable', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    policyId: '4b76b1952c80401b8500b00d68106576'
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.DETAIL })

  it('should render the table view', async () => {
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
})
