import { rest } from 'msw'

import { useSearchPersonaListQuery }                                                                               from '@acx-ui/rc/services'
import { getServiceRoutePath, Persona, PersonaUrls, RequestPayload, ServiceOperation, ServiceType, useTableQuery } from '@acx-ui/rc/utils'
import { Provider }                                                                                                from '@acx-ui/store'
import { mockServer,  render,  renderHook, screen, waitFor, within }                                               from '@acx-ui/test-utils'


import { mockedNsgData, mockedPersonaList, replacePagination } from './__tests__/fixtures'
import { AssignedSegmentsTable }                               from './AssignedSegmentsTable'


describe('NetworkSegmentationDetailTableGroup - AssignedSegmentsTable', () => {
  let params: { tenantId: string, serviceId: string }
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({
    type: ServiceType.NETWORK_SEGMENTATION,
    oper: ServiceOperation.DETAIL
  })
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        replacePagination(PersonaUrls.searchPersonaList.url),
        (req, res, ctx) => res(ctx.json(mockedPersonaList))
      )
    )
  })

  it('Should be AssignedSegments data in the page', async () => {

    const { result } = renderHook(
      () => useTableQuery<Persona, RequestPayload<unknown>, unknown>({
        useQuery: useSearchPersonaListQuery,
        defaultPayload: {}
      }),{ wrapper: ({ children }) => <Provider>{children}</Provider>, route: { params } }
    )

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())
    render(
      <Provider>
        <AssignedSegmentsTable
          switchInfo={mockedNsgData.distributionSwitchInfos}
          tableQuery={result.current}
        />
      </Provider>, {
        route: { params, path: detailPath }
      })

    const rows = await screen.findAllByRole('row', { name: /mock-persona/i })
    expect(rows.length).toBe(2)
    const cells = await within(rows[0] as HTMLTableRowElement).findAllByRole('cell')
    expect((cells[0] as HTMLTableCellElement).innerHTML).toBe('3000')

  })
})
