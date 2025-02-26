import { get } from '@acx-ui/config'

import { DataConnector }                                               from './types'
import { Actions, generateBreadcrumb, getUserName, isVisibleByAction } from './utils'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserName: jest.fn().mockReturnValue('RAI username')
}))
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  getUserName: jest.fn().mockReturnValue('R1 username')
}))
jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: jest.fn()
}))
describe('DataConnector utils', () => {
  it('generateBreadcrumb', () => {
    expect(generateBreadcrumb()).toMatchObject([
      { text: 'Business Insights' },
      { link: '/dataConnector', text: 'DataConnector' }
    ])
  })
})
describe('getUserName', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should return username for RAI', () => {
    jest.mocked(get).mockReturnValue('true')
    expect(getUserName()).toEqual('RAI username')
  })
  it('should return username for R1', () => {
    jest.mocked(get).mockReturnValue('')
    expect(getUserName()).toEqual('R1 username')
  })
})
describe('isVisibleByAction', () => {
  const baseItem = {
    id: 'connector-id',
    name: 'connector-name',
    userId: 'user-id',
    userName: 'user-name',
    columns: ['col1', 'col2'],
    status: true
  } as DataConnector
  const activeRow = baseItem
  const pausedRow = { ...baseItem, status: false }

  it('should show/hide for Resume', () => {
    expect(isVisibleByAction([pausedRow, pausedRow], Actions.Resume)).toBeTruthy()
    expect(isVisibleByAction([pausedRow, activeRow], Actions.Resume)).toBeFalsy()
  })

  it('should show/hide for Pause', () => {
    expect(isVisibleByAction([activeRow, activeRow], Actions.Pause)).toBeTruthy()
    expect(isVisibleByAction([activeRow, pausedRow], Actions.Pause)).toBeFalsy()
  })

  it('should show/hide for Edit', () => {
    expect(isVisibleByAction([activeRow], Actions.Edit)).toBeTruthy()
    expect(isVisibleByAction([activeRow, activeRow], Actions.Edit)).toBeFalsy()
  })

  it('should show for Delete', () => {
    expect(isVisibleByAction([activeRow], Actions.Delete)).toBeTruthy()
    expect(isVisibleByAction([activeRow, activeRow], Actions.Delete)).toBeTruthy()
  })

  it('should hide by default', () => {
    expect(isVisibleByAction([activeRow], 'INVALID_ACTION' as Actions)).toBeFalsy()
    expect(isVisibleByAction([activeRow, activeRow], 'INVALID_ACTION' as Actions)).toBeFalsy()
  })
})