import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import AdaptivePolicyTable from './index'

describe('AdaptivePolicyTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  it('should render correctly', async () => {
    render(<Provider><AdaptivePolicyTable /></Provider>, {
      route: { params }
    })
  })

})
