import { fireEvent, render, screen } from '@testing-library/react'
import userEvent                     from '@testing-library/user-event'
import { IntlProvider }              from 'react-intl'

import { Provider } from '@acx-ui/store'

import { MacACLDrawer } from './MacACLDrawer'

describe('MacACLDrawer', () => {
  const mockSetVisible = jest.fn()
  const mockOnFinish = jest.fn()
  const mockMacACLData = {
    id: 'acl-123',
    name: 'Test MAC ACL',
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
    macACLData: mockMacACLData,
    onFinish: mockOnFinish,
    editMode: false,
    venueId: 'venue-123'
  }

  beforeEach(() => {
    mockSetVisible.mockClear()
    mockOnFinish.mockClear()
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
})
