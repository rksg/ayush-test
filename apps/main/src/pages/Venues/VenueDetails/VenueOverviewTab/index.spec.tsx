import '@testing-library/jest-dom'
import { rest } from 'msw'

import { venueApi }                              from '@acx-ui/rc/services'
import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { generatePath }                          from '@acx-ui/react-router-dom'
import { Provider, store  }                      from '@acx-ui/store'
import { mockServer, fireEvent, render, screen } from '@acx-ui/test-utils'

import { VenueOverviewTab } from '.'

jest.mock(
  'analytics/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`analytics-${name}`} title={name} />,
  { virtual: true })

jest.mock(
  'rc/Widgets',
  () => ({ name }: { name: string }) => <div data-testid={`networks-${name}`} title={name} />,
  { virtual: true })

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const url = generatePath(CommonUrlsInfo.getVenueDetailsHeader.url, params)

const venueDetailHeaderData = {
  venue: {
    name: 'testVenue'
  }
}

describe('VenueOverviewTab', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(url, (_, res, ctx) => res(ctx.json(venueDetailHeaderData)))
    )
  })

  it('renders correctly', async () => {
    render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })

    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(7)
    expect(await screen.findAllByTestId(/^networks/)).toHaveLength(4)
  })

  it('switches between tabs', async () => {
    render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })

    const wifiWidgets = [
      'trafficByVolume',
      'networkHistory',
      'connectedClientsOverTime',
      'topApplicationsByTraffic',
      'topSSIDsByTraffic',
      'topSSIDsByClient'
    ]
    wifiWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())

    fireEvent.click(screen.getByRole('radio', { name: 'Switch' }))

    const switchWidgets = [
      'switchTrafficByVolume',
      'topSwitchesByPoeUsage',
      'topSwitchesByTraffic',
      'topSwitchesByErrors',
      'topSwitchModelsByCount'
    ]
    switchWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())
  })

  it('should switch tab correctly', async () => {
    render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })

    fireEvent.click(await screen.findByText('Switch'))
    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(6)
    expect(await screen.findAllByTestId(/^networks/)).toHaveLength(4)
  })
})
