
import { EdgeSdLanFixtures, NetworkTypeEnum, EdgePinFixtures } from '@acx-ui/rc/utils'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { NetworkTunnelInfoLabel } from './NetworkTunnelInfoLabel'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures

const tenantId = 'mock-tenant'
describe('NetworkTunnelInfoLabel', () => {
  it('should correctly render SDLAN case', async () => {
    const mockedDcSdlan = mockedMvSdLanDataList[1]
    const sdlanVenueId = mockedDcSdlan.tunneledWlans![0].venueId

    const targetNetworkId = mockedDcSdlan.tunneledWlans![0].networkId

    render(
      <NetworkTunnelInfoLabel
        network={{
          id: targetNetworkId,
          type: NetworkTypeEnum.CAPTIVEPORTAL,
          venueId: sdlanVenueId
        }}
        isVenueActivated={true}
        venueSdLan={mockedDcSdlan}
      />, { route: { path: '/:tenantId/t/', params: { tenantId } } }
    )

    const btn = screen.getByText(/SD-LAN /)
    expect(btn).toBeVisible()
    const link = screen.getByRole('link', { name: mockedDcSdlan.name })
    // eslint-disable-next-line max-len
    expect(link).toHaveAttribute('href', `/${tenantId}/t/services/edgeSdLan/${mockedDcSdlan.id}/detail`)

  })

  it('should correctly render SoftGre case', async () => {
    const venueSoftGre = {
      venueId: 'mock-venue',
      networkIds: ['mock-network-id'],
      profileId: '0d89c0f5596c4689900fb7f5f53a0859',
      profileName: 'softGreProfileName1'
    }

    render(
      <NetworkTunnelInfoLabel
        network={{
          id: venueSoftGre.networkIds[0],
          type: NetworkTypeEnum.DPSK,
          venueId: venueSoftGre.venueId
        }}
        isVenueActivated={true}
        venueSoftGre={venueSoftGre}
      />, { route: { path: '/:tenantId/t/', params: { tenantId } } }
    )

    const btn = screen.getByText(/SoftGRE /)
    expect(btn).toBeVisible()
    const link = screen.getByRole('link', { name: venueSoftGre.profileName })
    // eslint-disable-next-line max-len
    expect(link).toHaveAttribute('href', `/${tenantId}/t/policies/softGre/${venueSoftGre.profileId}/detail`)
  })

  it('should correctly render PIN case', async () => {
    const venuePin = EdgePinFixtures.mockPinStatsList.data[0]

    render(
      <NetworkTunnelInfoLabel
        network={{
          id: venuePin.tunneledWlans[0].networkId,
          type: NetworkTypeEnum.DPSK,
          venueId: venuePin.venueId
        }}
        isVenueActivated={true}
        venuePin={venuePin}
      />, { route: { path: '/:tenantId/t/', params: { tenantId } } }
    )

    const btn = screen.getByText(/PIN /)
    expect(btn).toBeVisible()
    const link = screen.getByRole('link', { name: venuePin.name })
    // eslint-disable-next-line max-len
    expect(link).toHaveAttribute('href', `/${tenantId}/t/services/personalIdentityNetwork/${venuePin.id}/detail`)
  })

  it('should correctly render local breakout', async () => {
    const { container } = render(
      <NetworkTunnelInfoLabel
        network={{
          id: 'unkown_network_id',
          type: NetworkTypeEnum.DPSK,
          venueId: 'other_venue_id'
        }}
        isVenueActivated={true}
      />
    )

    expect(container.innerHTML).toBe('')
  })

  it('should correctly render when network is not activated on venue', async () => {
    const { container } = render(
      <NetworkTunnelInfoLabel
        network={{
          id: 'unkown_network_id',
          type: NetworkTypeEnum.DPSK,
          venueId: 'other_venue_id'
        }}
        isVenueActivated={false}
      />
    )

    expect(container.innerHTML).toBe('')
  })

  // eslint-disable-next-line max-len
  it('should correctly render SoftGre when venue is associated with a SDLAN but WLAN is NOT associated with SDLAN', async () => {
    const mockedDcSdlan = mockedMvSdLanDataList[1]
    const sdlanVenueId = mockedDcSdlan.tunneledWlans![0].venueId

    const venueSoftGre = {
      venueId: sdlanVenueId,
      networkIds: ['mock-network-id'],
      profileId: '0d89c0f5596c4689900fb7f5f53a0859',
      profileName: 'softGreProfileName1'
    }

    render(
      <NetworkTunnelInfoLabel
        network={{
          id: venueSoftGre.networkIds[0],
          type: NetworkTypeEnum.DPSK,
          venueId: venueSoftGre.venueId
        }}
        isVenueActivated={true}
        venueSdLan={mockedDcSdlan}
        venueSoftGre={venueSoftGre}
      />, { route: { path: '/:tenantId/t/', params: { tenantId } } }
    )

    const btn = screen.getByText(/SoftGRE /)
    expect(btn).toBeVisible()
    const link = screen.getByRole('link', { name: venueSoftGre.profileName })
    // eslint-disable-next-line max-len
    expect(link).toHaveAttribute('href', `/${tenantId}/t/policies/softGre/${venueSoftGre.profileId}/detail`)
  })
})
