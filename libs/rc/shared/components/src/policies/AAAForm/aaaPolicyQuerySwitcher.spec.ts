import { renderHook } from '@acx-ui/test-utils'

import { useLazyGetAAAPolicyInstance, useGetAAAPolicyInstanceList } from './aaaPolicyQuerySwitcher'

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

const mockedUseParams = jest.fn().mockReturnValue({})
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useParams: () => mockedUseParams()
}))

const mockedUseGetAAAPolicyViewModelListQuery = jest.fn()
const mockedUseLazyAaaPolicyQuery = jest.fn()
const mockedUseGetAAAPolicyTemplateListQuery = jest.fn()
const mockedUseLazyGetAAAPolicyTemplateQuery = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual(''),
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  useGetAAAPolicyViewModelListQuery: (...args: any[]) => mockedUseGetAAAPolicyViewModelListQuery(...args),
  useLazyAaaPolicyQuery: () => mockedUseLazyAaaPolicyQuery(),
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  useGetAAAPolicyTemplateListQuery: (...args: any[]) => mockedUseGetAAAPolicyTemplateListQuery(...args),
  useLazyGetAAAPolicyTemplateQuery: () => mockedUseLazyGetAAAPolicyTemplateQuery()
}))

describe('useGetAAAPolicyInstanceList', () => {
  beforeEach(() => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should return AAA Policy Template List result when isTemplate is true', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    renderHook(() => useGetAAAPolicyInstanceList({}))
    expect(mockedUseGetAAAPolicyTemplateListQuery).toHaveBeenCalledWith(
      { params: {}, payload: {} },
      { skip: false }
    )
  })

  it('should return AAA Policy List result when isTemplate is false', () => {
    renderHook(() => useGetAAAPolicyInstanceList({}))
    expect(mockedUseGetAAAPolicyTemplateListQuery).toHaveBeenCalledWith(
      { params: {}, payload: {} },
      { skip: true }
    )
  })

  it('should return Lazy GetAAAPolicyTemplate query function when isTemplate is true', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
    renderHook(() => useLazyGetAAAPolicyInstance())
    expect(mockedUseLazyGetAAAPolicyTemplateQuery).toHaveBeenCalled()
  })

  it('should return Lazy GetAAAPolicy query function when isTemplate is false', () => {
    renderHook(() => useLazyGetAAAPolicyInstance())
    expect(mockedUseLazyAaaPolicyQuery).toHaveBeenCalled()
  })
})
