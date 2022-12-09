import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { ClientsTab } from './index'

describe('ClientsTab', () => {
  it('should render list correctly', async () => {
    render(
      <Provider>
        <ClientsTab />
      </Provider>)
  })
})