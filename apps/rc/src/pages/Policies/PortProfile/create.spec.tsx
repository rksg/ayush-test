import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { IntlProvider }              from 'react-intl'
import { MemoryRouter }              from 'react-router-dom'

import * as featureToggle from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'

import CreatePortProfile from './create'

// Mock the necessary dependencies
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => jest.fn(),
  useTenantLink: () => jest.fn((path) => path)
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  useIsSplitOn: jest.fn(),
  Features: {
    ETHERNET_PORT_PROFILE_TOGGLE: 'ETHERNET_PORT_PROFILE_TOGGLE',
    SWITCH_CONSUMER_PORT_PROFILE_TOGGLE: 'SWITCH_CONSUMER_PORT_PROFILE_TOGGLE'
  }
}))

describe('CreatePortProfile', () => {
  const mockedUseTenantLink = jest.fn()

  const renderComponent = () => {
    return render(
      <Provider>
        <IntlProvider messages={{}} locale='en'>
          <MemoryRouter>
            <CreatePortProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(featureToggle.useIsSplitOn as jest.Mock).mockReturnValue(true)
  })

  it('renders the component with correct title', () => {
    renderComponent()
    expect(screen.getByText('Add Port Profile')).toBeInTheDocument()
  })

  it('renders breadcrumb correctly', () => {
    renderComponent()
    expect(screen.getByText('Network Control')).toBeInTheDocument()
    expect(screen.getByText('Policies & Profiles')).toBeInTheDocument()
    expect(screen.getByText('Port Profiles')).toBeInTheDocument()
  })

  it('renders radio buttons for Wi-Fi and Switch options', () => {
    renderComponent()
    expect(screen.getByLabelText('Wi-Fi')).toBeInTheDocument()
    expect(screen.getByLabelText('Switch')).toBeInTheDocument()
  })

  it('disables Switch option when feature toggle is off', () => {
    (featureToggle.useIsSplitOn as jest.Mock).mockImplementation((feature) =>
      feature === featureToggle.Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE ? false : true
    )
    renderComponent()
    expect(screen.getByLabelText('Switch')).toBeDisabled()
  })

  it('disables Wi-Fi option when feature toggle is off', () => {
    (featureToggle.useIsSplitOn as jest.Mock).mockImplementation((feature) =>
      feature === featureToggle.Features.ETHERNET_PORT_PROFILE_TOGGLE ? false : true
    )
    renderComponent()
    expect(screen.getByLabelText('Wi-Fi')).toBeDisabled()
  })
  it('should navigate to Ethernet Port Profile creation page when Wi-Fi is selected', async () => {
    render(
      <Provider>
        <IntlProvider messages={{}} locale='en'>
          <MemoryRouter>
            <CreatePortProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    )

    const wifiRadio = screen.getByLabelText('Wi-Fi')
    fireEvent.click(wifiRadio)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)
  })

  it('should navigate to Switch Port Profile creation page when Switch is selected', async () => {
    render(
      <Provider>
        <IntlProvider messages={{}} locale='en'>
          <MemoryRouter>
            <CreatePortProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    )

    const switchRadio = screen.getByLabelText('Switch')
    fireEvent.click(switchRadio)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)
  })

  it('should disable Wi-Fi option when ETHERNET_PORT_PROFILE_TOGGLE is off', () => {
    jest.mocked(featureToggle.useIsSplitOn).mockImplementation((feature) =>
      feature === featureToggle.Features.ETHERNET_PORT_PROFILE_TOGGLE ? false : true
    )

    render(
      <Provider>
        <IntlProvider messages={{}} locale='en'>
          <MemoryRouter>
            <CreatePortProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    )

    const wifiRadio = screen.getByLabelText('Wi-Fi')
    expect(wifiRadio).toBeDisabled()
  })

  it('should disable Switch option when SWITCH_CONSUMER_PORT_PROFILE_TOGGLE is off', () => {
    jest.mocked(featureToggle.useIsSplitOn).mockImplementation((feature) =>
      feature === featureToggle.Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE ? false : true
    )

    render(
      <Provider>
        <IntlProvider messages={{}} locale='en'>
          <MemoryRouter>
            <CreatePortProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    )

    const switchRadio = screen.getByLabelText('Switch')
    expect(switchRadio).toBeDisabled()
  })

  it('should navigate to policies page when Cancel button is clicked', () => {
    const mockPoliciesPageLink = '/mock/policies/page/link'
    mockedUseTenantLink.mockReturnValue(mockPoliciesPageLink)

    render(
      <Provider>
        <IntlProvider messages={{}} locale='en'>
          <MemoryRouter>
            <CreatePortProfile />
          </MemoryRouter>
        </IntlProvider>
      </Provider>
    )

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelButton)
  })
})
