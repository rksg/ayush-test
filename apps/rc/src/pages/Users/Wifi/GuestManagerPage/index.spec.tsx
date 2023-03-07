import { Provider } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import GuestManagerPage from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => ({
  useUserProfileContext: () => ({
    data: { role: 'OFFICE_ADMIN' }
  })
}))

jest.mock('../ClientList/GuestsTab/GuestsTable', () => ({
  GuestsTable: () => <div data-testid={'rc-GuestsTable'} title='GuestsTable' />
}))

describe('GuestManagerPage', () => {
  const params = { tenantId: 'tenant-id' }

  it('should render correctly', async () => {
    render(
      <Provider>
        <GuestManagerPage />
      </Provider>, {
        route: { params, path: '/:tenantId/users/guestsManager' }
      })

    expect(await screen.findByTestId('rc-GuestsTable')).toBeVisible()
  })
})
