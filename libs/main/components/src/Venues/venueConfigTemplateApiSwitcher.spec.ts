import { renderHook }     from '@acx-ui/test-utils'
import { UseQueryResult } from '@acx-ui/types'

import { useVenueConfigTemplateQueryFnSwitcher } from './venueConfigTemplateApiSwitcher'

const mockedUseConfigTemplate = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

const mockedParams = { tenantId: 'exampleTenantId', venueId: 'exampleVenueId' }
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useParams: () => mockedParams
}))

type QueryResultType = string
const generalQueryResult: UseQueryResult<QueryResultType> = {
  isUninitialized: false,
  isLoading: false,
  isFetching: false,
  isSuccess: true,
  isError: false,
  refetch: jest.fn()
}

describe('useVenueConfigTemplateQueryFnSwitcher', () => {
  const mockedRegularQueryFn = jest.fn()
  const mockedTemplateQueryFn = jest.fn()

  beforeEach(() => {
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

    const { result } = renderHook(() => useVenueConfigTemplateQueryFnSwitcher<QueryResultType>(
      mockedRegularQueryFn,
      mockedTemplateQueryFn
    ))

    expect(result.current).toEqual(expect.objectContaining({ data: 'template data' }))
    expect(mockedTemplateQueryFn).toHaveBeenCalledWith({ params: mockedParams }, { skip: false })
    expect(mockedRegularQueryFn).toHaveBeenCalledWith({ params: mockedParams }, { skip: true })
  })

  it('should return regular query result when isTemplate is false', () => {
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

    const { result } = renderHook(() => useVenueConfigTemplateQueryFnSwitcher<QueryResultType>(
      mockedRegularQueryFn,
      mockedTemplateQueryFn
    ))

    expect(result.current).toEqual(expect.objectContaining({ data: 'regular data' }))
    expect(mockedTemplateQueryFn).toHaveBeenCalledWith({ params: mockedParams }, { skip: true })
    expect(mockedRegularQueryFn).toHaveBeenCalledWith({ params: mockedParams }, { skip: false })
  })
})
