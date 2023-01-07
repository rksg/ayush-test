import '@testing-library/jest-dom'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { UserProfile } from './index'

const params = { tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('UserProfile', () => {
  it('should render page header', async () => {render(
    <Provider>
      <UserProfile />
    </Provider>, { route: { params } })
  // expect(screen.getByText('Notifications')).toBeVisible()
  expect(screen.getByText('Settings')).toBeVisible()
  expect(screen.getByText('Security')).toBeVisible()
  expect(screen.getByText('Recent Logins')).toBeVisible()
  })
})
