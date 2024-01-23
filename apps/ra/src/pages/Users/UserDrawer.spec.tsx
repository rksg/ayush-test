import userEvent from '@testing-library/user-event'

import {
  useGetAvailableUsersQuery,
  useGetResourceGroupsQuery,
  useUpdateUserMutation,
  useAddUserMutation
} from '@acx-ui/analytics/services'
import { ManagedUser }    from '@acx-ui/analytics/utils'
import { showToast }      from '@acx-ui/components'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'


import { UserDrawer } from './UserDrawer'

const mockedUserQuery = useGetAvailableUsersQuery as jest.Mock
const mockedRGQuery = useGetResourceGroupsQuery as jest.Mock
const mockedToggleDrawer = jest.fn()
const mockedAddUserMutation = useAddUserMutation as jest.Mock
const mockedEditUserMutation = useUpdateUserMutation as jest.Mock
const mockedAddUser = jest.fn()
const mockedUpdateUser = jest.fn()

jest.mock('@acx-ui/analytics/services', () => ({
  ...jest.requireActual('@acx-ui/analytics/services'),
  useGetAvailableUsersQuery: jest.fn(),
  useGetResourceGroupsQuery: jest.fn(),
  useAddUserMutation: jest.fn(),
  useUpdateUserMutation: jest.fn()
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))

describe('Available Users Selection', () => {
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
  })
  afterEach(() => {
    mockedUserQuery.mockClear()
    mockedRGQuery.mockClear()
    mockedToggleDrawer.mockClear()
    mockedAddUserMutation.mockClear()
    mockedEditUserMutation.mockClear()
  })
  it('should work correctly for create flow', async () => {
    const props = {
      opened: true,
      selectedRow: null,
      toggleDrawer: mockedToggleDrawer
    }
    mockedAddUser.mockImplementation(() => ({
      unwrap: () => Promise.resolve({})
    }))
    render(
      <Provider><UserDrawer {...props} type='create' /></Provider>,
      { route: {} }
    )
    expect(await screen.findByText('Create User')).toBeVisible()
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
      <Provider><UserDrawer {...props} type='create' /></Provider>,
      { route: {} }
    )
    expect(await screen.findByText('Create User')).toBeVisible()
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
})