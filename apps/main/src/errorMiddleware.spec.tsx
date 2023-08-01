import { createAsyncThunk }     from '@reduxjs/toolkit'
import { screen, act, waitFor } from '@testing-library/react'
import userEvent                from '@testing-library/user-event'
import { Modal }                from 'antd'

import * as utils from '@acx-ui/utils'

import {
  ErrorAction,
  getErrorContent,
  showErrorModal,
  errorMiddleware
} from './errorMiddleware'

const { setUpIntl } = utils

describe('getErrorContent', () => {
  const { location } = window
  const mockReload = jest.fn()
  beforeEach(() => Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: { reload: mockReload }
  }))
  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true, enumerable: true, value: location
    })
    mockReload.mockReset()
  })
  it('should handle 400', () => {
    expect(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 400 } } },
      payload: {}
    } as unknown as ErrorAction).title).toBe('Bad Request')
    expect(getErrorContent({
      meta: {},
      payload: { originalStatus: 400, data: { error: 'API-KEY not present' } }
    } as unknown as ErrorAction).title).toBe('Bad Request')
  })
  it('should handle 401', () => {
    expect(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 401 } } },
      payload: {}
    } as unknown as ErrorAction).title).toBe('Session Expired')
    expect(getErrorContent({
      meta: {},
      payload: { originalStatus: 401 }
    } as unknown as ErrorAction).title).toBe('Session Expired')
  })
  it('should handle 403', () => {
    expect(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 403 } } },
      payload: {}
    } as unknown as ErrorAction).title).toBe('Session Expired')
    expect(getErrorContent({
      meta: {},
      payload: { originalStatus: 403 }
    } as unknown as ErrorAction).title).toBe('Session Expired')
  })
  it('should handle 408', () => {
    expect(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 408 } } },
      payload: {}
    } as unknown as ErrorAction).title).toBe('Operation Failed')
    expect(getErrorContent({
      meta: {},
      payload: { originalStatus: 408 }
    } as unknown as ErrorAction).title).toBe('Operation Failed')
  })
  it('should handle 423', () => {
    expect(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 423 } } },
      payload: {}
    } as unknown as ErrorAction).title).toBe('Request in Progress')
    expect(getErrorContent({
      meta: {},
      payload: { originalStatus: 423 }
    } as unknown as ErrorAction).title).toBe('Request in Progress')
  })
  it('should handle 504', () => {
    expect(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 504 } } },
      payload: {}
    } as unknown as ErrorAction).title).toBe('Check Your Connection')
    const errorDetails = getErrorContent({
      meta: {},
      payload: { originalStatus: 504 }
    } as unknown as ErrorAction)
    expect(errorDetails.title).toBe('Check Your Connection')
    errorDetails.callback!()
    expect(mockReload).toBeCalledTimes(1)
  })
  it('should handle 0', () => {
    expect(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 0 } } },
      payload: {}
    } as unknown as ErrorAction).title).toBe('Check Your Connection')
    const errorDetails = getErrorContent({
      meta: {},
      payload: { originalStatus: 0 }
    } as unknown as ErrorAction)
    expect(errorDetails.title).toBe('Check Your Connection')
    errorDetails.callback!()
    expect(mockReload).toBeCalledTimes(1)
  })
  it('should handle 422', () => {
    expect(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 422 } } },
      payload: {}
    } as unknown as ErrorAction).title).toBe('Server Error')
    expect(getErrorContent({
      meta: {},
      payload: { originalStatus: 422, data: { error: { errors: [{ code: 'WIFI-10114' }] } } }
    } as unknown as ErrorAction).title).toBe('Error')
  })
  it('should handle other codes', () => {
    expect(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 999 } } },
      payload: {}
    } as unknown as ErrorAction).title).toBe('Server Error')
    expect(getErrorContent({
      meta: {},
      payload: { originalStatus: 999 }
    } as unknown as ErrorAction).title).toBe('Server Error')
  })
  it('should not throw error if intl is not initialized', () => {
    setUpIntl()
    expect(() => getErrorContent({
      meta: { baseQueryMeta: { response: { status: 400 } } },
      payload: {}
    } as unknown as ErrorAction)).not.toThrow()
    setUpIntl({ locale: 'en-US', messages: {} })
  })
  it('should throw if error is not because of intl initialization', () => {
    jest.spyOn(utils, 'getIntl').mockImplementationOnce(() => { throw Error('some error') })
    expect(() => getErrorContent({
      meta: { baseQueryMeta: { response: { status: 400 } } },
      payload: {}
    } as unknown as ErrorAction)).toThrow('some error')
  })
})

