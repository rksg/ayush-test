import React from 'react'

import { render, screen } from '@testing-library/react'
import { Form }           from 'antd'
import { IntlProvider }   from 'react-intl'

import { WlanSecurityEnum } from '@acx-ui/rc/utils'

import NetworkFormContext from '../NetworkFormContext'

import { WorkflowForm } from './WorkflowForm'

// Mock the child components
jest.mock('../NetworkDiagram/NetworkDiagram', () => ({
  NetworkDiagram: () => <div data-testid='network-diagram'>Network Diagram</div>
}))

jest.mock('../NetworkMoreSettings/NetworkMoreSettingsForm', () => ({
  NetworkMoreSettingsForm: () => <div data-testid='network-more-settings'>More Settings</div>
}))

jest.mock('./SharedComponent/WlanSecurity/WlanSecuritySettings', () => ({
  WlanSecurityFormItems: () => <div data-testid='wlan-security'>WLAN Security</div>
}))

jest.mock('./SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox', () => ({
  BypassCaptiveNetworkAssistantCheckbox: () => <div data-testid='bypass-cna'>Bypass CNA</div>
}))

jest.mock('./SharedComponent/WalledGarden/WalledGardenTextArea', () => ({
  WalledGardenTextArea: () => <div data-testid='walled-garden'>Walled Garden</div>
}))

const mockContextValue = {
  data: {
    wlan: {
      wlanSecurity: WlanSecurityEnum.WPA2Personal
    }
  },
  editMode: false,
  isRuckusAiMode: false,
  cloneMode: false
}

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <IntlProvider messages={{}} locale='en'>
      <NetworkFormContext.Provider value={mockContextValue}>
        <Form>
          {ui}
        </Form>
      </NetworkFormContext.Provider>
    </IntlProvider>
  )
}

describe('WorkflowForm', () => {
  it('renders the basic form structure', () => {
    renderWithProviders(<WorkflowForm />)

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByTestId('saml-idp-profile-select')).toBeInTheDocument()
    expect(screen.getByTestId('wlan-security')).toBeInTheDocument()
    expect(screen.getByTestId('bypass-cna')).toBeInTheDocument()
    expect(screen.getByTestId('walled-garden')).toBeInTheDocument()
    expect(screen.getByTestId('network-diagram')).toBeInTheDocument()
  })

  it('renders NetworkMoreSettingsForm when not in edit mode and not in Ruckus AI mode', () => {
    renderWithProviders(<WorkflowForm />)
    expect(screen.getByTestId('network-more-settings')).toBeInTheDocument()
  })

  it('does not render NetworkMoreSettingsForm in edit mode', () => {
    const editModeContext = {
      ...mockContextValue,
      editMode: true
    }

    render(
      <IntlProvider messages={{}} locale='en'>
        <NetworkFormContext.Provider value={editModeContext}>
          <Form>
            <WorkflowForm />
          </Form>
        </NetworkFormContext.Provider>
      </IntlProvider>
    )

    expect(screen.queryByTestId('network-more-settings')).not.toBeInTheDocument()
  })

  it('does not render NetworkMoreSettingsForm in Ruckus AI mode', () => {
    const ruckusAiModeContext = {
      ...mockContextValue,
      isRuckusAiMode: true
    }

    render(
      <IntlProvider messages={{}} locale='en'>
        <NetworkFormContext.Provider value={ruckusAiModeContext}>
          <Form>
            <WorkflowForm />
          </Form>
        </NetworkFormContext.Provider>
      </IntlProvider>
    )

    expect(screen.queryByTestId('network-more-settings')).not.toBeInTheDocument()
  })

  it('renders NetworkDiagram with correct props', () => {
    renderWithProviders(<WorkflowForm />)
    const networkDiagram = screen.getByTestId('network-diagram')
    expect(networkDiagram).toBeInTheDocument()
  })
})