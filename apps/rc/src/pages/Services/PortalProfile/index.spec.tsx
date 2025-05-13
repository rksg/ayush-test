import { fireEvent, render, screen } from '@acx-ui/test-utils'

import PortalProfile from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => ({
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  useIsSplitOn: jest.fn().mockReturnValue(true),
  Features: {
    NETWORK_SEGMENTATION_SWITCH: 'NETWORK_SEGMENTATION_SWITCH',
    EDGE_PIN_HA_TOGGLE: 'EDGE_PIN_HA_TOGGLE'
  }
}))

// Get a reference to the mocked function after it's been defined
const mockedUseSplitOn = jest.requireMock('@acx-ui/feature-toggle').useIsSplitOn

// eslint-disable-next-line max-len
jest.mock('../NetworkSegWebAuth/NetworkSegAuthTable', () => () => <div data-testid='NetworkSegAuthTable'></div>)
jest.mock('../Portal/PortalTable', () => () => <div data-testid='PortalTable'></div>)

describe('PortalProfile', () => {
  const baseParams = {
    tenantId: 'tenantId'
  }

  it('renders the component with Guest tab active', () => {
    const params = {
      ...baseParams,
      activeTab: 'list'
    }
    render(<PortalProfile />, { route: { params } })

    expect(screen.getByTestId('PortalTable')).toBeInTheDocument()
    expect(screen.getByText('Add Guest Portal')).toBeInTheDocument()
  })

  it('renders the component with PIN tab active', async () => {
    const params = {
      ...baseParams,
      activeTab: 'pin'
    }
    render(<PortalProfile />, { route: { params } })

    expect(await screen.findByText('Add PIN Portal for Switch')).toBeVisible()
    expect(screen.getByTestId('NetworkSegAuthTable')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Guest Portal' }))
    expect(mockedUsedNavigate).toHaveBeenCalled()
  })

  it('disables PIN tab when FF is off', () => {
    jest.mocked(mockedUseSplitOn).mockReturnValue(false)
    const params = {
      ...baseParams,
      activeTab: 'guest'
    }
    render(<PortalProfile />, { route: { params } })

    const pinTab = screen.getByRole('tab', { name: 'PIN Portal for Switch' })
    expect(pinTab).toHaveAttribute('aria-disabled', 'true')
  })
})
