import { rest } from 'msw'

import { DirectoryServerUrls, PersonaUrls, PropertyUnit, PropertyUnitStatus, PropertyUrlsInfo, SamlIdpProfileUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                                                 from '@acx-ui/store'
import { mockServer, render, waitFor, screen }                                                                      from '@acx-ui/test-utils'

import { mockExternalIdentityList, mockPersona, mockPersonaGroup } from '../__tests__/fixtures'

import { PersonaOverview } from './PersonaOverview'

const mockPropertyUnit: PropertyUnit = {
  id: '84f5749615134e53804c3a0e4b193b56',
  name: 'MockUnit',
  status: PropertyUnitStatus.ENABLED,
  personaId: mockPersona.id
}
const personaIds = { content: [
  {
    unitId: 'c59f537f-2257-4fa6-934b-69f787e686fb', personaType: 'LINKED',
    personaId: '05fd5780-28cc-48ca-b119-103992bad806', links: []
  },
  {
    unitId: '8d72d387-ba1f-4955-91fe-1a1e94512cf1', personaType: 'LINKED',
    personaId: '175099a5-5f85-4edd-b4e0-c34c14f77234', links: []
  },
  {
    unitId: '7b3a00dc-fcb0-47a3-a0f3-2e62e2f12703', personaType: 'LINKED',
    personaId: '6b18d46e-1d5b-45d0-81ab-4cfe9aa1793a', links: []
  }
] }
const getPropertyIdentities = jest.fn()

const getUnitFn = jest.fn()
const searchClientQueryFn = jest.fn()

describe('PersonaOverview', () => {
  getUnitFn.mockClear()
  searchClientQueryFn.mockClear()

  beforeEach(() => {
    mockServer.use(
      rest.get(
        PropertyUrlsInfo.getUnitById.url,
        (_, res, ctx) => {
          getUnitFn()
          return res(ctx.json(mockPropertyUnit))
        }
      ),
      rest.post(PropertyUrlsInfo.getUnitsLinkedIdentities.url,
        (req, res, ctx) => {
          getPropertyIdentities()
          return res(ctx.json(personaIds))
        }),
      rest.post(
        PersonaUrls.searchIdentityClients.url.split('?')[0],
        (_, res, ctx) => {
          searchClientQueryFn()
          return res(ctx.json({}))
        }
      ),
      rest.post(
        PersonaUrls.searchExternalIdentities.url.split('?')[0],
        (_, res, ctx) => {
          return res(ctx.json(mockExternalIdentityList))
        }
      ),
      rest.get(
        SamlIdpProfileUrls.getSamlIdpProfile.url,
        (_, res, ctx) => {
          return res(ctx.json({
            id: 'id'
          }))
        }
      ),
      rest.get(
        DirectoryServerUrls.getDirectoryServer.url,
        (_, res, ctx) => {
          return res(ctx.json({
            id: 'id'
          }))
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
    await waitFor(() => expect(searchClientQueryFn).toBeCalled())

    expect(screen.getByText('Associated Devices')).toBeInTheDocument()
  })
})