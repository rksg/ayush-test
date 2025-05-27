import { render, screen }              from '@testing-library/react'
import { IntlProvider }                from 'react-intl'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import * as featureToggle from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'

import PortProfile from './index'

// Mock the necessary dependencies
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useParams: () => ({ activeTab: 'switch' }),
  useTenantLink: () => ({ pathname: '/tenant/policies/portProfile' }),
  useNavigate: () => jest.fn()
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  useIsSplitOn: jest.fn(),
  useIsTierAllowed: jest.fn(),
  Features: {
    ETHERNET_PORT_PROFILE_TOGGLE: 'ETHERNET_PORT_PROFILE_TOGGLE',
    SWITCH_CONSUMER_PORT_PROFILE_TOGGLE: 'SWITCH_CONSUMER_PORT_PROFILE_TOGGLE'
  },
  TierFeatures: {
    SERVICE_CATALOG_UPDATED: 'SERVICE_CATALOG_UPDATED'
  }
}))

// eslint-disable-next-line max-len
jest.mock('../EthernetPortProfile/EthernetPortProfileTable', () => () => <div>Ethernet Port Profile Table</div>)
jest.mock('./PortProfileTable/SwitchPortProfile', () => () => <div>Switch Port Profile</div>)

describe('PortProfile', () => {
  const renderComponent = () => {
    return render(
      <Provider>
        <IntlProvider messages={{}} locale='en'>
          <MemoryRouter initialEntries={['/policies/portProfile/switch']}>
            <Routes>
              <Route path='/policies/portProfile/:activeTab' element={<PortProfile />} />
            </Routes>
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(featureToggle.useIsSplitOn as jest.Mock).mockReturnValue(true)
  })

  it('renders the component with Switch tab active', () => {
    renderComponent()
    expect(screen.getByText('Port Profiles')).toBeInTheDocument()
    expect(screen.getByText('Switch Port Profile')).toBeInTheDocument()
  })

  it('renders the "Add ICX Port Profile" button', () => {
    renderComponent()
    expect(screen.getByText('Add ICX Port Profile')).toBeInTheDocument()
  })

  it('disables Ethernet tab when feature toggle is off', () => {
    (featureToggle.useIsSplitOn as jest.Mock).mockImplementation((feature) =>
      feature === featureToggle.Features.ETHERNET_PORT_PROFILE_TOGGLE ? false : true
    )
    renderComponent()
    const ethernetTab = screen.getByRole('tab', { name: 'Wi-Fi' })
    expect(ethernetTab).toHaveAttribute('aria-disabled', 'true')
  })

  it('disables Switch tab when feature toggle is off', () => {
    (featureToggle.useIsSplitOn as jest.Mock).mockImplementation((feature) =>
      feature === featureToggle.Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE ? false : true
    )
    renderComponent()
    const switchTab = screen.getByRole('tab', { name: 'Switch' })
    expect(switchTab).toHaveAttribute('aria-disabled', 'true')
  })
})
