import {
  getPolicyListRoutePath
} from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import AdaptivePolicyList, { AdaptivePolicyTabKey } from './index'

describe('AdaptivePolicyList', () =>{
  const params = { tenantId: '_tenantId_' }

  it('should render correctly', async () => {
    const policiesPath = '/t/' + params.tenantId + getPolicyListRoutePath(true)

    render(<Provider><AdaptivePolicyList tabKey={AdaptivePolicyTabKey.ADAPTIVE_POLICY}/></Provider>,
      { route: { params } })

    await screen.findByText('Adaptive Policy')
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Policies & Profiles' })).toHaveAttribute('href', policiesPath)
  })

})
