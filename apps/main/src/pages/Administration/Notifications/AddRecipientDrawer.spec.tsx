/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { NotificationEndpointType, NotificationRecipientType, NotificationRecipientUIModel } from '@acx-ui/rc/utils'
import { Provider }                                                                          from '@acx-ui/store'
import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import AddRecipientDrawer from './AddRecipientDrawer'

const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
}
const mockedSetVisible = jest.fn()
const mockedUnwrap = jest.fn().mockImplementation(async () => {})
const mockAddMutation = jest.fn().mockImplementation(() => ({
  unwrap: mockedUnwrap
}))
const mockUpdateMutation = jest.fn().mockImplementation(() => ({
  unwrap: mockedUnwrap
}))
const services = require('@acx-ui/rc/services')
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useAddRecipientMutation: () => ([mockAddMutation, { isLoading: false }]),
  useUpdateRecipientMutation: () => ([mockUpdateMutation, { isLoading: false }])
}))

const privilegeGroupList =
  [
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8911',
      name: 'ADMIN',
      description: 'Admin Role',
      roleName: 'ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8912',
      name: 'PRIME_ADMIN',
      description: 'Prime Admin Role',
      roleName: 'PRIME_ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8913',
      name: 'READ_ONLY',
      description: 'Read only Role',
      roleName: 'READ_ONLY',
      type: 'System',
      delegation: false,
      allCustomers: false
    }
  ]

const globalRecipient = {
  id: '123',
  description: 'global_recipient',
  recipientType: NotificationRecipientType.GLOBAL,
  endpoints: [{
    id: '123',
    active: true,
    destination: 'test@mail.com',
    status: '',
    type: NotificationEndpointType.email,
    createdDate: '',
    updatedDate: ''
  }, {
    id: '123',
    active: false,
    destination: '',
    status: '',
    type: NotificationEndpointType.mobile_push,
    createdDate: '',
    updatedDate: ''
  }],
  email: 'test@mail.com',
  emailEnabled: true,
  mobile: '',
  mobileEnabled: false
} as NotificationRecipientUIModel

const pgRecipient = {
  id: '123',
  description: 'pg_recipient',
  recipientType: NotificationRecipientType.PRIVILEGEGROUP,
  emailPreferences: true,
  smsPreferences: false,
  privilegeGroup: '2765e98c7b9446e2a5bdd4720e0e8912',
  endpoints: [],
  email: '',
  emailEnabled: false,
  mobile: '',
  mobileEnabled: false
} as NotificationRecipientUIModel

