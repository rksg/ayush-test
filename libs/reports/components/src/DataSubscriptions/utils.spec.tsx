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
    const case1 = generateBreadcrumb({ isRAI: true })
    expect(case1).toMatchObject([
      { text: 'Business Insights' },
      { link: '/dataSubscriptions', text: 'DataSubscriptions' }
    ])
    const case2 = generateBreadcrumb({})
    expect(case2).toMatchObject([
      { text: 'Network Control' },
      { link: '/services/list', text: 'My Services' },
      { link: '/services/dataSubscriptions/list', text: 'DataSubscriptions' }
    ])
    const case3 = generateBreadcrumb({ isList: true })
    expect(case3).toMatchObject([
      { text: 'Network Control' },
      { link: '/services/list', text: 'My Services' }
    ])
  })
})
describe('getUserName', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should reutrn username for RAI', () => {
    jest.mocked(get).mockReturnValue('true')
    expect(getUserName()).toEqual('RAI username')
  })
  it('should reutrn username for R1', () => {
    jest.mocked(get).mockReturnValue('')
    expect(getUserName()).toEqual('R1 username')
  })
})