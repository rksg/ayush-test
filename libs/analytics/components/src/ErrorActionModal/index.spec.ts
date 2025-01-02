import { AnyAction } from '@reduxjs/toolkit'
import userEvent     from '@testing-library/user-event'

import * as components  from '@acx-ui/components'
import { screen }       from '@acx-ui/test-utils'
import {
  getIntl,
  setUpIntl,
  userLogout,
  IntlSetUpError,
  formatGraphQLErrors
} from '@acx-ui/utils'

import { showExpiredSessionModal, getErrorContent } from '.'

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

describe('getErrorContent', () => {
  it.each(['data-api', 'network-health']) (
    'should return action payload when action type includes "%s" and response has errors',
    () => {
      const action: AnyAction = {
        type: 'data-api/error',
        meta: {
          baseQueryMeta: {
            response: {
              errors: [
                {
                  message: 'Error message',
                  extensions: {
                    code: 'ERROR_CODE'
                  }
                }
              ]
            }
          }
        }
      }

      const result = getErrorContent(action)
      expect(result).toEqual(formatGraphQLErrors(action.meta.baseQueryMeta.response))
    })

  it('should return action payload when it is a string', () => {
    const action = { type: 'type', payload: 'Error message' }

    const result = getErrorContent(action)
    expect(result).toBe(action.payload)
  })

  it('should return action payload.data when it is an object with data property', () => {
    const action = { type: 'type', payload: { data: 'Error message' } }

    const result = getErrorContent(action)
    expect(result).toBe(action.payload.data)
  })

  it('should return action payload.error when it is an object with error property', () => {
    const action = { type: 'type', payload: { error: 'Error message' } }

    const result = getErrorContent(action)
    expect(result).toBe(action.payload.error)
  })

  it('should return action payload.message when it is an object with message property', () => {
    const action = { type: 'type', payload: { message: 'Error message' } }

    const result = getErrorContent(action)
    expect(result).toBe(action.payload.message)
  })

  it('should return action when none of the above conditions are met', () => {
    const action = { type: 'type', payload: {} }

    const result = getErrorContent(action)
    expect(result).toBe(action)
  })
})
