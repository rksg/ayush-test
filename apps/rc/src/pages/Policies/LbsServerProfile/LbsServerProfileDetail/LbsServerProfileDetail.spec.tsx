import { rest }     from 'msw'
import { Path, To } from 'react-router-dom'

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


const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/' + mockedTenantId,
  search: '',
  hash: ''
}

const detailPath = '/:tenantId/t/' + getPolicyRoutePath({
  type: PolicyType.LBS_SERVER_PROFILE,
  oper: PolicyOperation.DETAIL
})

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))

describe('LbsServerProfileDetail', () => {
  const mockParams = { tenantId: mockedTenantId, policyId: mockedPolicyId1 }
  const mockDeleteFn = jest.fn()

  beforeEach(async () => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(policyApi.util.resetApiState())
    mockDeleteFn.mockClear()

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