/* eslint-disable max-len */
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent                             from '@testing-library/user-event'
import { rest }                              from 'msw'
import { IntlProvider }                      from 'react-intl'

import { SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { mockServer }     from '@acx-ui/test-utils'

import { MacACLDrawer } from './MacACLDrawer'

describe('MacACLDrawer', () => {
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
    venueId: 'venue-123'
  }

  beforeEach(() => {
    mockSetVisible.mockClear()
    mockOnFinish.mockClear()
    mockServer.use(
      rest.post(SwitchUrlsInfo.addSwitchMacAcl.url, (req, res, ctx) => {
        return res(ctx.json({ id: 'new-acl-id' }))
      }),
      rest.post(SwitchUrlsInfo.getLayer2AclRules.url, (req, res, ctx) => {
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
      <IntlProvider locale='en'>
        <Provider>
          <MacACLDrawer {...defaultProps} />
        </Provider>
      </IntlProvider>
    )

    expect(await screen.findByText('Add MAC ACL')).toBeInTheDocument()
    expect(await screen.findByLabelText('MAC ACL Name')).toBeInTheDocument()

    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('renders the drawer with MAC ACL form in edit mode', async () => {
    render(
      <IntlProvider locale='en'>
        <Provider>
          <MacACLDrawer {...defaultProps} editMode={true} />
        </Provider>
      </IntlProvider>
    )

    expect(await screen.findByText('Edit MAC ACL')).toBeInTheDocument()

    const nameInput = await screen.findByLabelText('MAC ACL Name')
    expect(nameInput).toHaveValue('Test MAC ACL')

    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })

  it('closes the drawer when clicking the cancel button', async () => {
    render(
      <IntlProvider locale='en'>
        <Provider>
          <MacACLDrawer {...defaultProps} />
        </Provider>
      </IntlProvider>
    )

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    expect(mockSetVisible).toHaveBeenCalledWith(false)
  })

  it('submits the form with updated values when clicking create button', async () => {
    render(
      <IntlProvider locale='en'>
        <Provider>
          <MacACLDrawer {...defaultProps} />
        </Provider>
      </IntlProvider>
    )

    const nameInput = await screen.findByLabelText('MAC ACL Name')
    fireEvent.change(nameInput, { target: { value: 'New MAC ACL' } })

    const createButton = await screen.findByRole('button', { name: 'Add' })
    fireEvent.click(createButton)
  })

  it('validates required fields before submission', async () => {
    render(
      <IntlProvider locale='en'>
        <Provider>
          <MacACLDrawer {...defaultProps} macACLData={undefined} />
        </Provider>
      </IntlProvider>
    )

    const createButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(createButton)

    expect(await screen.findByText('Please enter MAC ACL name')).toBeInTheDocument()
    expect(mockOnFinish).not.toHaveBeenCalled()
  })
  it('handles edit functionality correctly', async () => {
    render(
      <IntlProvider locale='en'>
        <Provider>
          <MacACLDrawer {...defaultProps} editMode={true} />
        </Provider>
      </IntlProvider>
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
      <IntlProvider locale='en'>
        <Provider>
          <MacACLDrawer {...defaultProps} editMode={true} />
        </Provider>
      </IntlProvider>
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
      <IntlProvider locale='en'>
        <Provider>
          <MacACLDrawer {...defaultProps} />
        </Provider>
      </IntlProvider>
    )

    const addRuleButton = await screen.findByRole('button', { name: /Add Rule/i })
    await userEvent.click(addRuleButton)

    const dialogs = await screen.findAllByRole('dialog')
    expect(dialogs.length).toBe(2)
  })
})
