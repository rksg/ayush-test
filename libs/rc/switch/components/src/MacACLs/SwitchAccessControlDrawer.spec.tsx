import userEvent from '@testing-library/user-event'

import { Provider }                           from '@acx-ui/store'
import { fireEvent, render, screen, waitFor } from '@acx-ui/test-utils'

import { SwitchAccessControlDrawer } from './SwitchAccessControlDrawer'

describe('SwitchAccessControlDrawer', () => {
  const mockSetVisible = jest.fn()
  const mockHandleSaveRule = jest.fn()
  const mockRuleData = {
    id: 'rule-1',
    key: 'key-1',
    action: 'permit',
    sourceAddress: '00:11:22:33:44:55',
    sourceMask: 'FF:FF:FF:FF:FF:FF',
    destinationAddress: '66:77:88:99:AA:BB',
    destinationMask: 'FF:FF:FF:FF:FF:FF'
  }

  const defaultProps = {
    visible: true,
    setVisible: mockSetVisible,
    handleSaveRule: mockHandleSaveRule
  }

  beforeEach(() => {
    mockSetVisible.mockClear()
    mockHandleSaveRule.mockClear()
  })

  it('renders the drawer with add rule form', async () => {
    render(
      <Provider>
        <SwitchAccessControlDrawer {...defaultProps} />
      </Provider>
    )

    expect(await screen.findByText('Add Rule')).toBeInTheDocument()
    expect(await screen.findByText('Action')).toBeInTheDocument()
    expect(await screen.findByText('Source MAC')).toBeInTheDocument()
    expect(await screen.findByText('Destination MAC')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('renders the drawer with edit rule form', async () => {
    render(
      <Provider>
        <SwitchAccessControlDrawer
          {...defaultProps}
          data={mockRuleData}
        />
      </Provider>
    )

    expect(await screen.findByText('Edit Rule')).toBeInTheDocument()

    expect(screen.getByText('Permit')).toBeInTheDocument()

    const sourceMacRadios = screen.getAllByRole('radio')
    expect(sourceMacRadios[1]).toBeChecked()

    const inputs = screen.getAllByRole('textbox')
    const sourceMacInput = inputs.find(input =>
      input.getAttribute('placeholder') === 'HHHH.HHHH.HHHH')
    expect(sourceMacInput).toHaveValue('00:11:22:33:44:55')

    expect(await screen.findByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })

  it('closes the drawer when clicking the cancel button', async () => {
    render(
      <Provider>
        <SwitchAccessControlDrawer {...defaultProps} />
      </Provider>
    )

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    expect(mockSetVisible).toHaveBeenCalledWith(false)
  })

  it('submits the form with "any" source MAC when selected', async () => {
    render(
      <Provider>
        <SwitchAccessControlDrawer {...defaultProps} />
      </Provider>
    )

    const actionSelect = screen.getByRole('combobox')
    fireEvent.mouseDown(actionSelect)

    const permitOption = await screen.findByText('Permit', {
      selector: '.ant-select-item-option-content'
    })
    fireEvent.click(permitOption)

    const sourceMacRadios = screen.getAllByRole('radio')
    expect(sourceMacRadios[0]).toBeChecked()

    const destMacRadios = screen.getAllByRole('radio')
    expect(destMacRadios[2]).toBeChecked()

    const addButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(mockHandleSaveRule).toHaveBeenCalledWith(expect.objectContaining({
        action: 'permit',
        sourceAddress: 'any',
        sourceMask: '',
        destinationAddress: 'any',
        destinationMask: ''
      }))
    })

    expect(mockSetVisible).toHaveBeenCalledWith(false)
  })

  it('submits the form with specific source and destination MAC addresses', async () => {
    render(
      <Provider>
        <SwitchAccessControlDrawer {...defaultProps} />
      </Provider>
    )

    const actionSelect = screen.getByRole('combobox')
    fireEvent.mouseDown(actionSelect)
    const denyOption = await screen.findByText('Deny', {
      selector: '.ant-select-item-option-content'
    })
    fireEvent.click(denyOption)

    const sourceMacRadios = await screen.findByTestId('sourceMac')
    await userEvent.click(sourceMacRadios)

    const sourceMacInput = await screen.findByTestId('sourceAddress')
    await userEvent.type(sourceMacInput, '00:11:22:33:44:55')

    const destMacRadios = await screen.findByTestId('destinationMac')
    await userEvent.click(destMacRadios)

    const destMacInput = await screen.findByTestId('destinationAddress')
    await userEvent.type(destMacInput, '66:77:88:99:AA:BB')

    const addButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(mockHandleSaveRule).toHaveBeenCalledWith(expect.objectContaining({
        action: 'deny',
        destinationAddress: '66:77:88:99:aa:bb',
        destinationMask: 'ff:ff:ff:ff:ff:ff',
        sourceAddress: '00:11:22:33:44:55',
        sourceMask: 'ff:ff:ff:ff:ff:ff' }))
    })
  })

  it('submits the form with specific source and destination format(-) MAC addresses', async () => {
    render(
      <Provider>
        <SwitchAccessControlDrawer {...defaultProps} />
      </Provider>
    )

    const actionSelect = screen.getByRole('combobox')
    fireEvent.mouseDown(actionSelect)
    const denyOption = await screen.findByText('Deny', {
      selector: '.ant-select-item-option-content'
    })
    fireEvent.click(denyOption)

    const sourceMacRadios = await screen.findByTestId('sourceMac')
    await userEvent.click(sourceMacRadios)

    const sourceMacInput = await screen.findByTestId('sourceAddress')
    await userEvent.type(sourceMacInput, '00-11-22-33-44-55')

    const destMacRadios = await screen.findByTestId('destinationMac')
    await userEvent.click(destMacRadios)

    const destMacInput = await screen.findByTestId('destinationAddress')
    await userEvent.type(destMacInput, '66-77-88-99-AA-BB')

    const addButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(mockHandleSaveRule).toHaveBeenCalledWith(expect.objectContaining({
        action: 'deny',
        destinationAddress: '66-77-88-99-aa-bb',
        destinationMask: 'ff-ff-ff-ff-ff-ff',
        sourceAddress: '00-11-22-33-44-55',
        sourceMask: 'ff-ff-ff-ff-ff-ff' }))
    })
  })

  it('submits the form with specific source and destination format(.) MAC addresses', async () => {
    render(
      <Provider>
        <SwitchAccessControlDrawer {...defaultProps} />
      </Provider>
    )

    const actionSelect = screen.getByRole('combobox')
    fireEvent.mouseDown(actionSelect)
    const denyOption = await screen.findByText('Deny', {
      selector: '.ant-select-item-option-content'
    })
    fireEvent.click(denyOption)

    const sourceMacRadios = await screen.findByTestId('sourceMac')
    await userEvent.click(sourceMacRadios)

    const sourceMacInput = await screen.findByTestId('sourceAddress')
    await userEvent.type(sourceMacInput, '0011.2233.4455')

    const destMacRadios = await screen.findByTestId('destinationMac')
    await userEvent.click(destMacRadios)

    const destMacInput = await screen.findByTestId('destinationAddress')
    await userEvent.type(destMacInput, '6677.8899.AABB')

    const addButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(mockHandleSaveRule).toHaveBeenCalledWith(expect.objectContaining({
        action: 'deny',
        destinationAddress: '6677.8899.aabb',
        destinationMask: 'ffff.ffff.ffff',
        sourceAddress: '0011.2233.4455',
        sourceMask: 'ffff.ffff.ffff' }))
    })
  })

  it('submits the form with specific source and dest no delimiter MAC addresses', async () => {
    render(
      <Provider>
        <SwitchAccessControlDrawer {...defaultProps} />
      </Provider>
    )

    const actionSelect = screen.getByRole('combobox')
    fireEvent.mouseDown(actionSelect)
    const denyOption = await screen.findByText('Deny', {
      selector: '.ant-select-item-option-content'
    })
    fireEvent.click(denyOption)

    const sourceMacRadios = await screen.findByTestId('sourceMac')
    await userEvent.click(sourceMacRadios)

    const sourceMacInput = await screen.findByTestId('sourceAddress')
    await userEvent.type(sourceMacInput, '001122334455')

    const destMacRadios = await screen.findByTestId('destinationMac')
    await userEvent.click(destMacRadios)

    const destMacInput = await screen.findByTestId('destinationAddress')
    await userEvent.type(destMacInput, '66778899AABB')

    const addButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(mockHandleSaveRule).toHaveBeenCalledWith(expect.objectContaining({
        action: 'deny',
        destinationAddress: '66778899aabb',
        destinationMask: 'ffffffffffff',
        sourceAddress: '001122334455',
        sourceMask: 'ffffffffffff' }))
    })
  })

  it('handles rule with "any" for destination MAC and specific source MAC', async () => {
    render(
      <Provider>
        <SwitchAccessControlDrawer
          {...defaultProps}
          data={{
            ...mockRuleData,
            destinationAddress: 'any'
          }}
        />
      </Provider>
    )

    const destAnyRadio = await screen.findByTestId('destinationAny')
    await userEvent.click(destAnyRadio)

    const applyButton = await screen.findByRole('button', { name: 'Apply' })
    await userEvent.click(applyButton)

    await waitFor(() => {
      expect(mockHandleSaveRule).toHaveBeenCalledWith(expect.objectContaining({
        sourceAddress: '00:11:22:33:44:55',
        destinationAddress: 'any',
        destinationMask: ''
      }))
    })
  })

  it('validates MAC address format', async () => {
    render(
      <Provider>
        <SwitchAccessControlDrawer {...defaultProps} />
      </Provider>
    )

    const sourceMacRadios = await screen.findByTestId('sourceMac')
    await userEvent.click(sourceMacRadios)

    const sourceMacInput = await screen.findByTestId('sourceAddress')
    await userEvent.type(sourceMacInput, 'invalid-mac')

    const addButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addButton)

    expect(mockHandleSaveRule).not.toHaveBeenCalled()
  })

  it('correctly sets form values in edit mode with "any" addresses', async () => {
    const mockData = {
      action: 'permit',
      sourceAddress: 'any',
      sourceMask: '',
      destinationAddress: 'any',
      destinationMask: ''
    }

    render(
      <Provider>
        <SwitchAccessControlDrawer
          visible={true}
          setVisible={jest.fn()}
          data={mockData}
          handleSaveRule={jest.fn()}
        />
      </Provider>
    )

    // Check that the source and destination type radios are set to 'any'
    const sourceMacRadios = await screen.findByTestId('sourceMac')
    await userEvent.click(sourceMacRadios)
    expect(sourceMacRadios).toBeChecked()

    const destMacRadios = await screen.findByTestId('destinationMac')
    await userEvent.click(destMacRadios)
    expect(destMacRadios).toBeChecked()
  })

  it('shows error when submitting a duplicate rule', async () => {
    const dataSource = [
      {
        id: 'existing-rule',
        key: 'existing-key',
        action: 'deny',
        sourceAddress: '001122334455',
        sourceMask: 'ffffffffffff',
        destinationAddress: '66778899AABB',
        destinationMask: 'ffffffffffff'
      }
    ]

    render(
      <Provider>
        <SwitchAccessControlDrawer
          {...defaultProps}
          dataSource={dataSource}
        />
      </Provider>
    )

    const actionSelect = screen.getByRole('combobox')
    fireEvent.mouseDown(actionSelect)
    const denyOption = await screen.findByText('Deny', {
      selector: '.ant-select-item-option-content'
    })
    fireEvent.click(denyOption)

    const sourceMacRadios = await screen.findByTestId('sourceMac')
    await userEvent.click(sourceMacRadios)

    const sourceMacInput = await screen.findByTestId('sourceAddress')
    await userEvent.type(sourceMacInput, '001122334455')

    const destMacRadios = await screen.findByTestId('destinationMac')
    await userEvent.click(destMacRadios)

    const destMacInput = await screen.findByTestId('destinationAddress')
    await userEvent.type(destMacInput, '66778899AABB')

    const addButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addButton)

    expect(await screen.findByText('Rule is duplicated')).toBeInTheDocument()
    expect(mockHandleSaveRule).not.toHaveBeenCalled()
  })
})
