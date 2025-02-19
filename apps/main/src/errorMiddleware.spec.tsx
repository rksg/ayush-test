import { createAsyncThunk } from '@reduxjs/toolkit'
import userEvent            from '@testing-library/user-event'
import { Modal }            from 'antd'

import { screen, act, waitFor, render } from '@acx-ui/test-utils'
import * as utils                       from '@acx-ui/utils'

import {
  ErrorAction,
  getErrorContent,
  showErrorModal,
  errorMiddleware
} from './errorMiddleware'

const { setUpIntl } = utils

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getEnabledDialogImproved: jest.fn().mockReturnValue(false),
  isShowImprovedErrorSuggestion: jest.fn().mockReturnValue(false)
}))

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
    } as unknown as ErrorAction).title).toBe('Server Error')
    expect(getErrorContent({
      meta: {},
      payload: { originalStatus: 403 }
    } as unknown as ErrorAction).title).toBe('Server Error')
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
  it('should handle 429', () => {
    expect(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 429 } } },
      payload: {}
    } as unknown as ErrorAction).title).toBe('Too Many Requests')
    expect(getErrorContent({
      meta: {},
      payload: { originalStatus: 429 }
    } as unknown as ErrorAction).title).toBe('Too Many Requests')
  })
  it('should handle 502', () => {
    expect(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 502 } } },
      payload: {}
    } as unknown as ErrorAction).title).toBe('Bad Gateway')
    expect(getErrorContent({
      meta: {},
      payload: { originalStatus: 502 }
    } as unknown as ErrorAction).title).toBe('Bad Gateway')
  })
  it('should handle 503', () => {
    expect(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 503 } } },
      payload: {}
    } as unknown as ErrorAction).title).toBe('Service Unavailable')
    expect(getErrorContent({
      meta: {},
      payload: { originalStatus: 503 }
    } as unknown as ErrorAction).title).toBe('Service Unavailable')
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
    } as unknown as ErrorAction).title).toBe('Validation Error')
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
  it('should show API error message', () => {
    const req = new Request('/foo/bar')
    req.headers.set('Build-In-Error-Modal', 'showApiError')

    expect(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 422 }, request: req } },
      payload: { data: '[Validation Error]' } // errors is string
    } as unknown as ErrorAction).content).toStrictEqual(<p>[Validation Error]</p>)

    render(getErrorContent({
      meta: { baseQueryMeta: { response: { status: 422 }, request: req } },
      payload: { data: { errors: [{ code: 'DHCP-10004', message: '[Validation Error]' }] } } // errors is CatchErrorDetails
    } as unknown as ErrorAction).content)

    expect(screen.getByText('[Validation Error]')).toBeInTheDocument()
  })
  it('should handle GraphQL errors from data-api', () => {
    const graphqlResponse = {
      data: { shouldBe: 'ignored' },
      errors: [
        {
          message: 'The provided data did not pass validation. Check your input.',
          extensions: { code: 'RDA-422' }
        },
        {
          message: 'You must be logged in to perform this action.',
          extensions: { code: 'RDA-401' }
        }
      ],
      extensions: { requestId: '184abe34b822549ef598fca3c19fcfe2' }
    }
    const errorAction = {
      type: 'analytics-data-api/executeQuery/rejected',
      meta: { baseQueryMeta: { response: graphqlResponse } },
      payload: {}
    } as unknown as ErrorAction

    const result = getErrorContent(errorAction)
    expect(result.errors).toEqual({
      requestId: '184abe34b822549ef598fca3c19fcfe2',
      errors: [
        {
          code: 'RDA-422',
          message: 'The provided data did not pass validation. Check your input.'
        },
        {
          code: 'RDA-401',
          message: 'You must be logged in to perform this action.'
        }
      ]
    })
    expect(result.title).toBe('Server Error')
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
      return rejectWithValue({ error: 'rejectWithValue!' })
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
      return rejectWithValue({ error: 'rejectWithValue!' })
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
  it('should not show modal when custom error', async () => {
    const thunk = createAsyncThunk<string>('apApi/executeQuery', (_, { rejectWithValue }) => {
      return rejectWithValue({ error: 'rejectWithValue!' })
    })
    const rejectedWithValueAction = await thunk()(jest.fn((x) => x), jest.fn(() => ({})), {})
    act(() => {
      errorMiddleware({ dispatch: jest.fn((x) => x), getState: jest.fn(() => ({})) })(jest.fn())({
        ...rejectedWithValueAction,
        meta: {
          ...rejectedWithValueAction.meta,
          arg: { endpointName: 'addAp' },
          baseQueryMeta: { response: { errors: [{ extensions: { code: 'RDA-413' } }] } }
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
        return rejectWithValue({ originalStatus: 401 })
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
      expect(await screen.findByText('Session Expired')).toBeVisible()
    })
    it('with token', async () => {
      sessionStorage.setItem('jwt', 'testToken')
      const thunk = createAsyncThunk<string>('executeQuery', (_, { rejectWithValue }) => {
        return rejectWithValue({ originalStatus: 401 })
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
      expect(await screen.findByText('Session Expired')).toBeVisible()
    })
  })
})
