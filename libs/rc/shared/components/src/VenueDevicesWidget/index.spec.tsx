import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider  }          from '@acx-ui/store'
import { render,
  screen, mockRestApiQuery,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { VenueDevicesWidget } from '.'

const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id'
}

describe('Venue Overview Devices Widget', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getVenueDetailsHeader.url, 'get',{})
  })

  it('should render loader and then chart', async () => {
    const { asFragment } = render(<Provider><VenueDevicesWidget /></Provider>,
      { route: { params } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Devices')
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
