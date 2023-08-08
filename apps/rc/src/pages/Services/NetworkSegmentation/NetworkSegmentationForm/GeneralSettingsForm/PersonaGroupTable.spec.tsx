
import { rest } from 'msw'

import { useGetDpskQuery, useGetPersonaGroupByIdQuery }            from '@acx-ui/rc/services'
import { DpskUrls, PersonaUrls }                                   from '@acx-ui/rc/utils'
import { Provider }                                                from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor, within } from '@acx-ui/test-utils'

import { mockDpsk, mockPersonaGroup } from '../../__tests__/fixtures'

import { PersonaGroupTable } from './PersonaGroupTable'

describe('NSG GeneralSettings Form - Persona Table Page', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      )
    )

    mockServer.use(
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockDpsk))
      )
    )
  })

  it('Should be Persona data in the page', async () => {

    const { result } = renderHook(
      () => useGetPersonaGroupByIdQuery(
        { params: { groupId: mockPersonaGroup.id } }
      ),{ wrapper: ({ children }) => <Provider>{children}</Provider>, route: { params } }
    )

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
    render(
      <Provider>
        <PersonaGroupTable personaGroupId={mockPersonaGroup.id} />
      </Provider>, {
        route: { params }
      }
    )

    const rows = await screen.findAllByRole('row')
    const cells = await within(rows[1] as HTMLTableRowElement).findAllByRole('cell')
    expect((cells[0] as HTMLTableCellElement).innerHTML).toMatch(mockPersonaGroup.name)
    expect((cells[1] as HTMLTableCellElement).innerHTML)
      .toBe(String(mockPersonaGroup.personas.length))

  })

  it.skip('Should be DPSK data in the page', async () => {

    renderHook(
      () => useGetPersonaGroupByIdQuery(
        { params: { groupId: mockPersonaGroup.id } }
      ),{ wrapper: ({ children }) => <Provider>{children}</Provider>, route: { params } }
    )

    const { result } = renderHook(
      () => useGetDpskQuery(
        { params: { serviceId: mockDpsk.id } }
      ),{ wrapper: ({ children }) => <Provider>{children}</Provider>, route: { params } }
    )

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
    render(
      <Provider>
        <PersonaGroupTable personaGroupId={mockPersonaGroup.id} />
      </Provider>, {
        route: { params }
      }
    )

    const rows = await screen.findAllByRole('row')
    const cells = await within(rows[1] as HTMLTableRowElement).findAllByRole('cell')
    expect((cells[2] as HTMLTableCellElement).innerHTML).toMatch(mockDpsk.name)
    expect((cells[3] as HTMLTableCellElement).innerHTML)
      .toBe(String(mockDpsk.networkIds.length))
  })
})
