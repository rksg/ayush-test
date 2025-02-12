import { generateBreadcrumb } from './utils'

describe('DataSubscriptions utils', () => {
  it('generateBreadcrumb', () => {
    expect(generateBreadcrumb()).toMatchObject([
      { text: 'Business Insights' },
      { link: '/dataSubscriptions', text: 'DataSubscriptions' }
    ])
  })
})