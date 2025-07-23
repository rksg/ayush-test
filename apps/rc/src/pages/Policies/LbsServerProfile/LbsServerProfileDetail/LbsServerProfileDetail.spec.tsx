import { rest }     from 'msw'

import { venueApi, policyApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  LbsServerProfileUrls,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import {
  dummyVenuesResult,
  dummyTableResult,
  mockedPolicyId1,
  mockedTenantId
} from '../__tests__/fixtures'

import LbsServerProfileDetail from './LbsServerProfileDetail'

const detailPath = '/:tenantId/t/' + getPolicyRoutePath({
  type: PolicyType.LBS_SERVER_PROFILE,
  oper: PolicyOperation.DETAIL
})


describe('LbsServerProfileDetail', () => {
  const mockParams = { tenantId: mockedTenantId, policyId: mockedPolicyId1 }

  beforeEach(async () => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(policyApi.util.resetApiState())

    mockServer.use(
      rest.post(
        LbsServerProfileUrls.getLbsServerProfileList.url,
        (_, res, ctx) => res(ctx.json(dummyTableResult))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(dummyVenuesResult))
      )
    )
  })

  it('should render successful', async () => {
    render(
      <Provider>
        <LbsServerProfileDetail />
      </Provider>, {
        route: { params: mockParams, path: detailPath }
      }
    )

    await waitFor(() => {
      expect(screen.queryByText('LBS 1')).toBeVisible()
    })
    await waitFor(() => {
      expect(screen.queryByText('My-Venue')).toBeVisible()
    })
  })
})