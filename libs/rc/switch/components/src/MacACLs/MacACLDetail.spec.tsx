// libs/rc/switch/components/src/MacACLs/MacACLDetail.spec.tsx
import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import { IntlProvider }   from 'react-intl'

import { Provider } from '@acx-ui/store'

import { MacACLDetail } from './MacACLDetail'

describe('MacACLDetail', () => {
  const mockSetVisible = jest.fn()
  const mockMacACLData = {
    id: 'acl-123',
    name: 'Test MAC ACL',
    description: 'Test Description',
    switchMacAclRules: [
      {
        id: 'rule-1',
        action: 'permit',
        sourceAddress: '00:11:22:33:44:55',
        sourceMask: 'FF:FF:FF:FF:FF:FF',
        destinationAddress: '66:77:88:99:AA:BB',
        destinationMask: 'FF:FF:FF:FF:FF:FF'
      },
      {
        id: 'rule-2',
        action: 'deny',
        sourceAddress: 'CC:DD:EE:FF:00:11',
        sourceMask: 'FF:FF:FF:FF:FF:FF',
        destinationAddress: '22:33:44:55:66:77',
        destinationMask: 'FF:FF:FF:FF:FF:FF'
      }
    ]
  }

  const defaultProps = {
    visible: true,
    setVisible: mockSetVisible,
    macACLData: mockMacACLData
  }

  beforeEach(() => {
    mockSetVisible.mockClear()
  })

  it('renders the drawer with MAC ACL details', async () => {
    render(
      <IntlProvider locale='en'>
        <Provider>
          <MacACLDetail {...defaultProps} />
        </Provider>
      </IntlProvider>
    )

    // Check drawer title
    expect(await screen.findByText('View MAC ACL')).toBeInTheDocument()

    // Check MAC ACL name
    expect(await screen.findByText('MAC ACL Name')).toBeInTheDocument()
    expect(await screen.findByText('Test MAC ACL')).toBeInTheDocument()

    // Check table headers
    expect(await screen.findByText('Action')).toBeInTheDocument()
    expect(await screen.findByText('Source MAC Address')).toBeInTheDocument()
    expect(await screen.findByText('Mask')).toBeInTheDocument()

    // Check rule data
    expect(await screen.findByText('permit')).toBeInTheDocument()
    expect(await screen.findByText('00:11:22:33:44:55')).toBeInTheDocument()
    expect(await screen.findByText('66:77:88:99:AA:BB')).toBeInTheDocument()
    expect(await screen.findByText('deny')).toBeInTheDocument()
    expect(await screen.findByText('CC:DD:EE:FF:00:11')).toBeInTheDocument()
    expect(await screen.findByText('22:33:44:55:66:77')).toBeInTheDocument()
  })

  it('closes the drawer when clicking the close button', async () => {
    render(
      <IntlProvider locale='en'>
        <Provider>
          <MacACLDetail {...defaultProps} />
        </Provider>
      </IntlProvider>
    )

    // Find and click the close button
    const closeButton = await screen.findByRole('button', { name: 'Close' })
    await userEvent.click(closeButton)

    // Verify setVisible was called with false
    expect(mockSetVisible).toHaveBeenCalledWith(false)
  })

  it('handles empty rules array gracefully', async () => {
    const propsWithoutRules = {
      ...defaultProps,
      macACLData: {
        ...mockMacACLData,
        switchMacAclRules: []
      }
    }

    render(
      <IntlProvider locale='en'>
        <Provider>
          <MacACLDetail {...propsWithoutRules} />
        </Provider>
      </IntlProvider>
    )

    // Check drawer title and other elements still render
    expect(await screen.findByText('View MAC ACL')).toBeInTheDocument()
    expect(await screen.findByText('MAC ACL Name')).toBeInTheDocument()

    // Table should be empty but headers should be present
    expect(await screen.findByText('Action')).toBeInTheDocument()
    expect(await screen.findByText('Source MAC Address')).toBeInTheDocument()
  })
})