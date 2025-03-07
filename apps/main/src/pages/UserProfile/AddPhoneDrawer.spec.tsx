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

import AddPhoneDrawer from './AddPhoneDrawer'

const params = { tenantId: 'tenant-id' }
const mockedSetVisible = jest.fn()

const userProfile = {
  initials: 'FL',
  fullName: 'First Last',
  role: RolesEnum.ADMINISTRATOR,
  email: 'dog12@email.com',
  dateFormat: 'yyyy/mm/dd',
  detailLevel: 'su',
  preferredLanguage: 'en-US'
} as UserProfileInterface

const mockUpdateUserProfileMutation = jest.fn().mockImplementation(() => Promise.resolve())
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUpdateUserProfileMutation: () => ([mockUpdateUserProfileMutation]),
  hasRoles: jest.fn()
}))

describe('UserNotifications', () => {
  beforeEach(() => {
    (hasRoles as jest.Mock).mockReturnValue(false)
    jest.clearAllMocks()
  })
  it('should render correctly', async () => {
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      >
        <AddPhoneDrawer visible={true} setVisible={jest.fn()} />
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })

    expect(screen.getByText('Add Phone Number')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.getByRole('textbox')).toBeVisible()
  })
  it('should render edit correctly', async () => {
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      >
        <AddPhoneDrawer
          profile={{ ...userProfile, phoneNumber: '1234567' }}
          visible={true}
          setVisible={jest.fn()} />
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })

    expect(screen.getByText('Edit Phone Number')).toBeVisible()
    expect(screen.getByDisplayValue('1234567')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should save correctly', async () => {
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      >
        <AddPhoneDrawer visible={true} setVisible={mockedSetVisible} />
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })

    expect(screen.getByText('Add Phone Number')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await userEvent.type(screen.getByRole('textbox'), '5555555')

    await waitFor(() => expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(mockUpdateUserProfileMutation).toHaveBeenCalled())
    expect(mockedSetVisible).toHaveBeenCalledWith(false)
  })
  it('should cancel correctly', async () => {
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      >
        <AddPhoneDrawer visible={true} setVisible={mockedSetVisible} />
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })

    expect(screen.getByText('Add Phone Number')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedSetVisible).toHaveBeenCalledWith(false)
  })
  it('should close correctly', async () => {
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: userProfile } as UserProfileContextProps}
      >
        <AddPhoneDrawer visible={true} setVisible={mockedSetVisible} />
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })

    expect(screen.getByText('Add Phone Number')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(mockedSetVisible).toHaveBeenCalledWith(false)
  })
})
