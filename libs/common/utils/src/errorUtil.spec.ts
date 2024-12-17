/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatGraphQLErrors } from './errorUtil'

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
