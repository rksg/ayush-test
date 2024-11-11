import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspAdministrator, MspEcDelegatedAdmins, MspRbacUrlsInfo } from '@acx-ui/msp/utils'
import { Provider }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }             from '@acx-ui/test-utils'
import { RolesEnum }                                               from '@acx-ui/types'
import { AccountType }                                             from '@acx-ui/utils'

import { ManageMspDelegationDrawer } from '.'

const administrators: MspAdministrator[] = [
  {
    id: 'id1',
    lastName: 'Smith',
    name: 'John',
    email: 'johnsmith@mail.com',
    role: RolesEnum.PRIME_ADMIN,
    detailLevel: 'detaillevel'
  },
  {
    id: 'id2',
    lastName: 'Smith',
    name: 'Jane',
    email: 'janesmith@mail.com',
    role: RolesEnum.GUEST_MANAGER,
    detailLevel: 'detaillevel'
  }
]

const delegatedAdmins: MspEcDelegatedAdmins[] = [
  {
    msp_admin_id: 'id1',
    msp_admin_role: RolesEnum.PRIME_ADMIN
  }
]
const privilegeGroups = [{
  allCustomers: false,
  allVenues: true,
  delegation: false,
  id: '94c62cd769004b9b81516edee71aa7f0',
  memberCount: 0,
  name: 'admin-test',
  type: 'Custom',
  roleName: 'ADMIN',
  roleId: '1765e98c7b9446e2a5bdd4720e0e8911',
  admins: [{
    id: 'de57f509888e4345921cd59a257085f8',
    email: 'mspReadOnly@mail.com',
    delegateToAllECs: true,
    detailLevel: 'debug'
  }]
},
{
  allCustomers: true,
  allVenues: true,
  delegation: true,
  id: 'b508d86ed2c5474cb309cde10951d7f5',
  memberCount: 2,
  name: 'For-All-Customers',
  type: 'Custom',
  roleName: 'custom role 1 for wi-fi',
  roleId: 'e5e3c5cec88841d7b7fde2982334e35d',
  admins: [{
    id: 'de57f509888e4345921cd59a257085f8',
    email: 'mspReadOnly@mail.com',
    delegateToAllECs: true,
    detailLevel: 'debug'
  }]
}]

const ecPrivilegeGroups = [{
  id: '1ce666232f874d6388f399ef97871c3e',
  name: 'For-All-Customers',
  roleId: 'e5e3c5cec88841d7b7fde2982334e35d',
  roleName: 'custom role 1 for wi-fi',
  type: 'Custom',
  delegation: false,
  memberCount: 2,
  allCustomers: false,
  allVenues: true,
  parentPrivilegeGroupId: 'b508d86ed2c5474cb309cde10951d7f5',
  admins: [
    {
      id: 'd96fa9c594b14aab853935f3eaf4000c',
      email: '2@a.com',
      delegateToAllECs: true,
      detailLevel: 'debug'
    },
    {
      id: 'e35571bd1a64441b8c6f3ed55b4dc3ec',
      email: 'testdelegation@email.com',
      delegateToAllECs: true,
      detailLevel: 'debug'
    }
  ]
}]

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
const rcServices = require('@acx-ui/rc/services')
const mockedsetDrawerVisible = jest.fn()
const mockedsetSelectedUsers = jest.fn()
const mockedsetSelectedPrivilegeGroups = jest.fn()


