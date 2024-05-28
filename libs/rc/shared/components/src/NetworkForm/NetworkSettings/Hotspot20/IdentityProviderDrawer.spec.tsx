
import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import IdentityProviderDrawer from './IdentityProviderDrawer'

const params = { tenantId: '123' }

it('should render add Identity Provider drawer correctly', async () => {
  render(
    <Provider>
      <IdentityProviderDrawer
        visible={true}
        setVisible={jest.fn()}
        handleSave={jest.fn()} />
    </Provider>, {
      route: { params }
    }
  )

  expect(screen.getByText('Add Identity Provider')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Next' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
})