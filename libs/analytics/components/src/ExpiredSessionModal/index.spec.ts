import userEvent from '@testing-library/user-event'

import  * as components from '@acx-ui/components'
import { screen }       from '@acx-ui/test-utils'
import {
  getIntl,
  setUpIntl,
  userLogout,
  IntlSetUpError
} from '@acx-ui/utils'

import { showExpiredSessionModal } from '.'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getIntl: jest.fn().mockImplementation(() => jest.requireActual('@acx-ui/utils').getIntl()),
  setUpIntl: jest.fn(),
  userLogout: jest.fn()
}))

describe('ExpiredSessionModal', () => {
  it('throws on unexpected errors', async () => {
    const mockedGetIntl = jest.mocked(getIntl)
    mockedGetIntl.mockImplementationOnce(() => { throw new Error() })
    expect(() => showExpiredSessionModal()).toThrow()
  })

  it('handles getIntl not initialized', async () => {
    const mockedGetIntl = jest.mocked(getIntl)
    mockedGetIntl.mockImplementationOnce(() => { throw new IntlSetUpError() })
    const mockedSetUpIntl = jest.mocked(setUpIntl)
    showExpiredSessionModal()
    expect(await screen.findByText('Session Expired')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(mockedSetUpIntl).toHaveBeenCalledWith({ locale: 'en-US' })
  })

  it('should only show action modal once', async () => {
    const showActionModalSpy = jest.spyOn(components, 'showActionModal')
    showExpiredSessionModal()
    showExpiredSessionModal()
    showExpiredSessionModal()
    expect(showActionModalSpy).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Session Expired')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    showActionModalSpy.mockRestore()
  })

  it('user logout', async () => {
    const mockUserLogout = jest.mocked(userLogout)
    const { location } = window
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: { hostname: 'not.localhost' }
    })
    showExpiredSessionModal()
    expect(await screen.findByText('Session Expired')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(mockUserLogout).toHaveBeenCalled()
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: location
    })
  })
})
