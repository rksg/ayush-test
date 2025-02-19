import { get } from '@acx-ui/config'

import { generateBreadcrumb, getUserName } from './utils'

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
describe('DataSubscriptions utils', () => {
  it('generateBreadcrumb', () => {
    expect(generateBreadcrumb()).toMatchObject([
      { text: 'Business Insights' },
      { link: '/dataSubscriptions', text: 'DataSubscriptions' }
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