describe('ManageMspDelegations', () => {
  let params: { tenantIds: string[] }
  beforeEach(async () => {
    mockServer.use(
      rest.put(
        MspRbacUrlsInfo.updateMspEcDelegations.url,
        (_req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.patch(
        MspRbacUrlsInfo.updateMspMultipleEcDelegations.url,
        (_req, res, ctx) => res(ctx.json({ requestId: '456' }))
      )
    )

    jest.spyOn(services, 'useUpdateMspEcDelegationsMutation')
    jest.spyOn(services, 'useUpdateMspMultipleEcDelegationsMutation')
    services.useMspAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: administrators }
    })
    services.useGetMspEcDelegatedAdminsQuery = jest.fn().mockImplementation(() => {
      return { data: delegatedAdmins }
    })
    rcServices.useGetPrivilegeGroupsWithAdminsQuery = jest.fn().mockImplementation(() => {
      return { data: privilegeGroups, isLoading: false, isFetching: false }
    })
    rcServices.useGetMspEcDelegatePrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
      return { data: ecPrivilegeGroups, isLoading: false, isFetching: false }
    })

    params = {
      tenantIds: ['3061bd56e37445a8993ac834c01e2710','1576b79db6b549f3b1f3a7177d7d4ca5']
    }
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render correctly for add', async () => {
    render(
      <Provider>
        <ManageMspDelegationDrawer
          setVisible={mockedsetDrawerVisible}
          visible={true}
          setSelectedUsers={mockedsetSelectedUsers}
          setSelectedPrivilegeGroups={mockedsetSelectedPrivilegeGroups}
        />
      </Provider>, {
        route: { params: { tenantId: params.tenantIds[0] } }
      })

    expect(screen.getByText('Manage MSP Delegations')).toBeVisible()

    expect(screen.getByRole('tab', { name: 'Users' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Privilege Groups' })).toBeVisible()

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()

    // Assert users tab
    expect(await screen.findByText('johnsmith@mail.com')).toBeVisible()
    expect(await screen.findByText('janesmith@mail.com')).toBeVisible()
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    expect(screen.getByText('1 selected')).toBeVisible()

    // Assert privilege groups tab
    await userEvent.click(screen.getByRole('tab', { name: 'Privilege Groups' }))
    expect(await screen.findByText('admin-test')).toBeVisible()
    expect(await screen.findByText('For-All-Customers')).toBeVisible()
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    // eslint-disable-next-line max-len
    const disabledRow = screen.getByRole('row', { name: 'For-All-Customers mspReadOnly@mail.com' })
    expect(within(disabledRow).getByRole('checkbox')).toBeDisabled()
    expect(within(disabledRow).getByRole('checkbox')).toBeChecked()
    expect(screen.queryByText('1 selected')).toBeVisible()
    expect(screen.queryByText('johnsmith@mail.com')).toBeNull()
  })
  it('should render correctly for add for tech partner', async () => {
    render(
      <Provider>
        <ManageMspDelegationDrawer
          setVisible={mockedsetDrawerVisible}
          visible={true}
          setSelectedUsers={mockedsetSelectedUsers}
          setSelectedPrivilegeGroups={mockedsetSelectedPrivilegeGroups}
          tenantType={AccountType.MSP_INTEGRATOR}
        />
      </Provider>, {
        route: { params: { tenantId: params.tenantIds[0] } }
      })

    expect(screen.getByText('Manage Tech Partner Delegations')).toBeVisible()

    expect(screen.queryByRole('tab', { name: 'Users' })).toBeVisible()
    expect(screen.queryByRole('tab', { name: 'Privilege Groups' })).toBeVisible()

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()

    // Assert users tab
    expect(await screen.findByText('johnsmith@mail.com')).toBeVisible()
    expect(await screen.findByText('janesmith@mail.com')).toBeVisible()
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)

    // Assert privilege groups tab
    await userEvent.click(screen.getByRole('tab', { name: 'Privilege Groups' }))
    expect(await screen.findByText('admin-test')).toBeVisible()
    expect(await screen.findByText('For-All-Customers')).toBeVisible()
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    // eslint-disable-next-line max-len
    const disabledRow = screen.getByRole('row', { name: 'For-All-Customers mspReadOnly@mail.com' })
    expect(within(disabledRow).getByRole('checkbox')).toBeDisabled()
    expect(screen.queryByText('johnsmith@mail.com')).toBeNull()
  })
  it('should close correctly on cancel', async () => {
    render(
      <Provider>
        <ManageMspDelegationDrawer
          setVisible={mockedsetDrawerVisible}
          visible={true}
          setSelectedUsers={mockedsetSelectedUsers}
          setSelectedPrivilegeGroups={mockedsetSelectedPrivilegeGroups}
        />
      </Provider>, {
        route: { params: { tenantId: params.tenantIds[0] } }
      })

    expect(screen.getByText('Manage MSP Delegations')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(mockedsetDrawerVisible).toHaveBeenCalledWith(false)
    })
  })
  it('should save correctly for add', async () => {
    render(
      <Provider>
        <ManageMspDelegationDrawer
          setVisible={mockedsetDrawerVisible}
          visible={true}
          setSelectedUsers={mockedsetSelectedUsers}
          setSelectedPrivilegeGroups={mockedsetSelectedPrivilegeGroups}
        />
      </Provider>, {
        route: { params: { tenantId: params.tenantIds[0] } }
      })

    expect(screen.getByText('Manage MSP Delegations')).toBeVisible()

    expect(screen.getByText('1 selected')).toBeVisible()
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    expect(screen.queryByText('1 selected')).toBeNull()

    await userEvent.click(screen.getByRole('tab', { name: 'Privilege Groups' }))
    await userEvent.click(await screen.getAllByRole('checkbox')[0])
    expect(screen.queryByText('1 selected')).toBeNull()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(mockedsetSelectedUsers).toHaveBeenCalledWith([])
    const pgArray = expect.arrayContaining(privilegeGroups)
    expect(mockedsetSelectedPrivilegeGroups).toHaveBeenCalledWith(pgArray)
    expect(mockedsetDrawerVisible).toHaveBeenCalledWith(false)
  })
  it('should save correctly for edit', async () => {
    render(
      <Provider>
        <ManageMspDelegationDrawer
          setVisible={mockedsetDrawerVisible}
          visible={true}
          tenantIds={[params.tenantIds[0]]}
          setSelectedUsers={mockedsetSelectedUsers}
          selectedUsers={[]}
          setSelectedPrivilegeGroups={mockedsetSelectedPrivilegeGroups}
          selectedPrivilegeGroups={[privilegeGroups[0]]}
        />
      </Provider>, {
        route: { params: { tenantId: params.tenantIds[0] } }
      })

    expect(screen.getByText('Manage MSP Delegations')).toBeVisible()

    expect(screen.queryByText('1 selected')).toBeVisible()

    await userEvent.click(screen.getByRole('tab', { name: 'Privilege Groups' }))
    expect(await screen.findByText('1 selected')).toBeVisible()
    await userEvent.click(await screen.getAllByRole('checkbox')[0])
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]

    await waitFor(() =>
      expect(services.useUpdateMspEcDelegationsMutation).toHaveReturnedWith(value))
    await waitFor(() => expect(mockedsetSelectedUsers).toHaveBeenCalledWith([administrators[0]]))
    await waitFor(() => expect(mockedsetSelectedPrivilegeGroups)
      .toHaveBeenCalledWith(ecPrivilegeGroups))
    expect(mockedsetDrawerVisible).toHaveBeenCalledTimes(3)
    expect(mockedsetDrawerVisible).toHaveBeenCalledWith(false)
  })
  it('should save correctly for edit with given selected users', async () => {
    render(
      <Provider>
        <ManageMspDelegationDrawer
          setVisible={mockedsetDrawerVisible}
          visible={true}
          tenantIds={[params.tenantIds[0]]}
          setSelectedUsers={mockedsetSelectedUsers}
          selectedUsers={[administrators[0]]}
          setSelectedPrivilegeGroups={mockedsetSelectedPrivilegeGroups}
          selectedPrivilegeGroups={[]}
        />
      </Provider>, {
        route: { params: { tenantId: params.tenantIds[0] } }
      })

    expect(screen.getByText('Manage MSP Delegations')).toBeVisible()

    expect(screen.queryByText('1 selected')).toBeVisible()
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByText('Read Only'))

    await userEvent.click(screen.getByRole('tab', { name: 'Privilege Groups' }))
    await userEvent.click(await screen.getAllByRole('checkbox')[0])
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    const updatedAdministrators = [{ ...administrators[0], role: RolesEnum.READ_ONLY }]

    await waitFor(() =>
      expect(services.useUpdateMspEcDelegationsMutation).toHaveReturnedWith(value))
    await waitFor(() => expect(mockedsetSelectedUsers).toHaveBeenCalledWith(updatedAdministrators))
    await waitFor(() =>
      expect(mockedsetSelectedPrivilegeGroups).toHaveBeenCalledWith(ecPrivilegeGroups))
    expect(mockedsetDrawerVisible).toHaveBeenCalledTimes(3)
    expect(mockedsetDrawerVisible).toHaveBeenCalledWith(false)
  })
  it('should save correctly for edit multiple', async () => {
    render(
      <Provider>
        <ManageMspDelegationDrawer
          setVisible={mockedsetDrawerVisible}
          visible={true}
          tenantIds={params.tenantIds}
          setSelectedUsers={mockedsetSelectedUsers}
          setSelectedPrivilegeGroups={mockedsetSelectedPrivilegeGroups}
        />
      </Provider>, {
        route: { params: { tenantId: params.tenantIds[0] } }
      })

    expect(screen.getByText('Manage MSP Delegations')).toBeVisible()

    expect(screen.queryByText('1 selected')).toBeVisible()
    const userRow = screen.getByRole('row', { name: 'John johnsmith@mail.com Prime Admin' })
    await userEvent.click(userRow)
    expect(screen.queryByText('1 selected')).toBeNull()

    await userEvent.click(screen.getByRole('tab', { name: 'Privilege Groups' }))
    await userEvent.click(screen.getByText('admin-test'))
    expect(screen.queryByText('2 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '456' },
      status: 'fulfilled'
    })]

    await waitFor(() =>
      expect(services.useUpdateMspMultipleEcDelegationsMutation).toHaveReturnedWith(value))
    await waitFor(() => expect(mockedsetSelectedUsers).toHaveBeenCalledWith([]))
    const pgArray = expect.arrayContaining(privilegeGroups)
    await waitFor(() =>
      expect(mockedsetSelectedPrivilegeGroups).toHaveBeenCalledWith(pgArray))
    expect(mockedsetDrawerVisible).toHaveBeenCalledTimes(3)
    expect(mockedsetDrawerVisible).toHaveBeenCalledWith(false)
  })
})
