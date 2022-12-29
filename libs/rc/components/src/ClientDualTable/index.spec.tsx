import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { ClientDualTable } from './index'

describe('ClientDualTable', () => {
  it('should render list correctly', async () => {
    render(
      <Provider>
        <ClientDualTable />
      </Provider>)
  })
})