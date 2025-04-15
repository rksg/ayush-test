import { showSdLanCaptivePortalConflictModal } from './showSdLanCaptivePortalConflictModal'

const mockShowActionModal = jest.fn()
jest.mock('@acx-ui/components', () => ({
  showActionModal: jest.fn().mockImplementation(({ onOk, onCancel, ...rest }) => {
    mockShowActionModal(rest)
    onOk()
  })
}))

const mockOk = jest.fn()
const currentNetworkVenueId = 'venue-id-1'
const currentNetworkId = 'network-id-1'
const currentNetworkName = 'Network 1'
const tunnelProfileId = 'tunnel-profile-id-1'
const tunneledWlans = [{
  venueId: 'venue-id-2',
  venueName: 'Venue 2',
  networkId: currentNetworkId,
  networkName: currentNetworkName,
  wlanId: '1',
  forwardingTunnelProfileId: ''
},
{
  venueId: 'venue-id-3',
  venueName: 'Venue 3',
  networkId: 'network-id-2',
  networkName: 'Network 2',
  wlanId: '2',
  forwardingTunnelProfileId: ''
}]

describe('showSdLanCaptivePortalConflictModal', () => {
  beforeEach(() => {
    mockShowActionModal.mockClear()
    mockOk.mockClear()
  })

  it('test has conflict', () => {
    showSdLanCaptivePortalConflictModal({
      currentNetworkVenueId,
      currentNetworkId,
      currentNetworkName,
      tunnelProfileId,
      tunneledWlans,
      onOk: mockOk
    })

    expect(mockShowActionModal).toBeCalledTimes(1)
    expect(mockOk).toBeCalledWith([tunneledWlans[0].venueId])
  })

  it('test has no conflict', () => {
    showSdLanCaptivePortalConflictModal({
      currentNetworkVenueId,
      currentNetworkId,
      currentNetworkName,
      tunnelProfileId,
      tunneledWlans: tunneledWlans.slice(1,2),
      onOk: mockOk
    })
    expect(mockOk).toBeCalledTimes(1)
    expect(mockShowActionModal).not.toBeCalled()
  })
})