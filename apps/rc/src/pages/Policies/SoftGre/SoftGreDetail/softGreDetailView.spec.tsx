import { rest } from 'msw'

import { CommonUrlsInfo, PolicyOperation, PolicyType,
  SoftGreUrls,
  getPolicyRoutePath
  // TunnelProfileUrls as SoftGreUrls
} from '@acx-ui/rc/utils'
import { Path }                                                           from '@acx-ui/react-router-dom'
import { Provider }                                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockedNetworkQueryData, mockSoftGreDetail, mockSoftGreTable } from '../__tests__/fixtures'

import SoftGreDetailView from './softGreDetailView'

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
  tenantId: 'tenantId',
  policyId: 'test-policyId'
}

const detailPath = '/:tenantId/t' + getPolicyRoutePath({
  type: PolicyType.SOFTGRE,
  oper: PolicyOperation.DETAIL
})

describe('SoftGre Detail Page', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        SoftGreUrls.getSoftGreViewDataList.url,
        (_req, res, ctx) => {
          return res(ctx.json(mockSoftGreTable))
        }
      ),
      rest.post(
        CommonUrlsInfo.getWifiNetworksList.url,
        (req, res, ctx) => res(ctx.json(mockedNetworkQueryData))
      )
    )
  })

  it('should render Breadcrumb and Title correctly', async () => {
    render(
      <Provider>
        <SoftGreDetailView />
      </Provider>,
      { route: { params, path: detailPath } }
    )
    await screen.findByText('softGreProfileName1')

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'SoftGRE' })).toBeVisible()
  })
})