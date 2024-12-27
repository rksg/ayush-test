import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { personaApi, useSearchPersonaListQuery } from '@acx-ui/rc/services'
import {
  getServiceRoutePath,
  Persona,
  PersonaUrls,
  ServiceOperation,
  ServiceType,
  useTableQuery,
  EdgePinFixtures
} from '@acx-ui/rc/utils'
import { Provider, store }                                         from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor, within } from '@acx-ui/test-utils'
import { RequestPayload }                                          from '@acx-ui/types'

import { mockedPersonaList, replacePagination } from './__tests__/fixtures'
import { AssignedSegmentsTable }                from './AssignedSegmentsTable'

const { mockPinData } = EdgePinFixtures


const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('PersonalIdentityNetwork DetailTableGroup - AssignedSegmentsTable', () => {
  let params: { tenantId: string, serviceId: string }
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({
    type: ServiceType.PIN,
    oper: ServiceOperation.DETAIL
  })
  beforeEach(() => {
    store.dispatch(personaApi.util.resetApiState())
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        replacePagination(PersonaUrls.searchPersonaList.url),
        (_req, res, ctx) => res(ctx.json(mockedPersonaList))
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
          switchInfo={mockPinData.distributionSwitchInfos}
          tableQuery={result.current}
        />
      </Provider>, {
        route: { params, path: detailPath }
      })

    const rows = await screen.findAllByRole('row', { name: /mock-persona/i })
    expect(rows.length).toBe(2)
    const cells = await within(rows[0] as HTMLTableRowElement).findAllByRole('cell')
    expect((cells[0] as HTMLTableCellElement).textContent).toBe('3000')

  })

  it('should show tooltip on AssignedPort and could navigate to venues', async () => {

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
          switchInfo={mockPinData.distributionSwitchInfos}
          tableQuery={result.current}
          venueId='venue-id'
        />
      </Provider>, {
        route: { params, path: detailPath }
      })

    const icon = await screen.findByTestId('QuestionMarkCircleOutlined')
    expect(icon).toBeVisible()

    await userEvent.hover(icon)
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
    expect(screen.getByRole('tooltip'))
      .toHaveTextContent('To assign AP ports for a specific unit')

    const venueLink = await screen.findByRole('link', { name: 'Venue/Property Units' })
    expect(venueLink).toHaveAttribute('href',
      `/${params.tenantId}/t/venues/venue-id/venue-details/units`)
  })
})
