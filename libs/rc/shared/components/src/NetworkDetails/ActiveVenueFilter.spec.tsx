import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { render, screen, fireEvent, mockServer } from '@acx-ui/test-utils'

import { ActiveVenueFilter } from './ActiveVenueFilter'

jest.mock('./services', () => ({
  useGetNetwork: jest.fn().mockImplementation(() => ({
    data: {
      venues: [
        { venueId: 'venue1' },
        { venueId: 'venue2' },
        { venueId: 'venue4' }
      ]
    }
  }))
}))

describe('ActiveVenueFilter', () => {
  const route = {
    params: { tenantId: 't1', networkId: 'n1' },
    path: '/:tenantId/networks/wireless/networkId/network-details/overview'
  }
  beforeEach(() => {
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
  it('renders only active venues and calls setSelectedVenues on user selection', async () => {
    const setSelectedVenues = jest.fn()
    render(<Provider>
      <ActiveVenueFilter selectedVenues={[]} setSelectedVenues={setSelectedVenues} />
    </Provider>, { route })
    await screen.findByText('All Active Venues')
    await userEvent.click(await screen.findByRole('combobox'))
    fireEvent.click(await screen.findByText('venue A'))
    fireEvent.click(await screen.findByText('venue B'))
    expect(screen.queryByText('venue C')).toBeNull()
    expect(screen.getByText('venue D')).not.toBeNull()
    fireEvent.click(await screen.findByText('Apply'))
    expect(setSelectedVenues).toHaveBeenCalledWith(['venue1', 'venue2'])
  })
})
