import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  render,
  screen,
  waitFor,
  fireEvent,
  mockServer,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { RolesEnum } from '@acx-ui/types'

import { fakedPrivilegeGroupList } from '../__tests__/fixtures'

import { AddSsoGroupDrawer } from './AddSsoGroupDrawer'


const adminGroupData =
{
  id: '123',
  name: 'test group 1',
  groupId: 'groupId123',
  loggedMembers: 0,
  role: 'READ_ONLY' as RolesEnum,
  customRole: {
    id: '1765e98c7b9446e2a5bdd4720e0e8913',
    name: 'READ_ONLY' as RolesEnum
  }
}

const services = require('@acx-ui/rc/services')

describe('Add SSO Group Drawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetPrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
      return { data: fakedPrivilegeGroupList }
    })
    jest.spyOn(services, 'useAddAdminGroupsMutation')
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.addAdminGroups.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
    jest.spyOn(services, 'useUpdateAdminGroupsMutation')
    mockServer.use(
      rest.patch(
        AdministrationUrlsInfo.updateAdminGroups.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render add layout correctly', async () => {
    render(
      <Provider>
        <AddSsoGroupDrawer
          visible={true}
          isEditMode={false}
          setVisible={jest.fn()} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add SSO User Group')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add Group' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should render edit layout correctly', async () => {
    render(
      <Provider>
        <AddSsoGroupDrawer
          visible={true}
          isEditMode={true}
          setVisible={jest.fn()} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit SSO User Group')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should close correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <AddSsoGroupDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add SSO User Group')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedCloseDrawer).toHaveBeenCalledWith(false)
  })
  it('should validate group name correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <AddSsoGroupDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add SSO User Group')).toBeVisible()
    const input = screen.getByLabelText('Group Name')
    fireEvent.change(input, { target: { value: 'n' } })
    expect(await screen.findByText('Group Name must be at least 2 characters')).toBeVisible()
    fireEvent.change(input, { target: { value: 'name' } })
    await waitFor(() => {
      expect(screen.queryByText('Group Name must be at least 2 characters')).toBeNull()
    })
    fireEvent.change(input, { target: { value: '' } })
    await userEvent.click(screen.getByRole('button', { name: 'Add Group' }))
    expect(await screen.findByText('Please enter Group Name')).toBeVisible()
    expect(mockedCloseDrawer).not.toHaveBeenCalledWith(false)
  })
  it('should validate group id correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <AddSsoGroupDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add SSO User Group')).toBeVisible()
    const input = screen.getByLabelText('Group ID')
    fireEvent.change(input, { target: { value: '1' } })
    /* eslint-disable max-len */
    expect(await screen.findByText('Group ID must be at least 2 characters')).toBeVisible()
    fireEvent.change(input, { target: { value: '1A' } })
    await waitFor(() => {
      expect(screen.queryByText('Group ID must be at least 2 characters')).toBeNull()
    })
    fireEvent.change(input, { target: { value: '' } })
    await userEvent.click(screen.getByRole('button', { name: 'Add Group' }))
    expect(await screen.findByText('Please enter Group ID')).toBeVisible()
    expect(mockedCloseDrawer).not.toHaveBeenCalledWith(false)
  })
  it('should validate role correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <AddSsoGroupDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add SSO User Group')).toBeVisible()
    const input = screen.getByLabelText('Group Name')
    fireEvent.change(input, { target: { value: 'test' } })
    await userEvent.click(screen.getByRole('button', { name: 'Add Group' }))
    /* eslint-disable max-len */
    expect( await screen.findByText('Please enter Privilege Group')).toBeVisible()
    expect(mockedCloseDrawer).not.toHaveBeenCalledWith(false)
  })
  it('should save correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    const writeText = jest.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText
      }
    })

    render(
      <Provider>
        <AddSsoGroupDrawer
          visible={true}
          isEditMode={false}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add SSO User Group')).toBeVisible()
    const input = screen.getByLabelText('Group Name')
    fireEvent.change(input, { target: { value: 'testname' } })
    const inputGroupId = screen.getByLabelText('Group ID')
    fireEvent.change(inputGroupId, { target: { value: 'testGroupId' } })
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Privilege Group' }))
    await userEvent.click(screen.getAllByText('Prime Admin')[1])
    await userEvent.click(screen.getByRole('button', { name: 'Add Group' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loading' }))
    await waitFor(()=>
      expect(services.useAddAdminGroupsMutation).toHaveLastReturnedWith(value))
    await waitFor(() => {
      expect(mockedCloseDrawer).toHaveBeenLastCalledWith(false)
    })
  })
  it('should save edited group correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <AddSsoGroupDrawer
          visible={true}
          isEditMode={true}
          editData={adminGroupData}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit SSO User Group')).toBeVisible()
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Privilege Group' }))
    await userEvent.click(screen.getAllByText('Prime Admin')[1])
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '456' },
      status: 'fulfilled'
    })]
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loading' }))
    await waitFor(()=>
      expect(services.useUpdateAdminGroupsMutation).toHaveLastReturnedWith(value))
    await waitFor(() => {
      expect(mockedCloseDrawer).toHaveBeenLastCalledWith(false)
    })

  })
})
