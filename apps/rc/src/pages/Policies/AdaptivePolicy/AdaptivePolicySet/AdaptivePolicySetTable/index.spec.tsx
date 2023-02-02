import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import AdaptivePolicySetTable from './index'

describe('AdaptivePolicySetTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  it('should render correctly', async () => {
    render(<Provider><AdaptivePolicySetTable /></Provider>, {
      route: { params }
    })
  })

})
