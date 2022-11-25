import '@testing-library/jest-dom'
import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { ApGuestsTab } from './index'

const params = { tenantId: 'tenant-id' }

describe('ApGuestsTab', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <ApGuestsTab />
      </Provider>, { route: { params } }
    )
    expect(asFragment()).toMatchSnapshot()
  })
})