describe('showErrorModal', () => {
  beforeEach(async () => {
    // reset isModalShown
    const btn = screen.queryByText('OK')
    btn && await userEvent.click(btn)
    Modal.destroyAll()
  })
  it('should show modal', async () => {
    const firstCallBack = jest.fn()
    const secondCallBack = jest.fn()
    act(() => { showErrorModal({ ...getErrorContent({
      meta: { baseQueryMeta: { response: { status: 400 } } },
      payload: {}
    } as unknown as ErrorAction), callback: firstCallBack }) })
    await screen.findByText('Bad Request')

    act(() => { showErrorModal({ ...getErrorContent({
      meta: { baseQueryMeta: { response: { status: 401 } } },
      payload: {}
    } as unknown as ErrorAction), callback: secondCallBack }) })
    await screen.findByText('Bad Request') // only show one of it

    await userEvent.click(await screen.findByText('OK'))
    expect(firstCallBack).toBeCalled()
    expect(secondCallBack).not.toBeCalled()
  })
})

describe('errorMiddleware', () => {
  beforeEach(async () => {
    // reset isModalShown
    const btn = screen.queryByText('OK')
    btn && await userEvent.click(btn)
    Modal.destroyAll()
  })
  it('should show modal', async () => {
    const thunk = createAsyncThunk<string>('executeQuery', (_, { rejectWithValue }) => {
      return rejectWithValue('rejectWithValue!')
    })
    const rejectedWithValueAction = await thunk()(jest.fn((x) => x), jest.fn(() => ({})), {})
    act(() => {
      errorMiddleware({ dispatch: jest.fn((x) => x), getState: jest.fn(() => ({})) })(jest.fn())({
        ...rejectedWithValueAction,
        meta: {
          ...rejectedWithValueAction.meta,
          arg: { endpointName: 'any' }
        }
      })
    })
    expect(await screen.findByText('Server Error')).toBeVisible()
  })
  it('should not show modal when ignore', async () => {
    const thunk = createAsyncThunk<string>('apApi/executeQuery', (_, { rejectWithValue }) => {
      return rejectWithValue('rejectWithValue!')
    })
    const rejectedWithValueAction = await thunk()(jest.fn((x) => x), jest.fn(() => ({})), {})
    act(() => {
      errorMiddleware({ dispatch: jest.fn((x) => x), getState: jest.fn(() => ({})) })(jest.fn())({
        ...rejectedWithValueAction,
        meta: {
          ...rejectedWithValueAction.meta,
          arg: { endpointName: 'addAp' }
        }
      })
    })
    await waitFor(()=>{
      expect(screen.queryByText('Server Error')).toBeNull()
    })
  })
  it('should call next', async () => {
    const next = jest.fn()
    act(() => { errorMiddleware({ dispatch: Object({}), getState: jest.fn() })(next)({}) })
    expect(next).toBeCalled()
  })
  describe('should logout', () => {
    const { location } = window
    beforeEach(() => Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: { href: new URL('https://url/').href }
    }))
    afterEach(() => Object.defineProperty(window, 'location', {
      configurable: true, enumerable: true, value: location }))
    it('no token', async () => {
      const thunk = createAsyncThunk<string>('executeQuery', (_, { rejectWithValue }) => {
        return rejectWithValue({ originalStatus: 403 })
      })
      const rejectedWithValueAction = await thunk()(jest.fn((x) => x), jest.fn(() => ({})), {})
      act(() => {
        errorMiddleware({ dispatch: jest.fn((x) => x), getState: jest.fn(() => ({})) })(jest.fn())({
          ...rejectedWithValueAction,
          meta: {
            ...rejectedWithValueAction.meta,
            arg: { endpointName: 'any' }
          }
        })
      })
      expect(window.location.href).toBe('/logout')
    })
    it('with token', async () => {
      sessionStorage.setItem('jwt', 'testToken')
      const token = sessionStorage.getItem('jwt')
      const thunk = createAsyncThunk<string>('executeQuery', (_, { rejectWithValue }) => {
        return rejectWithValue({ originalStatus: 403 })
      })
      const rejectedWithValueAction = await thunk()(jest.fn((x) => x), jest.fn(() => ({})), {})
      act(() => {
        errorMiddleware({ dispatch: jest.fn((x) => x), getState: jest.fn(() => ({})) })(jest.fn())({
          ...rejectedWithValueAction,
          meta: {
            ...rejectedWithValueAction.meta,
            arg: { endpointName: 'any' }
          }
        })
      })
      expect(window.location.href).toEqual(`/logout?token=${token}`)
    })
  })
})
