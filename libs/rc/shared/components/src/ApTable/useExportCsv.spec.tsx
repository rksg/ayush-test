import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { TableQuery }              from '@acx-ui/rc/utils'
import { BrowserRouter as Router } from '@acx-ui/react-router-dom'
import { Provider }                from '@acx-ui/store'
import { renderHook }              from '@acx-ui/test-utils'
import { RequestPayload }          from '@acx-ui/types'

import { useExportCsv } from './useExportCsv'

const mockApi = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useDownloadApsCSVMutation: () => [mockApi]
}))

const mockedTableQuery = {
  payload: {
    fields: ['test1', 'test2'],
    filters: { name: ['test'] },
    searchString: 'test',
    searchTargetFields: ['name']
  } as RequestPayload,
  sorter: {
    sortField: 'name',
    sortOrder: 'ASC'
  }
} as TableQuery<unknown, RequestPayload<unknown>, unknown>

describe('ApTable - useExportCsv', () => {

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should export csv successfully', async () => {
    const { result } = renderHook(() => useExportCsv(mockedTableQuery), {
      wrapper: ({ children }) => <Provider children={<Router>{children}</Router>} />
    })

    await result.current.exportCsv()

    expect(mockApi).toBeCalledWith({
      params: { tenantId: undefined },
      payload: {
        fields: mockedTableQuery.payload.fields,
        filters: mockedTableQuery.payload.filters,
        searchString: mockedTableQuery.payload.searchString,
        searchTargetFields: mockedTableQuery.payload.searchTargetFields,
        sortField: mockedTableQuery.sorter.sortField,
        sortOrder: mockedTableQuery.sorter.sortOrder
      },
      enableRbac: undefined
    })
  })

  it('should export csv successfully(RBAC)', async () => {
    jest.mocked(useIsSplitOn)
      .mockImplementation(ff => ff === Features.WIFI_RBAC_API)
    const { result } = renderHook(() => useExportCsv(mockedTableQuery), {
      wrapper: ({ children }) => <Provider children={<Router>{children}</Router>} />
    })

    await result.current.exportCsv()

    expect(mockApi).toBeCalledWith({
      params: { tenantId: undefined },
      payload: {
        fields: mockedTableQuery.payload.fields,
        filters: mockedTableQuery.payload.filters,
        searchString: mockedTableQuery.payload.searchString,
        searchTargetFields: mockedTableQuery.payload.searchTargetFields,
        sortField: mockedTableQuery.sorter.sortField,
        sortOrder: mockedTableQuery.sorter.sortOrder,
        page: 1,
        pageSize: 10000
      },
      enableRbac: true
    })
  })
})