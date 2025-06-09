import React from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent                              from '@testing-library/user-event'
import { Form }                               from 'antd'
import { IntlProvider }                       from 'react-intl'

import { WlanSecurityEnum } from '@acx-ui/rc/utils'
import { Provider }         from '@acx-ui/store'

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

// Mock the workflow service
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetWorkflowProfilesQuery: () => ({
    workflowProfileOptions: [
      { label: 'Workflow 1', value: 'workflow-1' },
      { label: 'Workflow 2', value: 'workflow-2' }
    ]
  }),
  useGetWorkflowProfileBoundNetworkQuery: () => ({
    data: [{
      assignmentResourceType: 'NETWORK',
      assignmentResourceId: 'network-1',
      links: [
        {
          rel: 'workflow',
          href: 'https://api.int.ruckus.cloud/workflows/workflow-1'
        }
      ]
    }]
  }),
  // eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
  useGetAAAPolicyViewModelListQuery: (...args: any[]) => jest.fn(...args)
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
    <Provider>
      <IntlProvider messages={{}} locale='en'>
        <NetworkFormContext.Provider value={mockContextValue}>
          <Form>
            {ui}
          </Form>
        </NetworkFormContext.Provider>
      </IntlProvider>
    </Provider>
  )
}

describe('WorkflowForm', () => {
  it('renders the basic form structure', () => {
    renderWithProviders(<WorkflowForm />)

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByTestId('workflow-profile-select')).toBeInTheDocument()
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
      <Provider>
        <IntlProvider messages={{}} locale='en'>
          <NetworkFormContext.Provider value={editModeContext}>
            <Form>
              <WorkflowForm />
            </Form>
          </NetworkFormContext.Provider>
        </IntlProvider>
      </Provider>
    )

    expect(screen.queryByTestId('network-more-settings')).not.toBeInTheDocument()
  })

  it('does not render NetworkMoreSettingsForm in Ruckus AI mode', () => {
    const ruckusAiModeContext = {
      ...mockContextValue,
      isRuckusAiMode: true
    }

    render(
      <Provider>
        <IntlProvider messages={{}} locale='en'>
          <NetworkFormContext.Provider value={ruckusAiModeContext}>
            <Form>
              <WorkflowForm />
            </Form>
          </NetworkFormContext.Provider>
        </IntlProvider>
      </Provider>
    )

    expect(screen.queryByTestId('network-more-settings')).not.toBeInTheDocument()
  })

  it('renders NetworkDiagram with correct props', () => {
    renderWithProviders(<WorkflowForm />)
    const networkDiagram = screen.getByTestId('network-diagram')
    expect(networkDiagram).toBeInTheDocument()
  })

  it('renders accounting service section with correct initial state', () => {
    renderWithProviders(<WorkflowForm />)
    expect(screen.getByText('Accounting Service')).toBeInTheDocument()
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('shows accounting server and proxy service when accounting service is enabled', async () => {
    renderWithProviders(<WorkflowForm />)
    const accountingSwitch = screen.getByRole('switch')
    fireEvent.click(accountingSwitch)

    await waitFor(() => {
      expect(screen.getByText('Accounting Server')).toBeInTheDocument()
    })

    expect(screen.getByText('Proxy Service')).toBeInTheDocument()
  })

  it('initializes form with correct values in edit mode', async () => {
    const editModeContext = {
      ...mockContextValue,
      editMode: true,
      data: {
        ...mockContextValue.data,
        guestPortal: {
          workflowId: 'workflow-1',
          workflowName: 'Workflow 1'
        }
      }
    }

    render(
      <Provider>
        <IntlProvider messages={{}} locale='en'>
          <NetworkFormContext.Provider value={editModeContext}>
            <Form>
              <WorkflowForm />
            </Form>
          </NetworkFormContext.Provider>
        </IntlProvider>
      </Provider>
    )

    expect(screen.getByText('Workflow 1')).toBeInTheDocument()
  })

  it('handles form value changes correctly', async () => {
    renderWithProviders(<WorkflowForm />)
    const workflowSelect = screen.getAllByRole('combobox')[0]

    await userEvent.click(workflowSelect)


    expect(screen.getByText('Workflow 2')).toBeInTheDocument()
  })

  it('handles accounting service toggle correctly', async () => {
    renderWithProviders(<WorkflowForm />)
    const accountingSwitch = screen.getByRole('switch')

    fireEvent.click(accountingSwitch)
    expect(accountingSwitch).toBeChecked()

    fireEvent.click(accountingSwitch)
    expect(accountingSwitch).not.toBeChecked()
  })

  it('handles proxy service toggle correctly when accounting is enabled', async () => {
    renderWithProviders(<WorkflowForm />)
    const accountingSwitch = screen.getByRole('switch')
    fireEvent.click(accountingSwitch)

    const proxySwitch = screen.getByTestId('enable-accounting-proxy')
    fireEvent.click(proxySwitch)
    expect(proxySwitch).toBeChecked()

    fireEvent.click(proxySwitch)
    expect(proxySwitch).not.toBeChecked()
  })
})
