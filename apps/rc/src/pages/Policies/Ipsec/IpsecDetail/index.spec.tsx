import { rest } from 'msw'

import { ipSecApi }    from '@acx-ui/rc/services'
import { PolicyOperation, PolicyType,
  IpsecUrls,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockIpSecDetailFromListQueryById } from '../__tests__/fixtures'

import IpsecDetail from '.'


let params: { tenantId: string, policyId: string }
params = {
  tenantId: '__tenantId__',
  policyId: 'a983a74d1791406a9dfb17c6796676d4'
}

const detailPath = '/:tenantId/t' + getPolicyRoutePath({
  type: PolicyType.IPSEC,
  oper: PolicyOperation.DETAIL
})

describe('IpSec Detail Page', () => {
  beforeEach(() => {
    store.dispatch(ipSecApi.util.resetApiState())
    mockServer.use(
      rest.post(
        IpsecUrls.getIpsecViewDataList.url,
        (_, res, ctx) => {
          return res(ctx.json(mockIpSecDetailFromListQueryById))
        }
      )
    )
  })

  it('should render Breadcrumb correctly', async () => {
    render(
      <Provider>
        <IpsecDetail />
      </Provider>,
      { route: { params, path: detailPath } }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(await screen.findByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
    expect(await screen.findByRole('link', { name: 'IPsec' })).toBeVisible()
  })
})