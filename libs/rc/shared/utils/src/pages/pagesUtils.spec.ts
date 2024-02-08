import { generatePageHeaderTitle } from './pagesUtils'

describe('pagesUtils', () => {
  it('should generate PageHeader Title', () => {
    expect(generatePageHeaderTitle({
      isEdit: true, isTemplate: true, instanceLabel: 'title'
    })).toBe('Edit title Template')

    expect(generatePageHeaderTitle({
      isEdit: false, isTemplate: true, instanceLabel: 'title'
    })).toBe('Add title Template')

    expect(generatePageHeaderTitle({
      isEdit: true, isTemplate: false, instanceLabel: 'title'
    })).toBe('Edit title ')

    expect(generatePageHeaderTitle({
      isEdit: false, isTemplate: false, instanceLabel: 'title'
    })).toBe('Add title ')

    expect(generatePageHeaderTitle({
      isEdit: false, isTemplate: false, instanceLabel: 'title', addLabel: 'Add New'
    })).toBe('Add New title ')
  })
})
