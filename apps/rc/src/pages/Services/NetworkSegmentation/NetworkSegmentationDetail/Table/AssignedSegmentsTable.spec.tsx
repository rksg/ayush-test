import { rest } from 'msw'

import { useSearchPersonaListQuery }                               from '@acx-ui/rc/services'
import { Persona, PersonaUrls, RequestPayload, useTableQuery }     from '@acx-ui/rc/utils'
import { Provider }                                                from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor, within } from '@acx-ui/test-utils'

import { mockPersonaList, replacePagination } from '../../__tests__/fixtures'

import { AssignedSegmentsTable } from './AssignedSegmentsTable'


describe('NSG Detail - AssignedSegments Table Page', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        replacePagination(PersonaUrls.searchPersonaList.url),
        (req, res, ctx) => res(ctx.json(mockPersonaList))
      )
    )

    // mockRestApiQuery(PersonaUrls.searchPersonaList.url, 'post', mockPersonaList)
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
        <AssignedSegmentsTable tableQuery={result.current} />
      </Provider>
    )

    const rows = await screen.findAllByRole('row', { name: /mock-persona/i })
    expect(rows.length).toBe(2)
    const cells = await within(rows[0] as HTMLTableRowElement).findAllByRole('cell')
    expect((cells[0] as HTMLTableCellElement).innerHTML).toBe('3000')

  })
})
