import { rest } from 'msw'

import { softGreApi }  from '@acx-ui/rc/services'
import { CommonUrlsInfo, PolicyOperation, PolicyType,
  SoftGreUrls,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Path }                       from '@acx-ui/react-router-dom'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockedNetworkQueryData, mockedVenueQueryData, mockSoftGreDetailFromListQueryById } from '../__tests__/fixtures'

import SoftGreDetail from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

let params: { tenantId: string, policyId: string }
params = {
  tenantId: '__tenantId__',
  policyId: 'a983a74d1791406a9dfb17c6796676d4'
}

const detailPath = '/:tenantId/t' + getPolicyRoutePath({
  type: PolicyType.SOFTGRE,
  oper: PolicyOperation.DETAIL
})

describe('SoftGre Detail Page', () => {
  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => {
          return res(ctx.json(mockSoftGreDetailFromListQueryById))
        }
      ),
      rest.post(
        CommonUrlsInfo.getWifiNetworksList.url,
        (_, res, ctx) => res(ctx.json(mockedNetworkQueryData))
      ),
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (_, res, ctx) => res(ctx.json(mockedVenueQueryData))
      )
    )
  })

  it('should render Breadcrumb correctly', async () => {
    render(
      <Provider>
        <SoftGreDetail />
      </Provider>,
      { route: { params, path: detailPath } }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(await screen.findByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
    expect(await screen.findByRole('link', { name: 'SoftGRE' })).toBeVisible()
  })
})