import '@testing-library/jest-dom'
import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { ApClientsTab } from './index'

const params = { tenantId: 'tenant-id' }

describe('ApClientsTab', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <ApClientsTab />
      </Provider>, { route: { params } }
    )
    expect(asFragment()).toMatchSnapshot()
  })
})