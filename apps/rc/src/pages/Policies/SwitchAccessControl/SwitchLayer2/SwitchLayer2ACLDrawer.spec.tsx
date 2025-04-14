// SwitchLayer2ACLDrawer.spec.tsx
import userEvent from '@testing-library/user-event'

import { MacAclRule }              from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { SwitchLayer2ACLDrawer } from './SwitchLayer2ACLDrawer'


describe('SwitchLayer2ACLDrawer', () => {
  const mockSetVisible = jest.fn()
  const mockHandleSaveRule = jest.fn()

  const defaultProps = {
    visible: true,
    setVisible: mockSetVisible,
    handleSaveRule: mockHandleSaveRule
  }

  beforeEach(() => {
    mockSetVisible.mockClear()
    mockHandleSaveRule.mockClear()
  })

  it('renders the drawer in create mode', async () => {
    render(
      <Provider>
        <SwitchLayer2ACLDrawer {...defaultProps} />
      </Provider>
    )

    expect(await screen.findByText('Add Rule')).toBeInTheDocument()
    expect(await screen.findByText('Action')).toBeInTheDocument()
    expect(await screen.findByText('Source MAC')).toBeInTheDocument()
    expect(await screen.findByText('Destination MAC')).toBeInTheDocument()

    expect(await screen.findByText('Permit')).toBeInTheDocument()
    expect(screen.getAllByText('Any').length).toBeGreaterThan(0)
  })

  it('renders the drawer in edit mode with data', async () => {
    const mockData: MacAclRule = {
      id: 'rule-1',
      action: 'deny',
      sourceAddress: '00:11:22:33:44:55',
      sourceMask: 'FF:FF:FF:FF:FF:FF',
      destinationAddress: '66:77:88:99:AA:BB',
      destinationMask: 'FF:FF:FF:FF:FF:FF'
    }

    render(
      <Provider>
        <SwitchLayer2ACLDrawer {...defaultProps} data={mockData} />
      </Provider>
    )

    expect(await screen.findByText('Edit Rule')).toBeInTheDocument()

    await waitFor(async () => {
      expect(await screen.findByText('Deny')).toBeInTheDocument()
    })

    const sourceMacField = await screen.findByTestId('sourceAddress')
    expect(sourceMacField).toHaveValue('00:11:22:33:44:55')

    const destMacField = await screen.findByTestId('destinationAddress')
    expect(destMacField).toHaveValue('66:77:88:99:AA:BB')
  })

  it('renders with "any" source and destination addresses', async () => {
    const mockData: MacAclRule = {
      id: 'rule-1',
      action: 'PERMIT',
      sourceAddress: 'any',
      sourceMask: '',
      destinationAddress: 'any',
      destinationMask: ''
    }

    render(
      <Provider>
        <SwitchLayer2ACLDrawer {...defaultProps} data={mockData} />
      </Provider>
    )

    const sourceAnyRadio = screen.getAllByLabelText('Any')[0]
    expect(sourceAnyRadio).toBeChecked()

    const destAnyRadio = screen.getAllByLabelText('Any')[1]
    expect(destAnyRadio).toBeChecked()
  })

  it('submits form with correct values', async () => {
    render(
      <Provider>
        <SwitchLayer2ACLDrawer {...defaultProps} />
      </Provider>
    )

    const actionSelect = await screen.findByLabelText('Action')
    await userEvent.click(actionSelect)
    const denyOption = await screen.findByText('Deny')
    await userEvent.click(denyOption)

    const sourceMacType = await screen.findByTestId('sourceMac')
    await userEvent.click(sourceMacType)
    const sourceMacField = await screen.findByTestId('sourceAddress')
    await userEvent.type(sourceMacField, '00:11:22:33:44:55')

    const destMacType = await screen.findByTestId('destinationMac')
    await userEvent.click(destMacType)
    const destMacField = await screen.findByTestId('destinationAddress')
    await userEvent.type(destMacField, '66:77:88:99:AA:BB')

    const saveButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(saveButton)

    expect(mockHandleSaveRule).toHaveBeenCalledWith(expect.objectContaining({
      action: 'deny',
      destinationAddress: '66:77:88:99:aa:bb',
      destinationMask: 'ff:ff:ff:ff:ff:ff',
      sourceAddress: '00:11:22:33:44:55',
      sourceMask: 'ff:ff:ff:ff:ff:ff' }))
  })

  it('validates MAC address format', async () => {
    render(
      <Provider>
        <SwitchLayer2ACLDrawer {...defaultProps} />
      </Provider>
    )

    const sourceMacType = await screen.findByTestId('sourceMac')
    await userEvent.click(sourceMacType)
    const sourceMacField = await screen.findByTestId('sourceAddress')
    await userEvent.type(sourceMacField, 'invalid-mac')

    const saveButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(saveButton)

    expect(await screen.findByText('This field is invalid')).toBeInTheDocument()
    expect(mockHandleSaveRule).not.toHaveBeenCalled()
  })

  it('closes the drawer when clicking cancel', async () => {
    render(
      <Provider>
        <SwitchLayer2ACLDrawer {...defaultProps} />
      </Provider>
    )

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    expect(mockSetVisible).toHaveBeenCalledWith(false)
  })
})