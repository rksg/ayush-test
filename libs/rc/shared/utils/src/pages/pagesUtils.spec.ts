import { generatePageHeaderTitle } from './pagesUtils'

describe('pagesUtils', () => {
  it('should generate PageHeader Title', () => {
    expect(generatePageHeaderTitle(true, true, 'title')).toBe('Edit title Template')
    expect(generatePageHeaderTitle(false, true, 'title')).toBe('Add title Template')
    expect(generatePageHeaderTitle(true, false, 'title')).toBe('Edit title ')
    expect(generatePageHeaderTitle(false, false, 'title')).toBe('Add title ')
  })
})
