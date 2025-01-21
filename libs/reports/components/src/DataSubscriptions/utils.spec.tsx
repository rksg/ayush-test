import { generateBreadcrumb } from './utils'

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