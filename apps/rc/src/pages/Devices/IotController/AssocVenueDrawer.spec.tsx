import '@testing-library/jest-dom'
import { rest } from 'msw'

import { venueApi }        from '@acx-ui/rc/services'
import { CommonUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import { AssocVenueDrawer, AssocVenueDrawerProps } from './AssocVenueDrawer'

export const venuelist = {
  totalCount: 2,
  page: 1,
  data: [
    {
      city: 'New York',
      country: 'United States',
      description: 'My-Venue',
      id: '2c16284692364ab6a01f4c60f5941836',
      latitude: '40.769141',
      longitude: '-73.9429713',
      name: 'My-Venue',
      status: '1_InSetupPhase',
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 }
    },
    {
      city: 'Sunnyvale, California',
      country: 'United States',
      description: '',
      id: 'a919812d11124e6c91b56b9d71eacc31',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      name: 'test',
      status: '1_InSetupPhase',
      switchClients: 2,
      switches: 1,
      edges: 3,
      clients: 1
    }
  ]
}


const mockProps = {
  visible: true,
  setVisible: jest.fn(),
  usedVenueIds: []
} as unknown as AssocVenueDrawerProps

describe('AssocVenueDrawer', () => {
  beforeEach(async () => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(venuelist))
      )
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', async () => {
    render(
      <Provider>
        <AssocVenueDrawer {...mockProps} />
      </Provider>
    )
    expect(screen.getByText('Associated Venues')).toBeVisible()
  })

  it('closes drawer when cancel button is clicked', async () => {
    render(
      <Provider>
        <AssocVenueDrawer {...mockProps} />
      </Provider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(mockProps.setVisible).toHaveBeenCalledTimes(1)
  })

})
