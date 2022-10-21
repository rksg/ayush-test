import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { SwitchesTable } from '.'

describe('Switch List Table', () => {
  const params = { tenantId: 'tenant-id' }

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <SwitchesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/aps' }
      })

    expect(asFragment()).toMatchSnapshot()
    await screen.findByText('Switch')
  })

})
