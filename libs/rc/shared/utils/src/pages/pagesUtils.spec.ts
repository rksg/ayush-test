import { renderHook } from '@acx-ui/test-utils'

import { useConfigTemplatePageHeaderTitle } from './pagesUtils'

const mockedUseConfigTemplate = jest.fn()
jest.mock('../configTemplate', () => ({
  ...jest.requireActual('../configTemplate'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

describe('pagesUtils', () => {
  beforeEach(() => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
  })

  afterEach(() => {
    mockedUseConfigTemplate.mockRestore()
  })

  it('should generate PageHeader Title', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    const { result: editTitleTemplateResult } = renderHook(() => useConfigTemplatePageHeaderTitle({
      isEdit: true, instanceLabel: 'title'
    }))
    expect(editTitleTemplateResult.current).toBe('Edit title Template')

    const { result: addTitleTemplateResult } = renderHook(() => useConfigTemplatePageHeaderTitle({
      isEdit: false, instanceLabel: 'title'
    }))
    expect(addTitleTemplateResult.current).toBe('Add title Template')

    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    const { result: editTitleResult } = renderHook(() => useConfigTemplatePageHeaderTitle({
      isEdit: true, instanceLabel: 'title'
    }))
    expect(editTitleResult.current).toBe('Edit title ')

    const { result: addTitleResult } = renderHook(() => useConfigTemplatePageHeaderTitle({
      isEdit: false, instanceLabel: 'title'
    }))
    expect(addTitleResult.current).toBe('Add title ')

    const { result: addNewTitleResult } = renderHook(() => useConfigTemplatePageHeaderTitle({
      isEdit: false, instanceLabel: 'title', addLabel: 'Add New'
    }))
    expect(addNewTitleResult.current).toBe('Add New title ')
  })
})
