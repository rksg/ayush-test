/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatGraphQLErrors, hasGraphQLErrorCode, isGraphQLAction, isGraphQLError, Meta } from './errorUtil'

describe('isGraphQLAction', () => {
  it('returns false when type is undefined', () => {
    expect(isGraphQLAction({ type: undefined })).toBe(false)
  })

  it('returns false when type does not include any reducer paths', () => {
    expect(isGraphQLAction({ type: 'other-type' })).toBe(false)
  })

  it.each(
    ['data-api', 'network-health']
  )('returns true when type includes a reducer path: %s', (path) => {
    expect(isGraphQLAction({ type: path })).toBe(true)
  })
})

describe('isGraphQLError', () => {
  it('returns false when type is undefined', () => {
    expect(isGraphQLError(undefined, {})).toBe(false)
  })

  it('returns false when type does not include any reducer paths', () => {
    expect(isGraphQLError('other-type', {})).toBe(false)
  })

  it('returns false when type includes a reducer path, but response is undefined', () => {
    expect(isGraphQLError('data-api', undefined)).toBe(false)
  })

  // eslint-disable-next-line max-len
  it('returns false when type includes a reducer path, but response does not have an errors property', () => {
    expect(isGraphQLError('data-api', {})).toBe(false)
  })

  it('returns true when type includes a reducer path and response has an errors property', () => {
    expect(isGraphQLError('data-api', { errors: [] })).toBe(true)
  })
})

describe('formatGraphQLErrors', () => {
  it('should return empty object for response with no errors', () => {
    const response: any = { errors: [] }
    const result = formatGraphQLErrors(response)
    expect(result).toEqual({ requestId: undefined, errors: [] })
  })

  it('should format single error correctly', () => {
    const response: any = {
      extensions: { requestId: '123' },
      errors: [
        {
          extensions: { code: 'ERROR_CODE' },
          message: 'Error message'
        }
      ]
    }
    const result = formatGraphQLErrors(response)
    expect(result).toEqual({
      requestId: '123',
      errors: [{ code: 'ERROR_CODE', message: 'Error message' }]
    })
  })

  it('should format multiple errors correctly', () => {
    const response: any = {
      extensions: { requestId: '123' },
      errors: [
        {
          extensions: { code: 'ERROR_CODE_1' },
          message: 'Error message 1'
        },
        {
          extensions: { code: 'ERROR_CODE_2' },
          message: 'Error message 2'
        }
      ]
    }
    const result = formatGraphQLErrors(response)
    expect(result).toEqual({
      requestId: '123',
      errors: [
        { code: 'ERROR_CODE_1', message: 'Error message 1' },
        { code: 'ERROR_CODE_2', message: 'Error message 2' }
      ]
    })
  })

  it('should handle error with no code', () => {
    const response: any = {
      extensions: { requestId: '123' },
      errors: [
        {
          message: 'Error message'
        }
      ]
    }
    const result = formatGraphQLErrors(response)
    expect(result).toEqual({
      requestId: '123',
      errors: [{ code: undefined, message: 'Error message' }]
    })
  })

  it('should handle error with no message', () => {
    const response: any = {
      extensions: { requestId: '123' },
      errors: [
        {
          extensions: { code: 'ERROR_CODE' }
        }
      ]
    }
    const result = formatGraphQLErrors(response)
    expect(result).toEqual({
      requestId: '123',
      errors: [{ code: 'ERROR_CODE', message: undefined }]
    })
  })
})

describe('hasGraphQLErrorCode', () => {
  it('should return true when error code matches', () => {
    const code = 'TEST_ERROR_CODE'
    const meta = {
      baseQueryMeta: {
        response: { errors: [ { extensions: { code: 'TEST_ERROR_CODE' } } ]
        }
      }
    }
    expect(hasGraphQLErrorCode(code, meta as Meta)).toBe(true)
  })
})
