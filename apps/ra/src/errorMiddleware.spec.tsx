/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from '@reduxjs/toolkit'

import { showErrorModal, showExpiredSessionModal } from '@acx-ui/analytics/components'
import { errorMessage }                            from '@acx-ui/utils'

import { errorMiddleware } from './errorMiddleware'

jest.mock('@acx-ui/analytics/components', () => ({
  showErrorModal: jest.fn(),
  showExpiredSessionModal: jest.fn()
}))

describe('errorMiddleware', () => {
  const next = jest.fn((action) => action) as any
  const errorMiddlewareInstance = errorMiddleware({ dispatch: Object({}), getState: jest.fn() })

  let rejectedWithValueAction = { meta: {} }
  beforeEach(async () => {
    const thunk = createAsyncThunk<string>('executeQuery',
      (_, { rejectWithValue }) => rejectWithValue({}))
    rejectedWithValueAction = await thunk()(jest.fn((x) => x), jest.fn(() => ({})), {})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it.each([
    [500, errorMessage.SERVER_ERROR]
  ])('should call showErrorModal with correct error message and error content for status code %i',
    (statusCode, expectedErrorMessage) => {
      const action = {
        meta: {
          ...rejectedWithValueAction.meta,
          baseQueryMeta: { response: { status: statusCode } }
        }
      } as any
      errorMiddlewareInstance(next)(action)
      expect(showErrorModal).toHaveBeenCalledTimes(1)
      expect(showErrorModal).toHaveBeenCalledWith(expectedErrorMessage, action)
    })

  it.each([
    [429, errorMessage.TOO_MANY_REQUESTS],
    [502, errorMessage.BAD_GATEWAY],
    [503, errorMessage.SERVICE_UNAVAILABLE],
    [504, errorMessage.GATEWAY_TIMEOUT]
  ])('should call showErrorModal only with correct error message for status code %i',
    (statusCode, expectedErrorMessage) => {
      const action = {
        meta: {
          ...rejectedWithValueAction.meta,
          baseQueryMeta: { response: { status: statusCode } }
        }
      } as any
      errorMiddlewareInstance(next)(action)
      expect(showErrorModal).toHaveBeenCalledTimes(1)
      expect(showErrorModal).toHaveBeenCalledWith(expectedErrorMessage)
    })

  it.each([
    400, 403, 408, 422, 423
  ])('should not call showErrorModal for status code %i', (statusCode) => {
    const action = {
      meta: {
        ...rejectedWithValueAction.meta,
        baseQueryMeta: { response: { status: statusCode } }
      }
    } as any
    errorMiddlewareInstance(next)(action)
    expect(showErrorModal).toHaveBeenCalledTimes(0)
  })

  it('should call showErrorModal for GraphQL error', () => {
    const action = {
      type: 'data-api',
      meta: {
        ...rejectedWithValueAction.meta,
        baseQueryMeta: { response: { status: 200 } }
      }
    } as any
    errorMiddlewareInstance(next)(action)
    expect(showErrorModal).toHaveBeenCalledTimes(1)
  })

  it('should call not showErrorModal for "too many events" custom error', () => {
    const action = {
      meta: { baseQueryMeta: { response: { errors: [{ extensions: { code: 'RDA-413' } }] } } }
    } as any
    errorMiddlewareInstance(next)(action)
    expect(showErrorModal).toHaveBeenCalledTimes(0)
  })

  it('should call showExpiredSessionModal for status code 401', () => {
    const action = { meta: { baseQueryMeta: { response: { status: 401 } } } } as any
    errorMiddlewareInstance(next)(action)
    expect(showExpiredSessionModal).toHaveBeenCalledTimes(1)
  })

  it('should return next action for non-error cases', () => {
    const action = { type: 'NON_ERROR_ACTION' } as any
    const result = errorMiddlewareInstance(next)(action)
    expect(result).toBe(action)
  })

  it('should return next action for error cases with no status code', () => {
    const action = { error: true } as any
    const result = errorMiddlewareInstance(next)(action)
    expect(result).toBe(action)
  })
})
