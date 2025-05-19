import { get }                                                               from '@acx-ui/config'
import { RolesEnum }                                                         from '@acx-ui/types'
import { getUserProfile, RaiPermissions, setRaiPermissions, setUserProfile } from '@acx-ui/user'

import { DataConnector }                                                                    from './types'
import { Actions, connectorNameRegExp, generateBreadcrumb, getUserName, isVisibleByAction } from './utils'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserName: jest.fn().mockReturnValue('RAI username')
}))
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  getUserName: jest.fn().mockReturnValue('R1 username')
}))
const mockGet = get as jest.Mock
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
  const userId = 'user-id'
  const baseItem = {
    id: 'connector-id',
    name: 'connector-name',
    userId,
    userName: 'user-name',
    columns: ['col1', 'col2'],
    status: true
  } as DataConnector
  const activeRow = baseItem
  const pausedRow = { ...baseItem, status: false }

  beforeEach(() => {
    mockGet.mockReturnValue(false)
  })

  it('should show/hide for Resume', () => {
    expect(isVisibleByAction([pausedRow, pausedRow], Actions.Resume, userId)).toBeTruthy()
    expect(isVisibleByAction([pausedRow, activeRow], Actions.Resume, userId)).toBeFalsy()
  })

  it('should show/hide for Pause', () => {
    expect(isVisibleByAction([activeRow, activeRow], Actions.Pause, userId)).toBeTruthy()
    expect(isVisibleByAction([activeRow, pausedRow], Actions.Pause, userId)).toBeFalsy()
  })

  it('should show/hide for Edit', () => {
    expect(isVisibleByAction([activeRow], Actions.Edit, userId)).toBeTruthy()
    expect(isVisibleByAction([activeRow, activeRow], Actions.Edit, userId)).toBeFalsy()
  })

  it('should hide by default', () => {
    expect(isVisibleByAction([activeRow], 'INVALID_ACTION' as Actions, userId)).toBeFalsy()
    expect(isVisibleByAction(
      [activeRow, activeRow], 'INVALID_ACTION' as Actions, userId)).toBeFalsy()
  })

  describe('R1 - Delete', () => {
    beforeEach(() => {
      mockGet.mockReturnValue(false)
    })
    it('should not show for Delete', () => {
      const userProfile = getUserProfile()
      setUserProfile({
        ...userProfile,
        profile: {
          ...userProfile.profile,
          roles: [RolesEnum.ADMINISTRATOR]
        }
      })
      expect(isVisibleByAction([activeRow], Actions.Delete, userId)).toBeFalsy()
      expect(isVisibleByAction([activeRow, activeRow], Actions.Delete, userId)).toBeFalsy()
    })
    it('R1 - should show for Delete', () => {
      const userProfile = getUserProfile()
      setUserProfile({
        ...userProfile,
        profile: {
          ...userProfile.profile,
          roles: [RolesEnum.PRIME_ADMIN]
        }
      })
      expect(isVisibleByAction([activeRow], Actions.Delete, 'otherUserId')).toBeTruthy()
      expect(isVisibleByAction([activeRow, activeRow], Actions.Delete, 'otherUserId')).toBeTruthy()
    })
  })

  describe('RAI - Delete', () => {
    beforeEach(() => {
      mockGet.mockReturnValue('true')
    })
    it('should not show for Delete', () => {
      setRaiPermissions({
        DELETE_DATA_CONNECTOR: false
      } as RaiPermissions)
      expect(isVisibleByAction([activeRow], Actions.Delete, userId)).toBeFalsy()
      expect(isVisibleByAction([activeRow, activeRow], Actions.Delete, userId)).toBeFalsy()
    })

    it('RAI - should show for Delete', () => {
      setRaiPermissions({
        DELETE_DATA_CONNECTOR: true
      } as RaiPermissions)
      expect(isVisibleByAction([activeRow], Actions.Delete, 'otherUserId')).toBeTruthy()
      expect(isVisibleByAction([activeRow, activeRow], Actions.Delete, 'otherUserId')).toBeTruthy()
    })
  })

})

describe('connectorNameRegExp', () => {
  it('should resolve with no error when the input is valid', async () => {
    const validInput = 'valid _-name'
    await expect(connectorNameRegExp(validInput)).resolves.toBeUndefined()
    const validMaxLength = 'a'.repeat(128)
    await expect(connectorNameRegExp(validMaxLength)).resolves.toBeUndefined()
    const validMinLength = 'a'.repeat(1)
    await expect(connectorNameRegExp(validMinLength)).resolves.toBeUndefined()
  })

  it('should reject with an error for invalid inputs', async () => {
    const errMsg = 'Please enter a valid name (alphanumeric, spaces, _ and -) ' +
      'with max length of 128.'
    const invalidChar = 'invalid.name'
    await expect(connectorNameRegExp(invalidChar)).rejects.toEqual(errMsg)
    const invalidLength = 'a'.repeat(129)
    await expect(connectorNameRegExp(invalidLength)).rejects.toEqual(errMsg)
    const emptyInput = ''
    await expect(connectorNameRegExp(emptyInput)).rejects.toEqual(errMsg)
  })
})