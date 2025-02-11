import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'
import { RolesEnum }               from '@acx-ui/types'
import {
  UserProfile as UserProfileInterface,
  UserProfileContext,
  UserProfileContextProps,
  hasRoles
}         from '@acx-ui/user'

import { UserNotifications } from './index'

const params = { tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()
const mockedWindowReload = jest.fn()

const userProfile = {
  initials: 'FL',
  fullName: 'First Last',
  role: RolesEnum.ADMINISTRATOR,
  email: 'dog12@email.com',
  dateFormat: 'yyyy/mm/dd',
  detailLevel: 'su',
  preferredLanguage: 'en-US'
} as UserProfileInterface

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => ({ state: { from: '/test' } })
}))
const mockUpdateUserProfileMutation = jest.fn().mockImplementation(() => Promise.resolve())
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUpdateUserProfileMutation: () => ([mockUpdateUserProfileMutation]),
  hasRoles: jest.fn()
}))

describe('UserNotifications', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        reload: mockedWindowReload
      }
    })
  })
  beforeEach(() => {
    (hasRoles as jest.Mock).mockReturnValue(false)
  })
  it('should render correctly', async () => {
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      >
        <UserNotifications profile={userProfile}/>
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })

    expect(screen.getByText('Delivery Preference')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    expect(screen.getAllByRole('switch')).toHaveLength(2)
    expect(screen.getAllByRole('switch')[0]).not.toBeChecked()
    expect(screen.getAllByRole('switch')[1]).not.toBeChecked()
    expect(screen.getByText('Enable Email Notifications')).toBeVisible()
    expect(screen.getByText('Enable SMS Notifications')).toBeVisible()
  })
  it('should save correctly', async () => {
    const profile = { profile: {
      ...userProfile,
      preferredNotifications: { emailPreferences: true, smsPreferences: true }
    }, allowedOperations: [] }

    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: profile.profile } as UserProfileContextProps}
      >
        <UserNotifications profile={profile.profile}/>
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })

    expect(screen.getAllByRole('switch')[0]).toBeChecked()
    expect(screen.getAllByRole('switch')[1]).toBeChecked()

    await userEvent.click(screen.getAllByRole('switch')[0])
    await userEvent.click(screen.getAllByRole('switch')[1])
    await waitFor(() => expect(screen.getAllByRole('switch')[0]).not.toBeChecked())
    await waitFor(() => expect(screen.getAllByRole('switch')[1]).not.toBeChecked())

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(mockUpdateUserProfileMutation).toHaveBeenCalled())
    await waitFor(() => expect(mockedWindowReload).toHaveBeenCalled())
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalled())
  })
  it('should close correctly', async () => {
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      >
        <UserNotifications profile={userProfile}/>
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenLastCalledWith(-1))
  })
  it('should close correctly for guest manager', async () => {
    (hasRoles as jest.Mock).mockReturnValueOnce(true)
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      >
        <UserNotifications profile={userProfile}/>
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() =>
      expect(mockedUsedNavigate).toHaveBeenLastCalledWith({ pathname: '/tenant-id/t' }))
  })
})