describe('AddRecipientDrawer', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    services.useGetPrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
      return { data: privilegeGroupList }
    })
  })
  it('should render correctly', async () => {
    render(
      <Provider>
        <AddRecipientDrawer
          visible={true}
          setVisible={mockedSetVisible}
          editMode={false}
          editData={{} as NotificationRecipientUIModel}
          isDuplicated={jest.fn()}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add Recipient')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'Add global recipient' })).toBeChecked()
    expect(screen.getAllByRole('textbox')).toHaveLength(3)
    expect(screen.getAllByRole('switch')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
  })
  it('cancel should close window', async () => {
    render(
      <Provider>
        <AddRecipientDrawer
          visible={true}
          setVisible={mockedSetVisible}
          editMode={false}
          editData={{} as NotificationRecipientUIModel}
          isDuplicated={jest.fn()}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add Recipient')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedSetVisible).toHaveBeenCalledWith(false)
  })
  it('should save new global recipient correctly', async () => {
    render(
      <Provider>
        <AddRecipientDrawer
          visible={true}
          setVisible={mockedSetVisible}
          editMode={false}
          editData={{} as NotificationRecipientUIModel}
          isDuplicated={jest.fn()}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add Recipient')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'Add global recipient' })).toBeChecked()
    const name = screen.getAllByRole('textbox')[0]
    await userEvent.type(name, 'recipient_name')
    const email = screen.getAllByRole('textbox')[1]
    await userEvent.type(email, 'test@mail.com')
    await waitFor(() => expect(screen.getAllByRole('switch')[0]).toBeChecked())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled())
    const mobile = screen.getAllByRole('textbox')[2]
    await userEvent.type(mobile, '1925555555')
    await waitFor(() => expect(screen.getAllByRole('switch')[1]).toBeChecked())

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(mockAddMutation).toHaveBeenCalled())
    expect(mockedSetVisible).toHaveBeenCalledWith(false)
  })
  it('should save new privilegegroup recipient correctly', async () => {
    render(
      <Provider>
        <AddRecipientDrawer
          visible={true}
          setVisible={mockedSetVisible}
          editMode={false}
          editData={{} as NotificationRecipientUIModel}
          isDuplicated={jest.fn()}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add Recipient')).toBeVisible()
    await userEvent.click(screen.getByRole('radio', { name: 'Add Privilege Group as recipient' }))
    expect(screen.getByRole('radio', { name: 'Add Privilege Group as recipient' })).toBeChecked()
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Privilege Group Name' }))
    await userEvent.click(screen.getByText('Prime Admin'))
    await userEvent.click(screen.getAllByRole('switch')[0])
    await waitFor(() => expect(screen.getAllByRole('switch')[0]).toBeChecked())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled())

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(mockAddMutation).toHaveBeenCalled())
    expect(mockedSetVisible).toHaveBeenCalledWith(false)
  })
  it('should save edited global recipient correctly', async () => {
    render(
      <Provider>
        <AddRecipientDrawer
          visible={true}
          setVisible={mockedSetVisible}
          editMode={true}
          editData={globalRecipient}
          isDuplicated={jest.fn()}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit Recipient')).toBeVisible()
    expect(screen.getByDisplayValue('global_recipient')).toBeVisible()
    expect(screen.getByDisplayValue('test@mail.com')).toBeVisible()
    await userEvent.click(screen.getAllByRole('switch')[0])
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled())
    const mobile = screen.getAllByRole('textbox')[2]
    await userEvent.type(mobile, '19255555555')
    await waitFor(() => expect(screen.getAllByRole('switch')[1]).toBeChecked())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockUpdateMutation).toHaveBeenCalled())
    expect(mockedSetVisible).toHaveBeenCalledWith(false)
  })
  it('should save edited privilegegroup recipient correctly', async () => {
    render(
      <Provider>
        <AddRecipientDrawer
          visible={true}
          setVisible={mockedSetVisible}
          editMode={true}
          editData={pgRecipient}
          isDuplicated={jest.fn()}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit Recipient')).toBeVisible()
    expect(screen.getByText('Prime Admin')).toBeVisible()
    expect(screen.getAllByRole('switch')[0]).toBeChecked()
    await userEvent.click(screen.getAllByRole('switch')[0])
    await waitFor(() => expect(screen.getAllByRole('switch')[0]).not.toBeChecked())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled())
    await userEvent.click(screen.getAllByRole('switch')[1])
    await waitFor(() => expect(screen.getAllByRole('switch')[1]).toBeChecked())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockUpdateMutation).toHaveBeenCalled())
    expect(mockedSetVisible).toHaveBeenCalledWith(false)
  })
  it('should show toast if email/mobile is a duplicate', async () => {
    const updatedGlobalRecipient = globalRecipient
    updatedGlobalRecipient.endpoints = []
    const mockIsDuplicated = jest.fn().mockReturnValue(true)
    const errorValue = { data: { errors: [{ code: 'TNT-10100', message: '' }] } }
    render(
      <Provider>
        <AddRecipientDrawer
          visible={true}
          setVisible={mockedSetVisible}
          editMode={true}
          editData={updatedGlobalRecipient}
          isDuplicated={mockIsDuplicated}
        />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit Recipient')).toBeVisible()
    expect(screen.getByDisplayValue('global_recipient')).toBeVisible()
    expect(screen.getByDisplayValue('test@mail.com')).toBeVisible()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())

    mockedUnwrap.mockRejectedValueOnce(errorValue)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockUpdateMutation).toHaveBeenCalled())
    await screen.findAllByText('An error occurred: The email address and mobile phone number you entered are already defined for another recipient. Please use unique address and number.')
    expect(mockedSetVisible).not.toHaveBeenCalled()

    mockedUnwrap.mockRejectedValueOnce(errorValue)
    mockIsDuplicated.mockImplementation((type) => type === 'EMAIL')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockUpdateMutation).toHaveBeenCalled())
    await screen.findAllByText('An error occurred: The email address you entered is already defined for another recipient. Please use an unique address.')
    expect(mockedSetVisible).not.toHaveBeenCalled()

    mockedUnwrap.mockRejectedValueOnce(errorValue)
    mockIsDuplicated.mockImplementation((type) => type === 'SMS')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockUpdateMutation).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText('An error occurred: The mobile phone number you entered is already defined for another recipient. Please use a unique number.')).toBeVisible())
    expect(mockedSetVisible).not.toHaveBeenCalled()
  })
})