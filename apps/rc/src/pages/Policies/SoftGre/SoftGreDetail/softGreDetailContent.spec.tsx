import { softGreApi }                                      from '@acx-ui/rc/services'
import { PolicyOperation, PolicyType, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider, store }                                 from '@acx-ui/store'
import { render, screen }                                  from '@acx-ui/test-utils'

import { mockSoftGreDetail } from '../__tests__/fixtures'

import SoftGreDetailContent from './softGreDetailContent'


let params: { tenantId: string, policyId: string }
params = {
  tenantId: 'tenantId',
  policyId: 'test-policyId'
}

const detailPath = '/:tenantId/t' + getPolicyRoutePath({
  type: PolicyType.SOFTGRE,
  oper: PolicyOperation.DETAIL
})

describe('SoftGre Detail Content Component', () => {
  store.dispatch(softGreApi.util.resetApiState())
  it('should render SoftGreDetailContent component successfully', async () => {
    render(
      <Provider>
        <SoftGreDetailContent data={mockSoftGreDetail} />
      </Provider>,
      { route: { params, path: detailPath } }
    )
    await screen.findByText('Manual (1450)')
    await screen.findByText('Off')
  })
})