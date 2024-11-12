import { renderHook }     from '@acx-ui/test-utils'
import { UseQueryResult } from '@acx-ui/types'

import { CONFIG_TEMPLATE_LIST_PATH } from './configTemplateRouteUtils'
import {
  generateConfigTemplateBreadcrumb,
  hasConfigTemplateAccess,
  useConfigTemplateLazyQueryFnSwitcher,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher
} from './configTemplateUtils'

const mockedUseConfigTemplate = jest.fn()
jest.mock('./useConfigTemplate', () => ({
  ...jest.requireActual('./useConfigTemplate'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

const mockedParams = { tenantId: 'exampleTenantId', venueId: 'exampleVenueId' }
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useParams: () => mockedParams
}))

describe('config-template-utils', () => {
  it('should generate correct breadcrumb for config template', () => {
    const breadcrumb = generateConfigTemplateBreadcrumb()
    expect(breadcrumb).toEqual([
      {
        text: 'Configuration Templates',
        link: CONFIG_TEMPLATE_LIST_PATH,
        tenantType: 'v'
      }
    ])
  })

  it('should return correct access for config template', () => {
    expect(hasConfigTemplateAccess(true, 'MSP')).toBe(true)
    expect(hasConfigTemplateAccess(false, 'MSP')).toBe(false)
    expect(hasConfigTemplateAccess(true, 'MSP_NON_VAR')).toBe(true)
    expect(hasConfigTemplateAccess(false, 'MSP_NON_VAR')).toBe(false)
    expect(hasConfigTemplateAccess(true, 'MSP_REC')).toBe(false)
    expect(hasConfigTemplateAccess(true, 'MSP_INTEGRATOR')).toBe(false)
  })

  describe('useConfigTemplateQueryFnSwitcher', () => {
    type QueryResultType = string
    const generalQueryResult: UseQueryResult<QueryResultType> = {
      isUninitialized: false,
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      refetch: jest.fn()
    }
    const mockedRegularQueryFn = jest.fn()
    const mockedTemplateQueryFn = jest.fn()

    beforeEach(() => {
      // eslint-disable-next-line max-len
      mockedRegularQueryFn.mockImplementation(() => ({ ...generalQueryResult, data: 'regular data' }))
      // eslint-disable-next-line max-len
      mockedTemplateQueryFn.mockImplementation(() => ({ ...generalQueryResult, data: 'template data' }))
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.restoreAllMocks()
    })

    it('should return template query result when isTemplate is true', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      const { result } = renderHook(() => useConfigTemplateQueryFnSwitcher<QueryResultType>({
        useQueryFn: mockedRegularQueryFn,
        useTemplateQueryFn: mockedTemplateQueryFn
      }))

      expect(result.current).toEqual(expect.objectContaining({ data: 'template data' }))
      expect(mockedTemplateQueryFn).toHaveBeenCalledWith({ params: mockedParams }, { skip: false })
      expect(mockedRegularQueryFn).toHaveBeenCalledWith({ params: mockedParams }, { skip: true })
    })

    it('should return regular query result when isTemplate is false', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

      const { result } = renderHook(() => useConfigTemplateQueryFnSwitcher<QueryResultType>({
        useQueryFn: mockedRegularQueryFn,
        useTemplateQueryFn: mockedTemplateQueryFn
      }))

      expect(result.current).toEqual(expect.objectContaining({ data: 'regular data' }))
      expect(mockedTemplateQueryFn).toHaveBeenCalledWith({ params: mockedParams }, { skip: true })
      expect(mockedRegularQueryFn).toHaveBeenCalledWith({ params: mockedParams }, { skip: false })
    })

    it('should return correct query result when the payload and extraParams are present', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      const { result } = renderHook(() => useConfigTemplateQueryFnSwitcher<QueryResultType>({
        useQueryFn: mockedRegularQueryFn,
        useTemplateQueryFn: mockedTemplateQueryFn,
        skip: false,
        payload: { fakePayload: '123' },
        extraParams: { venueId: 'overrideVenueId' }
      }))

      const customRequestPayload = {
        params: { ...mockedParams, venueId: 'overrideVenueId' },
        payload: { fakePayload: '123' }
      }

      expect(result.current).toEqual(expect.objectContaining({ data: 'template data' }))
      expect(mockedTemplateQueryFn).toHaveBeenCalledWith(customRequestPayload, { skip: false })
      expect(mockedRegularQueryFn).toHaveBeenCalledWith(customRequestPayload, { skip: true })
    })
  })

  describe('useConfigTemplateLazyQueryFnSwitcher', () => {
    const mockedRegularLazyQueryFn = jest.fn()
    const mockedTemplateLazyQueryFn = jest.fn()

    beforeEach(() => {
      mockedRegularLazyQueryFn.mockImplementation(() => 'regular')
      mockedTemplateLazyQueryFn.mockImplementation(() => 'template')
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.restoreAllMocks()
    })

    it('should return template lazy query result when isTemplate is true', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      const { result } = renderHook(() => useConfigTemplateLazyQueryFnSwitcher<string>({
        useLazyQueryFn: mockedRegularLazyQueryFn,
        useLazyTemplateQueryFn: mockedTemplateLazyQueryFn
      }))

      expect(result.current).toEqual('template')
      expect(mockedTemplateLazyQueryFn).toHaveBeenCalled()
      expect(mockedRegularLazyQueryFn).toHaveBeenCalled()
    })

    it('should return regular lazy query result when isTemplate is false', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

      const { result } = renderHook(() => useConfigTemplateLazyQueryFnSwitcher<string>({
        useLazyQueryFn: mockedRegularLazyQueryFn,
        useLazyTemplateQueryFn: mockedTemplateLazyQueryFn
      }))

      expect(result.current).toEqual('regular')
      expect(mockedTemplateLazyQueryFn).toHaveBeenCalledWith()
      expect(mockedRegularLazyQueryFn).toHaveBeenCalledWith()
    })
  })

  describe('useConfigTemplateMutationFnSwitcher', () => {
    it('should return template mutation result when isTemplate is true', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
      const mutationFn = jest.fn().mockReturnValue('regular')
      const templateMutationFn = jest.fn().mockReturnValue('template')

      const { result } = renderHook(() => useConfigTemplateMutationFnSwitcher({
        useMutationFn: mutationFn,
        useTemplateMutationFn: templateMutationFn
      }))

      expect(result.current).toEqual('template')
      expect(mutationFn).toHaveBeenCalled()
      expect(templateMutationFn).toHaveBeenCalled()
    })

    it('should return regular mutation result when isTemplate is false', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
      const mutationFn = jest.fn().mockReturnValue('regular')
      const templateMutationFn = jest.fn().mockReturnValue('template')

      const { result } = renderHook(() => useConfigTemplateMutationFnSwitcher({
        useMutationFn: mutationFn,
        useTemplateMutationFn: templateMutationFn
      }))

      expect(result.current).toEqual('regular')
      expect(mutationFn).toHaveBeenCalled()
      expect(templateMutationFn).toHaveBeenCalled()
    })
  })
})
