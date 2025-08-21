import { uniqBy } from 'lodash'

import { EdgeSdLanFixtures } from '@acx-ui/rc/utils'
import { render, screen }    from '@acx-ui/test-utils'

import { VenueTemplateTable } from './VenueTemplateTable'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const venues = uniqBy(mockedMvSdLanDataList[0].tunneledWlans, 'venueId')
const data = venues.map(venue => ({
  venueId: venue.venueId,
  venueName: venue.venueName,
  customerCount: 0,
  selectedNetworks: mockedMvSdLanDataList[0].tunneledWlans?.filter(wlan =>
    wlan.venueId === venue.venueId).map(wlan => ({
    networkId: wlan.networkId,
    networkName: wlan.networkName
  })) ?? []
}))

describe('EdgeSdLanDetail - MSP - Venue Template Table', () => {
  it('should render', () => {
    render(<VenueTemplateTable data={data} />)

    expect(screen.getByRole('row', { name: 'Mocked-Venue-1 0 2' })).toBeVisible()
  })
})