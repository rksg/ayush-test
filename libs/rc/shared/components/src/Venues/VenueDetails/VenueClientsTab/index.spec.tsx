import '@testing-library/jest-dom'

import { waitFor } from '@testing-library/react'
import { rest }    from 'msw'

import { useIsTierAllowed }              from '@acx-ui/feature-toggle'
import { PersonaUrls, PropertyUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                      from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { VenueClientsTab } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid={'some-report-id'} id='acx-report' />
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  ClientDualTable: () => <div data-testid={'ClientDualTable'} />,
  SwitchClientsTable: () => <div data-testid={'SwitchClientsTable'} />
}))

jest.mock('apps/rc/src/pages/Users/Persona/PersonaTable/BasePersonaTable', () => ({
  ...jest.requireActual('apps/rc/src/pages/Users/Persona/PersonaTable/BasePersonaTable'),
  BasePersonaTable: () => <div data-testid={'personaTable'} />
}))


describe('VenueClientsTab', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        PropertyUrlsInfo.getPropertyConfigsQuery.url,
        (_, res, ctx) => res(ctx.json({ content: [{ personaGroupId: 'group-id' }] }))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (_, res, ctx) => res(ctx.json({ id: 'group-id', nsgId: 'nsg-id' }))
      )
    )
  })
  it('should render correctly', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true) // Features.CLOUDPATH_BETA

    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7'
    }
    render(<Provider><VenueClientsTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/clients/wifi' }
    })
    const wifiTab = await screen.findByRole('tab', { name: 'Wireless' })
    expect(wifiTab.getAttribute('aria-selected')).toBeTruthy()

    const switchTab = await screen.findByRole('tab', { name: 'Wired' })
    fireEvent.click(switchTab)

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues/${params.venueId}/venue-details/clients/switch`,
      hash: '',
      search: ''
    })

    const personaTab = await screen.findByRole('tab', { name: /Identity/i })
    await waitFor(() => expect(personaTab).toHaveAttribute('aria-selected', 'false'))
    fireEvent.click(personaTab)

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/venues/${params.venueId}/venue-details/clients/identity`,
      hash: '',
      search: ''
    })
  })

  it('should render correct tab when beta flag is off', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(false)
    const params = {
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      venueId: '7482d2efe90f48d0a898c96d42d2d0e7'
    }
    render(<Provider><VenueClientsTab /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/clients/wifi' }
    })
    expect(screen.queryByRole('tab', { name: /Identity/i })).toBeNull()
  })
})
