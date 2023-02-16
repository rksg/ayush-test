import userEvent from '@testing-library/user-event'

import { UserProfileContext, UserProfileContextProps } from '@acx-ui/rc/components'
import { UserProfile }                                 from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { render, screen }                              from '@acx-ui/test-utils'

import UserButton from './UserButton'

const params = { tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1' }
const userProfile = {
  initials: 'FL',
  email: 'dog12@email.com',
  username: 'dog12@email.com'
} as UserProfile

describe('UserButton', () => {
  it('should render button with no text', async () => {
    render(<Provider>
      <UserProfileContext.Provider value={{ data: undefined } as UserProfileContextProps}>
        <UserButton />
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })
    expect(screen.getByRole('button')).toHaveTextContent('')
  })

  it('should render button with initials', async () => {
    render(<Provider>
      <UserProfileContext.Provider value={{ data: userProfile } as UserProfileContextProps}>
        <UserButton />
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })
    expect(screen.getByRole('button')).toHaveTextContent('FL')
  })

  it('should handle change password', async () => {
    render(<Provider>
      <UserProfileContext.Provider value={{ data: userProfile } as UserProfileContextProps}>
        <UserButton />
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Change Password' }))
    expect(window.open)
      .toBeCalledWith('https://supportqa.ruckuswireless.com/edit_my_profile', '_blank')
  })

  it('should handle change password for big dog', async () => {
    const isRwbigdogUserProfile = { ...userProfile, email: 'test@rwbigdog.com' }
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: isRwbigdogUserProfile } as UserProfileContextProps}
      >
        <UserButton />
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Change Password' }))
    expect(window.open)
      .toBeCalledWith('https://partners.ruckuswireless.com/forgot-password', '_blank')
  })

  it('should handle logout', async () => {
    const { location } = window
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: { href: '' }
    })

    const isRwbigdogUserProfile = { ...userProfile, email: 'test@rwbigdog.com' }
    render(<Provider>
      <UserProfileContext.Provider
        value={{ data: isRwbigdogUserProfile } as UserProfileContextProps}
      >
        <UserButton />
      </UserProfileContext.Provider>
    </Provider>, { route: { params } })
    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Log out' }))
    expect(window.location.href).toEqual('/logout')

    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: location
    })
  })
})
