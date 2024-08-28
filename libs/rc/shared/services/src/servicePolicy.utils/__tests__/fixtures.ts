import { BaseQueryApi } from '@reduxjs/toolkit/query'

export const mockQueryApi: BaseQueryApi = {
  dispatch: jest.fn(),
  getState: jest.fn(),
  abort: jest.fn(),
  extra: {},
  signal: new AbortController().signal,
  endpoint: '',
  type: 'query'
}
