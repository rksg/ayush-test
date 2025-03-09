import { rest } from 'msw'

import { PropertyUnit, PropertyUnitStatus, PropertyUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                           from '@acx-ui/store'
import { mockServer, render, waitFor, screen }                from '@acx-ui/test-utils'

import { mockPersona, mockPersonaGroup } from '../__tests__/fixtures'

import { PersonaOverview } from './PersonaOverview'

const mockPropertyUnit: PropertyUnit = {
  id: '84f5749615134e53804c3a0e4b193b56',
  name: 'MockUnit',
  status: PropertyUnitStatus.ENABLED,
  personaId: mockPersona.id
}

const getUnitFn = jest.fn()

describe('PersonaOverview', () => {
  getUnitFn.mockClear()

  beforeEach(() => {
    mockServer.use(
      rest.get(
        PropertyUrlsInfo.getUnitById.url,
        (_, res, ctx) => {
          getUnitFn()
          return res(ctx.json(mockPropertyUnit))
        }
      )
    )
  })
  it('should render overview correctly', async () => {
    render(
      <Provider>
        <PersonaOverview
          personaData={mockPersona}
          personaGroupData={mockPersonaGroup}
        />
      </Provider>,
      {
        route: {
          params: {
            tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
            personaGroupId: mockPersonaGroup.id,
            personaId: mockPersona.id
          },
          // eslint-disable-next-line max-len
          path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId/identity/:personaId'
        }
      }
    )

    expect(screen.getByRole('link', { name: mockPersonaGroup.name })).toBeInTheDocument()

    await waitFor(() => expect(getUnitFn).toBeCalled())
  })
})