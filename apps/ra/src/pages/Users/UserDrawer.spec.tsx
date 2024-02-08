import userEvent from '@testing-library/user-event'

import {
  useGetAvailableUsersQuery,
  useGetResourceGroupsQuery,
  useUpdateUserMutation,
  useAddUserMutation,
  useLazyFindUserQuery,
  useInviteUserMutation
} from '@acx-ui/analytics/services'
import { ManagedUser }               from '@acx-ui/analytics/utils'
import { showToast }                 from '@acx-ui/components'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'


import { UserDrawer } from './UserDrawer'

const mockedUserQuery = useGetAvailableUsersQuery as jest.Mock
const mockedRGQuery = useGetResourceGroupsQuery as jest.Mock
const mockedLazyFindUserQuery = useLazyFindUserQuery as jest.Mock
const mockedToggleDrawer = jest.fn()
const mockedAddUserMutation = useAddUserMutation as jest.Mock
const mockedEditUserMutation = useUpdateUserMutation as jest.Mock
const mockedInviteUserMutation = useInviteUserMutation as jest.Mock
const mockedAddUser = jest.fn()
const mockedUpdateUser = jest.fn()
const mockedInviteUser = jest.fn()
const mockedFindUser = jest.fn()

jest.mock('@acx-ui/analytics/services', () => ({
  ...jest.requireActual('@acx-ui/analytics/services'),
  useGetAvailableUsersQuery: jest.fn(),
  useGetResourceGroupsQuery: jest.fn(),
  useAddUserMutation: jest.fn(),
  useUpdateUserMutation: jest.fn(),
  useLazyFindUserQuery: jest.fn(),
  useInviteUserMutation: jest.fn()
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))

describe('User Drawer', () => {
  beforeEach(() => {
    mockedUserQuery.mockImplementation(() => ({
      isLoading: false,
      data: [{
        swuId: '1',
        userName: 'abc@email.com'
      }, {
        swuId: '2',
        userName: 'xyz@email.com'
      }]
    }))
    mockedRGQuery.mockImplementation(() => ({
      isLoading: false,
      data: [{
        id: '1',
        name: 'abc'
      }, {
        id: '2',
        name: 'xyz'
      }]
    }))
    mockedAddUserMutation.mockImplementation(() => [mockedAddUser])
    mockedEditUserMutation.mockImplementation(() => [mockedUpdateUser])
    mockedInviteUserMutation.mockImplementation(() => [mockedInviteUser])
    mockedLazyFindUserQuery.mockImplementation(() => [mockedFindUser])
  })
  afterEach(() => {
    mockedUserQuery.mockClear()
    mockedRGQuery.mockClear()
    mockedToggleDrawer.mockClear()
    mockedAddUserMutation.mockClear()
    mockedEditUserMutation.mockClear()
    mockedInviteUserMutation.mockClear()
    mockedLazyFindUserQuery.mockClear()
    mockedFindUser.mockClear()
    mockedInviteUser.mockClear()
  })
  it('should work correctly for add flow', async () => {
    const props = {
      opened: true,
      selectedRow: null,
      toggleDrawer: mockedToggleDrawer
    }
    mockedAddUser.mockImplementation(() => ({
      unwrap: () => Promise.resolve({})
    }))
    render(
      <Provider><UserDrawer {...props} type='addInternal' /></Provider>,
      { route: {} }
    )
    expect(await screen.findByText('Add Internal')).toBeVisible()
    const dropDowns = screen.getAllByRole('combobox')
    const info = await screen.findByTestId('InformationOutlined')
    fireEvent.mouseOver(info)
    expect(await screen.findByText((content, element) => {
      return element?.tagName.toLowerCase() === 'div'
        && content.startsWith('Add Internal user')
    })).toBeInTheDocument()
    await userEvent.click(dropDowns[0]) // email
    await userEvent.click(screen.getByTitle('xyz@email.com'))
    await userEvent.click(dropDowns[1]) //RG
    await userEvent.click(screen.getByTitle('abc'))
    await userEvent.click(dropDowns[2]) //Role
    await userEvent.click(screen.getByTitle('Network Admin'))
    const saveBtn = screen.getByText('Save')
    expect(saveBtn).toBeEnabled()
    await userEvent.click(saveBtn)
    expect(mockedToggleDrawer).toBeCalledWith(false)
    expect(showToast).toHaveBeenCalledWith({
      type: 'success',
      content: 'User added successfully'
    })
  })
  it('should handle error for create flow', async () => {
    const props = {
      opened: true,
      selectedRow: null,
      toggleDrawer: mockedToggleDrawer
    }
    mockedAddUser.mockImplementation(() => ({
      unwrap: () => Promise.reject({ data: 'error' })
    }))
    render(
      <Provider><UserDrawer {...props} type='addInternal' /></Provider>,
      { route: {} }
    )
    expect(await screen.findByText('Add Internal')).toBeVisible()
    const dropDowns = screen.getAllByRole('combobox')
    await userEvent.click(dropDowns[0]) // email
    await userEvent.click(screen.getByTitle('xyz@email.com'))
    await userEvent.click(dropDowns[1]) //RG
    await userEvent.click(screen.getByTitle('abc'))
    await userEvent.click(dropDowns[2]) //Role
    await userEvent.click(screen.getByTitle('Network Admin'))
    const saveBtn = screen.getByText('Save')
    expect(saveBtn).toBeEnabled()
    await userEvent.click(saveBtn)
    expect(mockedToggleDrawer).toBeCalledWith(false)
    expect(showToast).toHaveBeenCalledWith({
      type: 'error',
      content: 'Error: error'
    })
  })
  it('should work correctly for edit flow', async () => {
    const props = {
      opened: true,
      selectedRow: {
        email: 'abc.email.com', id: '1', resourceGroupId: '2', role: 'Admin'
      } as unknown as ManagedUser,
      toggleDrawer: mockedToggleDrawer
    }
    mockedUpdateUser.mockImplementation(() => ({
      unwrap: () => Promise.resolve({})
    }))
    render(
      <Provider><UserDrawer {...props} type='edit' /></Provider>,
      { route: {} }
    )
    expect(await screen.findByText('Edit User')).toBeVisible()
    const dropDowns = screen.getAllByRole('combobox')
    await userEvent.click(dropDowns[1]) //Role
    await userEvent.click(screen.getByTitle('Network Admin'))
    const saveBtn = screen.getByText('Save')
    expect(saveBtn).toBeEnabled()
    await userEvent.click(saveBtn)
    expect(mockedToggleDrawer).toBeCalledWith(false)
    expect(showToast).toHaveBeenCalledWith({
      type: 'success',
      content: 'User edited successfully'
    })
  })
  it('should handle error for edit flow', async () => {
    const props = {
      opened: true,
      selectedRow: {
        email: 'abc.email.com', id: '1', resourceGroupId: '2', role: 'Admin'
      } as unknown as ManagedUser,
      toggleDrawer: mockedToggleDrawer
    }
    mockedUpdateUser.mockImplementation(() => ({
      unwrap: () => Promise.reject({ data: 'error' })
    }))
    render(
      <Provider><UserDrawer {...props} type='edit' /></Provider>,
      { route: {} }
    )
    expect(await screen.findByText('Edit User')).toBeVisible()
    const dropDowns = screen.getAllByRole('combobox')
    await userEvent.click(dropDowns[0]) //RG
    await userEvent.click(screen.getByTitle('abc'))
    const saveBtn = screen.getByText('Save')
    expect(saveBtn).toBeEnabled()
    await userEvent.click(saveBtn)
    expect(mockedToggleDrawer).toBeCalledWith(false)
    expect(showToast).toHaveBeenCalledWith({
      type: 'error',
      content: 'Error: error'
    })
  })
  it('should close on cancel', async () => {
    const props = {
      opened: true,
      selectedRow: {
        email: 'abc.email.com', id: '1', resourceGroupId: '2', role: 'Admin'
      } as unknown as ManagedUser,
      toggleDrawer: mockedToggleDrawer
    }
    mockedUpdateUser.mockImplementation(() => ({
      unwrap: () => Promise.reject({ data: 'error' })
    }))
    render(
      <Provider><UserDrawer {...props} type='edit' /></Provider>,
      { route: {} }
    )
    expect(await screen.findByText('Edit User')).toBeVisible()
    const cancelBtn = screen.getByText('Cancel')
    expect(cancelBtn).toBeEnabled()
    await userEvent.click(cancelBtn)
    expect(mockedToggleDrawer).toBeCalledWith(false)
  })
  it('should invite 3rd party user', async () => {
    const props = {
      opened: true,
      selectedRow: null,
      toggleDrawer: mockedToggleDrawer
    }
    mockedInviteUser.mockImplementation(() => ({
      unwrap: () => Promise.resolve({})
    }))
    mockedFindUser.mockImplementation(() => ({
      unwrap: () => Promise.resolve({ userId: '123' })
    }))
    render(
      <Provider><UserDrawer {...props} type='invite3rdParty' /></Provider>,
      { route: {} }
    )
    expect(await screen.findByText('Invite 3rd Party')).toBeVisible()
    const info = await screen.findByTestId('InformationOutlined')
    fireEvent.mouseOver(info)
    expect(await screen.findByText((content, element) => {
      return element?.tagName.toLowerCase() === 'div'
        && content.startsWith('Invite a 3rd Party user')
    })).toBeInTheDocument()
    const emailInput = await screen.findByPlaceholderText('Enter an email')
    await(userEvent.type(emailInput, 'dog@email.com'))
    const dropDowns = screen.getAllByRole('combobox')
    await userEvent.click(dropDowns[0]) //RG
    await userEvent.click(screen.getByTitle('abc'))
    await userEvent.click(dropDowns[1]) //Role
    await userEvent.click(screen.getByTitle('Network Admin'))
    const chkBox = await screen.findByLabelText('I understand and agree')
    userEvent.click(chkBox)
    const saveBtn = screen.getByText('Invite')
    expect(saveBtn).toBeEnabled()
    await userEvent.click(saveBtn)
    expect(mockedToggleDrawer).toBeCalledWith(false)
    expect(showToast).toHaveBeenCalledWith({
      type: 'success',
      content: 'User invited successfully'
    })
  })
  it('should handle error in find 3rd party user', async () => {
    const props = {
      opened: true,
      selectedRow: null,
      toggleDrawer: mockedToggleDrawer
    }
    mockedFindUser.mockImplementationOnce(() => ({
      unwrap: () => Promise.reject({ data: { error: 'user not found' } })
    }))
    render(
      <Provider><UserDrawer {...props} type='invite3rdParty' /></Provider>,
      { route: {} }
    )
    expect(await screen.findByText('Invite 3rd Party')).toBeVisible()
    const info = await screen.findByTestId('InformationOutlined')
    fireEvent.mouseOver(info)
    expect(await screen.findByText((content, element) => {
      return element?.tagName.toLowerCase() === 'div'
        && content.startsWith('Invite a 3rd Party user')
    })).toBeInTheDocument()
    const emailInput = await screen.findByPlaceholderText('Enter an email')
    await(userEvent.type(emailInput, 'dog@email.com'))
    const dropDowns = screen.getAllByRole('combobox')
    await userEvent.click(dropDowns[0]) //RG
    await userEvent.click(screen.getByTitle('abc'))
    await userEvent.click(dropDowns[1]) //Role
    await userEvent.click(screen.getByTitle('Network Admin'))
    const chkBox = await screen.findByLabelText('I understand and agree')
    userEvent.click(chkBox)
    const saveBtn = screen.getByText('Invite')
    expect(saveBtn).toBeEnabled()
    await userEvent.click(saveBtn)
    expect(showToast).toHaveBeenCalledWith({
      type: 'error',
      content: 'Error: user not found'
    })
    expect(mockedInviteUser).not.toHaveBeenCalled()
    expect(mockedToggleDrawer).not.toHaveBeenCalled()
  })
  it('should handle error in invite 3rd party user', async () => {
    const props = {
      opened: true,
      selectedRow: null,
      toggleDrawer: mockedToggleDrawer
    }
    mockedInviteUser.mockImplementationOnce(() => ({
      unwrap: () => Promise.reject({ data: JSON.stringify({ error: 'user already exists' }) })
    }))
    mockedFindUser.mockImplementationOnce(() => ({
      unwrap: () => Promise.resolve({ userId: '123' })
    }))
    render(
      <Provider><UserDrawer {...props} type='invite3rdParty' /></Provider>,
      { route: {} }
    )
    expect(await screen.findByText('Invite 3rd Party')).toBeVisible()
    const info = await screen.findByTestId('InformationOutlined')
    fireEvent.mouseOver(info)
    expect(await screen.findByText((content, element) => {
      return element?.tagName.toLowerCase() === 'div'
        && content.startsWith('Invite a 3rd Party user')
    })).toBeInTheDocument()
    const emailInput = await screen.findByPlaceholderText('Enter an email')
    await(userEvent.type(emailInput, 'dog@email.com'))
    const dropDowns = screen.getAllByRole('combobox')
    await userEvent.click(dropDowns[0]) //RG
    await userEvent.click(screen.getByTitle('abc'))
    await userEvent.click(dropDowns[1]) //Role
    await userEvent.click(screen.getByTitle('Network Admin'))
    const chkBox = await screen.findByLabelText('I understand and agree')
    userEvent.click(chkBox)
    const saveBtn = screen.getByText('Invite')
    expect(saveBtn).toBeEnabled()
    await userEvent.click(saveBtn)
    expect(showToast).toHaveBeenCalledWith({
      type: 'error',
      content: 'Error: user already exists'
    })
    expect(mockedToggleDrawer).not.toHaveBeenCalled()
  })
  it('should handle validations for invite 3rd party user', async () => {
    const props = {
      opened: true,
      selectedRow: null,
      toggleDrawer: mockedToggleDrawer
    }
    render(
      <Provider><UserDrawer {...props} type='invite3rdParty' /></Provider>,
      { route: {} }
    )
    expect(await screen.findByText('Invite 3rd Party')).toBeVisible()
    const info = await screen.findByTestId('InformationOutlined')
    fireEvent.mouseOver(info)
    expect(await screen.findByText((content, element) => {
      return element?.tagName.toLowerCase() === 'div'
        && content.startsWith('Invite a 3rd Party user')
    })).toBeInTheDocument()
    const emailInput = await screen.findByPlaceholderText('Enter an email')
    await(userEvent.type(emailInput, 'ddd')) //invalid email
    const dropDowns = screen.getAllByRole('combobox')
    await userEvent.click(dropDowns[0]) //RG
    await userEvent.click(screen.getByTitle('abc'))
    await userEvent.click(dropDowns[1]) //Role
    await userEvent.click(screen.getByTitle('Network Admin'))
    const chkBox = await screen.findByLabelText('I understand and agree')
    userEvent.click(chkBox)
    const saveBtn = screen.getByText('Invite')
    expect(saveBtn).toBeEnabled()
    await userEvent.click(saveBtn)
    expect(mockedFindUser).not.toHaveBeenCalled()
    expect(mockedToggleDrawer).not.toHaveBeenCalled()
    userEvent.click(chkBox) // uncheck
    expect(await screen.findByText('Should accept agreement')).toBeVisible()
  })
})