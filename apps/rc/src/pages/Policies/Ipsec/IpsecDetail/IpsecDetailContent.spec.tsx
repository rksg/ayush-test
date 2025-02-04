import { PolicyOperation, PolicyType, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { render, screen }                                  from '@acx-ui/test-utils'

import { mockIpSecTable } from '../__tests__/fixtures'

import IpsecDetailContent from './IpsecDetailContent'


let params: { tenantId: string, policyId: string }
params = {
  tenantId: 'tenantId',
  policyId: 'test-policyId'
}

const detailPath = '/:tenantId/t' + getPolicyRoutePath({
  type: PolicyType.IPSEC,
  oper: PolicyOperation.DETAIL
})

describe('IpSec Detail Content Component', () => {
  it('should render IpsecDetailContent component successfully', async () => {
    render(
      <Provider>
        <IpsecDetailContent data={mockIpSecTable.data[1]} />
      </Provider>,
      { route: { params, path: detailPath } }
    )
    await screen.findAllByText('Pre-shared Key')
    await screen.findByText('Default')
    await screen.findByText('Custom')
  })
})