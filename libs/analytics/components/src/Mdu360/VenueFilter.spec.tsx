import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { venueApi }                              from '@acx-ui/rc/services'
import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider, store }                       from '@acx-ui/store'
import { render, screen, fireEvent, mockServer } from '@acx-ui/test-utils'

import { VenueFilter } from './VenueFilter'

describe('VenueFilter', () => {
  const route = {
    params: { tenantId: 't1', networkId: 'n1' },
    path: '/:tenantId/v/mdu360/residentExperience'
  }
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json({ data: [
          { name: 'venue A', id: 'venue1' },
          { name: 'venue B', id: 'venue2' },
          { name: 'venue C', id: 'venue3' },
          { name: 'venue D', id: 'venue4' }
        ] }))
      )
    )
    jest.clearAllMocks()
  })
  it('should render all venues and calls setSelectedVenues on user selection', async () => {
    const setSelectedVenues = jest.fn()
    render(<Provider>
      <VenueFilter selectedVenues={[]} setSelectedVenues={setSelectedVenues} />
    </Provider>, { route })
    await screen.findByText('All Venues')
    await userEvent.click(await screen.findByRole('combobox'))
    fireEvent.click(await screen.findByText('venue A'))
    fireEvent.click(await screen.findByText('venue B'))
    expect(screen.getByText('venue C')).not.toBeNull()
    expect(screen.getByText('venue D')).not.toBeNull()
    fireEvent.click(await screen.findByText('Apply'))
    expect(setSelectedVenues).toHaveBeenCalledWith(['venue1', 'venue2'])
  })

  it('should render selected venue', async () => {
    const setSelectedVenues = jest.fn()
    render(<Provider>
      <VenueFilter selectedVenues={['venue1']} setSelectedVenues={setSelectedVenues} />
    </Provider>, { route })
    await screen.findAllByTitle('venue A')
  })
})
