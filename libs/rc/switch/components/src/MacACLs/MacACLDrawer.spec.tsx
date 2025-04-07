/* eslint-disable max-len */
import { fireEvent } from '@testing-library/react'
import userEvent     from '@testing-library/user-event'
import { rest }      from 'msw'

import { SwitchUrlsInfo }                     from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'

import { MacACLDrawer } from './MacACLDrawer'

describe('MacACLDrawer', () => {
  const params = { tenantId: 'tenant-id', venueId: 'venue-id',
    switchId: 'switch-id', serialNumber: 'serial-number' }
  const mockSetVisible = jest.fn()
  const mockOnFinish = jest.fn()
  const mockMacACLData = {
    id: '525a68dc53494d29bb163ee0de86ad6a',
    switchId: 'c0:c5:20:78:dd:04',
    name: 'Test MAC ACL',
    customized: true,
    sharedWithPolicyAndProfile: false,
    switchMacAclRules: [
      {
        id: '5526d685265144cb9908aea2136a77b7',
        action: 'permit',
        sourceAddress: 'any',
        destinationAddress: 'any',
        macAclId: '525a68dc53494d29bb163ee0de86ad6a'
      }
    ]
  }

  const defaultProps = {
    visible: true,
    setVisible: mockSetVisible,
    macACLData: mockMacACLData,
    onFinish: mockOnFinish,
    editMode: false,
    venueId: 'venue-id'
  }

  beforeEach(() => {
    mockSetVisible.mockClear()
    mockOnFinish.mockClear()
    mockServer.use(
      rest.post(SwitchUrlsInfo.addSwitchMacAcl.url, (req, res, ctx) => {
        return res(ctx.json({ id: 'new-acl-id' }))
      }),
      rest.post(SwitchUrlsInfo.getLayer2Acls.url, (req, res, ctx) => {
        return res(ctx.json({
          data: [
            { id: 'acl-1', name: 'ACL 1' },
            { id: 'acl-2', name: 'ACL 2' }
          ],
          totalCount: 2
        }))
      }),
      rest.post(SwitchUrlsInfo.getSwitchMacAcls.url, (req, res, ctx) => {
        return res(ctx.json({
          data: mockMacACLData,
          totalCount: 1
        }))
      }),
      rest.put(SwitchUrlsInfo.updateSwitchMacAcl.url, (req, res, ctx) => {
        return res(ctx.json({
          data: [mockMacACLData],
          totalCount: 1
        }))
      }),
      rest.delete(SwitchUrlsInfo.deleteSwitchMacAcl.url, (req, res, ctx) => {
        return res(ctx.json({ success: true }))
      })
    )

  })

  it('renders the drawer with MAC ACL form in create mode', async () => {
    render(
      <Provider>
        <MacACLDrawer {...defaultProps} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    expect(await screen.findByText('Add MAC ACL')).toBeInTheDocument()
    expect(await screen.findByLabelText('MAC ACL Name')).toBeInTheDocument()

    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('renders the drawer with MAC ACL form in edit mode', async () => {
    render(
      <Provider>
        <MacACLDrawer {...defaultProps} editMode={true} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    expect(await screen.findByText('Edit MAC ACL')).toBeInTheDocument()

    const nameInput = await screen.findByLabelText('MAC ACL Name')
    expect(nameInput).toHaveValue('Test MAC ACL')

    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })

  it('closes the drawer when clicking the cancel button', async () => {
    render(
      <Provider>
        <MacACLDrawer {...defaultProps} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    expect(mockSetVisible).toHaveBeenCalledWith(false)
  })

  it('submits the form with updated values when clicking create button', async () => {
    render(
      <Provider>
        <MacACLDrawer {...defaultProps} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const nameInput = await screen.findByLabelText('MAC ACL Name')
    fireEvent.change(nameInput, { target: { value: 'New MAC ACL' } })

    const createButton = await screen.findByRole('button', { name: 'Add' })
    fireEvent.click(createButton)
  })

  it('validates required fields before submission', async () => {
    render(
      <Provider>
        <MacACLDrawer {...defaultProps} macACLData={undefined} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const createButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(createButton)

    expect(await screen.findByText('Please enter MAC ACL name')).toBeInTheDocument()
    expect(mockOnFinish).not.toHaveBeenCalled()
  })
  it('handles edit functionality correctly', async () => {
    render(
      <Provider>
        <MacACLDrawer {...defaultProps} editMode={true} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: 'permit' })).toBeVisible()
    const checkbox = await within(rows[1]).findByRole('checkbox')
    await userEvent.click(checkbox)
    const editButton = await screen.findByRole('button', { name: /edit/i })
    await userEvent.click(editButton)

    expect(await screen.findByText('Edit Rule')).toBeInTheDocument()
  })

  it('handles delete functionality correctly', async () => {
    render(
      <Provider>
        <MacACLDrawer {...defaultProps} editMode={true} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: 'permit' })).toBeVisible()
    const checkbox = await within(rows[1]).findByRole('checkbox')
    await userEvent.click(checkbox)
    const deleteButton = await screen.findByRole('button', { name: /delete/i })
    await userEvent.click(deleteButton)

    expect(checkbox).not.toBeInTheDocument()
  })

  it('should call handleAddRule correctly', async () => {
    render(
      <Provider>
        <MacACLDrawer {...defaultProps} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const addRuleButton = await screen.findByRole('button', { name: /Add Rule/i })
    await userEvent.click(addRuleButton)

    const dialogs = await screen.findAllByRole('dialog')
    expect(dialogs.length).toBe(2)
  })

  it('adds a new rule when the rule key does not exist in the data source', async () => {
    const setVisibleMock = jest.fn()
    render(
      <Provider>
        <MacACLDrawer
          visible={true}
          setVisible={setVisibleMock}
          venueId='venue-id'
          editMode={false}
        />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const addRuleButton = await screen.findByRole('button', { name: /Add Rule/i })
    await userEvent.click(addRuleButton)

    const actionSelect = await screen.findByRole('combobox')
    fireEvent.mouseDown(actionSelect)
    const permitOption = await screen.findByText('Permit', {
      selector: '.ant-select-item-option-content'
    })
    fireEvent.click(permitOption)

    const addButton = await screen.findByTestId('addButton')
    await userEvent.click(addButton)

    const tableRows = await screen.findAllByRole('row')
    expect(tableRows.length).toBeGreaterThan(1)
  })

  it('adds a new rule when dataSource already has entries', async () => {
    const initialMacACLData = {
      id: 'acl-123',
      name: 'Test MAC ACL',
      customized: true,
      usePolicyAndProfileSetting: false,
      switchMacAclRules: [
        {
          id: 'rule-1',
          key: 'rule-1',
          action: 'permit',
          sourceAddress: 'any',
          sourceMask: '',
          destinationAddress: 'any',
          destinationMask: ''
        }
      ]
    }

    render(
      <Provider>
        <MacACLDrawer
          visible={true}
          setVisible={mockSetVisible}
          venueId={params.venueId}
          switchIds={[params.switchId]}
          editMode={true}
          macACLData={initialMacACLData}
        />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    expect(await screen.findByRole('cell', { name: 'permit' })).toBeInTheDocument()

    const addRuleButton = await screen.findByRole('button', { name: /Add Rule/i })
    await userEvent.click(addRuleButton)

    const actionSelect = await screen.findByRole('combobox')
    fireEvent.mouseDown(actionSelect)
    const denyOption = await screen.findByText('Deny', {
      selector: '.ant-select-item-option-content'
    })
    fireEvent.click(denyOption)

    const addButton = await screen.findByTestId('addButton')
    await userEvent.click(addButton)

    const permitCells = await screen.findAllByRole('cell', { name: 'permit' })
    expect(permitCells).toHaveLength(1)
  })

  it('updates an existing rule when the rule key matches', async () => {
    const initialMacACLData = {
      id: 'acl-123',
      name: 'Test MAC ACL',
      customized: true,
      usePolicyAndProfileSetting: false,
      switchMacAclRules: [
        {
          id: 'rule-1',
          key: 'rule-1',
          action: 'permit',
          sourceAddress: '00:11:22:33:44:55',
          sourceMask: 'FF:FF:FF:FF:FF:FF',
          destinationAddress: 'any',
          destinationMask: ''
        }
      ]
    }

    render(
      <Provider>
        <MacACLDrawer
          visible={true}
          setVisible={mockSetVisible}
          venueId={params.venueId}
          switchIds={[params.switchId]}
          editMode={true}
          macACLData={initialMacACLData}
        />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    expect(await screen.findByRole('cell', { name: 'permit' })).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: '00:11:22:33:44:55' })).toBeInTheDocument()

    const rows = await screen.findAllByRole('row')
    const checkbox = await within(rows[1]).findByRole('checkbox')
    await userEvent.click(checkbox)

    const editButton = await screen.findByRole('button', { name: /Edit/i })
    await userEvent.click(editButton)

    const actionSelect = await screen.findByRole('combobox')
    fireEvent.mouseDown(actionSelect)
    const denyOption = await screen.findByText('Deny', {
      selector: '.ant-select-item-option-content'
    })
    fireEvent.click(denyOption)

    const addButton = await screen.findByTestId('addButton')
    await userEvent.click(addButton)

    expect(await screen.findByRole('cell', { name: '00:11:22:33:44:55' })).toBeInTheDocument()
  })


  it('handles form validation errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <Provider>
        <MacACLDrawer
          {...defaultProps}
          macACLData={undefined}
        />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const addButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addButton)

    expect(consoleSpy).toHaveBeenCalled()

    expect(mockSetVisible).not.toHaveBeenCalledWith(false)

    consoleSpy.mockRestore()
  })
  it('handles multiple switch IDs when creating a new MAC ACL', async () => {    // Render component with multiple switchIds
    render(
      <Provider>
        <MacACLDrawer
          {...defaultProps}
          editMode={false}
          switchIds={['switch-id', 'switch-id']}
        />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const nameInput = await screen.findByLabelText('MAC ACL Name')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Multi-Switch MAC ACL')

    const addRuleButton = await screen.findByRole('button', { name: /Add Rule/i })
    await userEvent.click(addRuleButton)

    const actionSelect = await screen.findByRole('combobox')
    fireEvent.mouseDown(actionSelect)
    const permitOption = await screen.findByText('Permit', {
      selector: '.ant-select-item-option-content'
    })
    fireEvent.click(permitOption)

    const ruleAddButton = await screen.findByTestId('addButton')
    await userEvent.click(ruleAddButton)
  })
  it.skip('handles rule updates correctly via handleSaveRule', async () => {
    render(
      <Provider>
        <MacACLDrawer
          visible={true}
          setVisible={mockSetVisible}
          venueId={params.venueId}
          switchIds={[params.switchId]}
          editMode={true}
          macACLData={{
            id: 'acl-123',
            name: 'Test MAC ACL',
            customized: true,
            switchMacAclRules: [
              {
                id: 'rule-1',
                key: 'rule-1',
                action: 'permit',
                sourceAddress: 'any',
                destinationAddress: 'any',
                destinationMask: ''
              }
            ]
          }}
        />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    expect(await screen.findByRole('cell', { name: 'permit' })).toBeInTheDocument()

    const rows = await screen.findAllByRole('row')
    const checkbox = await within(rows[1]).findByRole('checkbox')
    await userEvent.click(checkbox)

    const editButton = await screen.findByRole('button', { name: /Edit/i })
    await userEvent.click(editButton)

    const actionSelect = await screen.findByRole('combobox')
    fireEvent.mouseDown(actionSelect)
    const denyOption = await screen.findByText('Deny', {
      selector: '.ant-select-item-option-content'
    })
    fireEvent.click(denyOption)

    const dialogs = await screen.findAllByRole('dialog')
    const addButton = await within(dialogs[1]).findByRole('button', { name: 'Add' })
    await userEvent.click(addButton)

    const addRuleButton = await screen.findByRole('button', { name: /Add Rule/i })
    await userEvent.click(addRuleButton)

    const newActionSelect = await screen.findByRole('combobox')
    fireEvent.mouseDown(newActionSelect)
    const permitOption = await screen.findByText('Permit', {
      selector: '.ant-select-item-option-content'
    })
    fireEvent.click(permitOption)

    await userEvent.click(addButton)

    const updatedRows = await screen.findAllByRole('row')
    expect(updatedRows.length).toBe(3)
  })

  it('applies changes correctly in create mode with multiple switches', async () => {
    render(
      <Provider>
        <MacACLDrawer
          visible={true}
          setVisible={mockSetVisible}
          venueId={params.venueId}
          switchIds={['switch-id', 'switch-id']}
          editMode={false}
        />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const nameInput = await screen.findByLabelText('MAC ACL Name')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'New MAC ACL')

    const addRuleButton = await screen.findByRole('button', { name: /Add Rule/i })
    await userEvent.click(addRuleButton)

    const actionSelect = await screen.findByRole('combobox')
    fireEvent.mouseDown(actionSelect)
    const permitOption = await screen.findByText('Permit', {
      selector: '.ant-select-item-option-content'
    })
    fireEvent.click(permitOption)

    const dialogs = await screen.findAllByRole('dialog')
    const addButton = await within(dialogs[1]).findByRole('button', { name: 'Add' })
    await userEvent.click(addButton)

    const saveButton = await screen.findByTestId('addButton')
    await userEvent.click(saveButton)
  })

  it('toggles between customized and policy settings when clicking the customize button', async () => {
    // Create a modified version of mockMacACLData with sharedWithPolicyAndProfile set to true
    const sharedMacACLData = {
      ...mockMacACLData,
      sharedWithPolicyAndProfile: true
    }

    render(
      <Provider>
        <MacACLDrawer
          {...defaultProps}
          editMode={true}
          macACLData={sharedMacACLData}
        />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    // Verify the button is visible
    const useProfileSettingsButton = await screen.findByRole('button', {
      name: 'Use \'Policies & Profiles\' Level Settings'
    })
    expect(useProfileSettingsButton).toBeInTheDocument()

    // Initial state should be customized=true
    expect(useProfileSettingsButton).toHaveTextContent('Use \'Policies & Profiles\' Level Settings')

    // Click the button to switch to policy settings
    await userEvent.click(useProfileSettingsButton)

    // Button text should now change to "Customize"
    const customizeButton = await screen.findByRole('button', { name: 'Customize' })
    expect(customizeButton).toBeInTheDocument()

    // Click again to switch back to customized mode
    await userEvent.click(customizeButton)

    // Button should switch back to original text
    expect(await screen.findByRole('button', {
      name: 'Use \'Policies & Profiles\' Level Settings'
    })).toBeInTheDocument()
  })
  it('sets globalDataSource correctly when tableQuery data is available', async () => {
    const mockTableQueryData = {
      data: [
        {
          id: 'global-acl-123',
          name: 'Global MAC ACL',
          macAclRules: [
            {
              id: 'global-rule-1',
              action: 'permit',
              sourceAddress: '11:22:33:44:55:66',
              sourceMask: 'FF:FF:FF:FF:FF:FF',
              destinationAddress: 'any'
            },
            {
              id: 'global-rule-2',
              action: 'deny',
              sourceAddress: 'any',
              destinationAddress: '66:77:88:99:AA:BB'
            }
          ]
        }
      ]
    }

    jest.spyOn(require('@acx-ui/rc/utils'), 'useTableQuery')
      .mockReturnValue({ data: mockTableQueryData, isLoading: false })

    render(
      <Provider>
        <MacACLDrawer
          {...defaultProps}
          editMode={true}
          macACLData={{
            id: 'acl-123',
            name: 'Test MAC ACL',
            customized: false,
            sharedWithPolicyAndProfile: true,
            switchMacAclRules: []
          }}
        />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    // Wait for component to render and process the data
    await screen.findByRole('button', { name: 'Customize' })

    // Verify that global rules appear in the table when "Use Policies & Profiles" is selected
    expect(await screen.findByRole('row', { name: /permit/ })).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: '11:22:33:44:55:66' })).toBeInTheDocument()
    expect(await screen.findByRole('row', { name: /deny/ })).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: '66:77:88:99:AA:BB' })).toBeInTheDocument()
  })
  it('removes customized property from payload when usePolicyAndProfileSetting is true', async () => {
    render(
      <Provider>
        <MacACLDrawer
          visible={true}
          setVisible={mockSetVisible}
          venueId={params.venueId}
          switchIds={[params.switchId]}
          editMode={true}
          macACLData={{ ...mockMacACLData, sharedWithPolicyAndProfile: true }}
        />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const applyButton = await screen.findByRole('button', { name: /Apply/i })
    await userEvent.click(applyButton)
  })
})
