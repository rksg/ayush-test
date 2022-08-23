import { rest } from 'msw'

import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { VenuesTable } from '.'

const list = {
  totalCount: 10,
  page: 1,
  data: [{
    city: 'New York',
    country: 'United States',
    description: 'My-Venue',
    id: '2c16284692364ab6a01f4c60f5941836',
    latitude: '40.769141',
    longitude: '-73.9429713',
    name: 'My-Venue',
    status: '1_InSetupPhase',
    aggregatedApStatus: { '1_01_NeverContactedCloud': 1 }
  }, {
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
    clients: 1
  }]
}

describe('Venues Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <VenuesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/venues' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Add Venue')
    await screen.findByText('My-Venue')
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
})