
import { EdgeSdLanFixtures, Network, Venue } from '@acx-ui/rc/utils'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { mockSdLanScopeVenueMap }       from '../__tests__/fixtures'
import { SdLanScopedNetworkVenuesData } from '../useEdgeSdLanActions'

import { NetworkTunnelInfoButton } from '.'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures

const defaultVenueData = { activated: { isActivated: true } }
describe('NetworkTunnelInfoButton', () => {
  it('should correctly render DC case', async () => {
    const mockedDcSdlan = mockedMvSdLanDataList[1]
    const sdlanVenueId = mockedDcSdlan.tunneledWlans![0].venueId

    const targetNetworkId = mockedDcSdlan.tunneledWlans![0].networkId

    render(
      <NetworkTunnelInfoButton
        network={{ id: targetNetworkId } as Network}
        currentVenue={{ id: sdlanVenueId, ...defaultVenueData } as Venue}
        onClick={jest.fn()}
        sdLanScopedNetworkVenues={{
          sdLansVenueMap: mockSdLanScopeVenueMap
        } as SdLanScopedNetworkVenuesData}
      />
    )

    expect(screen.getByText(`Tunneled (${mockedDcSdlan.edgeClusterName})`)).toBeVisible()
  })

  it('should correctly render DMZ case', async () => {
    const mockedDmzSdlan = mockedMvSdLanDataList[0]
    const sdlanVenueId = mockedDmzSdlan.tunneledGuestWlans![0].venueId
    const targetNetworkId = mockedDmzSdlan.tunneledGuestWlans![0].networkId

    render(
      <NetworkTunnelInfoButton
        network={{ id: targetNetworkId } as Network}
        currentVenue={{ id: sdlanVenueId, ...defaultVenueData } as Venue}
        onClick={jest.fn()}
        sdLanScopedNetworkVenues={{
          sdLansVenueMap: mockSdLanScopeVenueMap
        } as SdLanScopedNetworkVenuesData}
      />
    )

    expect(screen.getByText(`Tunneled (${mockedDmzSdlan.guestEdgeClusterName})`)).toBeVisible()
  })

  it('should correctly render local breakout', async () => {

    render(
      <NetworkTunnelInfoButton
        network={{ id: 'unkown_network_id' } as Network}
        currentVenue={{ id: 'other_venue_id', ...defaultVenueData } as Venue}
        onClick={jest.fn()}
        sdLanScopedNetworkVenues={{
          sdLansVenueMap: mockSdLanScopeVenueMap
        } as SdLanScopedNetworkVenuesData}
      />
    )

    expect(screen.getByText('Local Breakout')).toBeVisible()
  })

  it('should render notthing when venue is not activated', async () => {
    const mockedDmzSdlan = mockedMvSdLanDataList[0]
    const sdlanVenueId = mockedDmzSdlan.tunneledGuestWlans![0].venueId
    const targetNetworkId = mockedDmzSdlan.tunneledGuestWlans![0].networkId

    const { container } = render(
      <NetworkTunnelInfoButton
        network={{ id: targetNetworkId } as Network}
        currentVenue={{ id: sdlanVenueId, activated: { isActivated: false } } as Venue}
        onClick={jest.fn()}
        sdLanScopedNetworkVenues={{
          sdLansVenueMap: mockSdLanScopeVenueMap
        } as SdLanScopedNetworkVenuesData}
      />
    )

    expect(container.innerHTML).toBe('')
  })
})
