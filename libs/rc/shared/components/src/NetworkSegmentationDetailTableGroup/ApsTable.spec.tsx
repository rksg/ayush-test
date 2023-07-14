import { useApListQuery }                                                from '@acx-ui/rc/services'
import { APExtended, CommonUrlsInfo, useTableQuery }                     from '@acx-ui/rc/utils'
import { Provider }                                                      from '@acx-ui/store'
import { mockRestApiQuery, render, screen, renderHook, waitFor, within } from '@acx-ui/test-utils'
import { RequestPayload }                                                from '@acx-ui/types'


import { mockedApList }               from './__tests__/fixtures'
import { ApsTable, defaultApPayload } from './ApsTable'

describe('NetworkSegmentationDetailTableGroup - ApsTable', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }
    mockRestApiQuery(CommonUrlsInfo.getApsList.url, 'post', mockedApList)
  })

  it('Should be AP data in the page', async () => {

    const { result } = renderHook(
      () => useTableQuery<APExtended, RequestPayload<unknown>, unknown>({
        useQuery: useApListQuery,
        defaultPayload: {
          ...defaultApPayload
        }
      }),{ wrapper: ({ children }) => <Provider>{children}</Provider>, route: { params } }
    )

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())
    render(
      <Provider>
        <ApsTable tableQuery={result.current} />
      </Provider>
    )

    const rows = await screen.findAllByRole('row', { name: /mock-ap/i })
    expect(rows.length).toBe(2)
    const cells = await within(rows[0] as HTMLTableRowElement).findAllByRole('cell')
    expect((cells[3] as HTMLTableCellElement).innerHTML).toBe('3')

  })
})