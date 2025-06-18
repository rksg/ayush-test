import userEvent from '@testing-library/user-event'

import {
  Provider
} from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps } from '@acx-ui/user'

import  PendingAssets from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./PendingAp', () => ({
  ...jest.requireActual('./PendingAp'),
  PendingAp: () => <div data-testid='mocked-PendingAp-table'></div>
}))
jest.mock('./PendingSwitch', () => ({
  ...jest.requireActual('./PendingSwitch'),
  PendingSwitch: () => <div data-testid='mocked-PendingSwitch-table'></div>
}))

describe('Firmware Version Management', () => {
  const params: { tenantId: string, activeTab: string, activeSubTab: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    activeTab: 'PendingAssets',
    activeSubTab: 'pendingAp'
  }
  it('should render correctly', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider value={{} as UserProfileContextProps}>
          <PendingAssets />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/administration/pendingAssets/pendingAp' }
      })
    await screen.findByTestId('mocked-PendingAp-table')
    await userEvent.click(await screen.findByRole('tab', { name: /Switch/ }))
    await screen.findByTestId('mocked-PendingSwitch-table')
  })
})
