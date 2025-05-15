import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { ToastProps }                                                                                         from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                                           from '@acx-ui/feature-toggle'
import { MspAdministrator, MspEcData, MspEcDelegatedAdmins, MspRbacUrlsInfo, MspUrlsInfo, SupportDelegation } from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo, PrivilegeGroup }                                                             from '@acx-ui/rc/utils'
import { Provider }                                                                                           from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor }                                                     from '@acx-ui/test-utils'
import { RolesEnum }                                                                                          from '@acx-ui/types'

import { AddRecCustomer } from './AddRecCustomer'

const userProfile =
    {
      adminId: '9b85c591260542c188f6a12c62bb3912',
      companyName: 'msp.eleu1658',
      dateFormat: 'mm/dd/yyyy',
      detailLevel: 'debug',
      email: 'msp.eleu1658@mail.com',
      externalId: '0032h00000gXuBNAA0',
      firstName: 'msp',
      lastName: 'eleu1658',
      role: 'PRIME_ADMIN',
      roles: ['DEVOPS', 'PRIME_ADMIN', 'VAR_ADMIN'],
      support: false,
      tenantId: '3061bd56e37445a8993ac834c01e2710',
      username: 'msp.eleu1658@rwbigdog.com',
      var: true,
      varTenantId: '3061bd56e37445a8993ac834c01e2710'
    }

const mspEcAccount: MspEcData =
    {
      name: 'mspeleu',
      street_address: '123 Main Street',
      is_active: 'true'
    }

const administrators: MspAdministrator[] = [
  {
    id: 'id1',
    lastName: 'Smith',
    name: 'John',
    email: 'johnsmith@mail.com',
    role: RolesEnum.PRIME_ADMIN,
    detailLevel: 'detaillevel'
  }
]

const delegatedAdmins: MspEcDelegatedAdmins[] = [
  {
    msp_admin_id: 'id1',
    msp_admin_role: RolesEnum.PRIME_ADMIN
  }
]

const list = {
  fields: [
    'tenantType',
    'name',
    'id'
  ],
  totalCount: 10,
  page: 1,
  data: [
    {
      id: 'c2460ba1fc2f419d84986580be9f2c31',
      name: 'Test',
      entitlements: [],
      tenantType: 'MSP_INTEGRATOR',
      assignedMspEcList: [
        '1576b79db6b549f3b1f3a7177d7d4ca5'
      ]
    }
  ]
}

const ecSupport: SupportDelegation[] = [
  {
    id: '',
    type: '',
    status: '',
    createdDate: '',
    delegatedBy: '',
    delegatedTo: '',
    delegatedToName: '',
    expiryDate: '',
    updatedDate: ''
  }
]

const recList = {
  totalElements: 24,
  totalPages: 1,
  number: 0,
  parent_account_name: 'arsene.var',
  child_accounts: [
    {
      account_name: 'Aloft Lexington',
      account_id: '0012J00002ZKO5FQAX',
      billing_city: 'Miami',
      billing_country: 'United States',
      billing_postal_code: '33172',
      billing_state: 'FL',
      billing_street: '11275 Northwest 12th Street,'
    },
    {
      account_name: 'Springhill Suites Las Vegas',
      account_id: '0012J00002ZKO68QAH',
      billing_city: 'Milpitas',
      billing_country: 'United States',
      billing_postal_code: '95035',
      billing_state: 'CA',
      billing_street: '1480 Falcon Drive'
    }
  ]
}

const fakedPrivilegeGroupList =
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
    },
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8914',
      name: 'OFFICE_ADMIN',
      description: 'Guest Manager',
      roleName: 'OFFICE_ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8915',
      name: 'DPSK_ADMIN',
      description: 'DPSK Manager',
      roleName: 'DPSK_ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '99bb7b958a5544898cd0b938fa800a5a',
      name: 'wi-fi privilege group',
      description: 'privilege group for wi-fi',
      roleName: 'new wi-fi custom role',
      type: 'Custom',
      delegation: false,
      allCustomers: false
    }
  ]

const services = require('@acx-ui/msp/services')
const rcServices = require('@acx-ui/rc/services')
const utils = require('@acx-ui/rc/utils')
const mockedShowToast = jest.fn()
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: (config: ToastProps) => mockedShowToast(config)
}))
const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const user = require('@acx-ui/user')

describe('AddRecCustomer', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })
  let params: { tenantId: string, mspEcTenantId: string, action: string, status?: string }
  beforeEach(async () => {
    const emptyPGList: PrivilegeGroup[] = []
    rcServices.useGetMspEcDelegatePrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
      return { data: emptyPGList }
    })
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({ global: {
          mapRegion: 'TW'
        } }))
      ),
      rest.post(
        MspUrlsInfo.addMspEcAccount.url,
        (_req, res, ctx) => res(ctx.json({ requestId: 'add' }))
      ),
      rest.post(
        MspUrlsInfo.addMspRecCustomer.url,
        (_req, res, ctx) => res(ctx.json({ requestId: 'add' }))
      ),
      rest.post(
        MspUrlsInfo.enableMspEcSupport.url,
        (_req, res, ctx) => res(ctx.json({ requestId: 'enable' }))
      ),
      rest.delete(
        MspUrlsInfo.disableMspEcSupport.url,
        (_req, res, ctx) => res(ctx.json({ requestId: 'disable' }))
      ),
      rest.put(
        MspUrlsInfo.updateMspEcDelegatedAdmins.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.post(
        MspUrlsInfo.addBrandCustomers.url,
        (_req, res, ctx) => res(ctx.json({ requestId: 'add' }))
      ),
      rest.put(
        MspRbacUrlsInfo.updateMspEcDelegatedAdmins.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )

    jest.spyOn(services, 'useAddCustomerMutation')
    jest.spyOn(services, 'useAddRecCustomerMutation')
    jest.spyOn(services, 'useUpdateCustomerMutation')
    jest.spyOn(services, 'useEnableMspEcSupportMutation')
    jest.spyOn(services, 'useDisableMspEcSupportMutation')
    jest.spyOn(services, 'useUpdateMspEcDelegatedAdminsMutation')
    jest.spyOn(services, 'useAddBrandCustomersMutation')
    rcServices.useGetPrivilegeGroupsWithAdminsQuery = jest.fn().mockImplementation(() => {
      return { data: fakedPrivilegeGroupList }
    })
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    services.useGetAvailableMspRecCustomersQuery = jest.fn().mockImplementation(() => {
      return { data: recList }
    })
    services.useGetMspEcQuery = jest.fn().mockImplementation(() => {
      return { data: mspEcAccount }
    })
    services.useMspAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: administrators }
    })
    services.useGetMspEcDelegatedAdminsQuery = jest.fn().mockImplementation(() => {
      return { data: delegatedAdmins }
    })
    services.useGetMspEcSupportQuery = jest.fn().mockImplementation(() => {
      return { data: ecSupport }
    })
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })

    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710',
      mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
      action: 'add'
    }
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render correctly for add', async () => {
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add Brand Property Account')).toBeVisible()

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Start service in' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    expect(screen.getByRole('button', { name: 'Add' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()

  })
  it('should render correctly for edit', async () => {
    params.action = 'edit'
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    expect(screen.queryByText('Add Customer Account')).toBeNull()

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()

    expect(screen.getByText('Test')).toBeVisible()
  })
  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    expect(await screen.findByText('My Customers')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Brand Properties'
    })).toBeVisible()
  })
  it('should enable/disable support correctly', async () => {
    params.action = 'edit'
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    // Disable support
    await userEvent.click(screen.getByRole('switch'))

    const disableValue: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: 'disable' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(services.useDisableMspEcSupportMutation).toHaveLastReturnedWith(disableValue)
    })
    // Should show toast
    await waitFor(() => {
      expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({
        content: 'EC support disabled',
        type: 'success'
      }))
    })

    // Enable support
    await userEvent.click(screen.getByRole('switch'))

    const enableValue: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: 'enable' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(services.useEnableMspEcSupportMutation).toHaveLastReturnedWith(enableValue)
    })
    // Should show toast
    await waitFor(() => {
      expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({
        content: 'EC support enabled',
        type: 'success'
      }))
    })
  })
  it('should not save for edit', async () => {
    params.action = 'edit'
    services.useGetMspEcSupportQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByRole('switch'))

    // Assert api was not called
    await waitFor(() => {
      expect(services.useUpdateCustomerMutation).not.toHaveBeenCalled()
    })
  })
  it('should save correctly for add for data with administrator', async () => {
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    // Select customers
    await userEvent.click(screen.getAllByText('Manage')[0])
    await screen.findByText('Manage Brand Property')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage Brand Property')).toBeNull()
    })

    // Select adminstrators
    await userEvent.click(screen.getAllByText('Manage')[1])
    await screen.findByText('Manage MSP Administrators')
    await screen.findByRole('button', { name: 'Save' })

    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage MSP Administrators')).toBeNull()
    })

    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(services.useAddRecCustomerMutation).toHaveBeenCalled()
    })
  })
  it('should save correctly for add for data with integrator', async () => {
    const installerList = { ...list }
    installerList.data[0].tenantType = 'MSP_INTEGRATOR'
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: installerList }
    })
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    // Select customers
    await userEvent.click(screen.getAllByText('Manage')[0])
    await screen.findByText('Manage Brand Property')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage Brand Property')).toBeNull()
    })

    // Select integrators
    await userEvent.click(screen.getAllByText('Manage')[2])
    await screen.findByText('Manage Integrator')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage Integrator')).toBeNull()
    })

    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(services.useAddRecCustomerMutation).toHaveBeenCalled()
    })
  })
  it('should save correctly for add for data with installer', async () => {
    const installerList = { ...list }
    installerList.data[0].tenantType = 'MSP_INSTALLER'
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: installerList }
    })
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    // Select customers
    await userEvent.click(screen.getAllByText('Manage')[0])
    await screen.findByText('Manage Brand Property')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage Brand Property')).toBeNull()
    })

    // Select installers
    await userEvent.click(screen.getAllByText('Manage')[3])
    await screen.findByText('Manage Installer')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage Installer')).toBeNull()
    })

    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(services.useAddRecCustomerMutation).toHaveBeenCalled()
    })
  })
  it('should save correctly for add for data with no installer nor integrator', async () => {
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    // Select customers
    await userEvent.click(screen.getAllByText('Manage')[0])
    await screen.findByText('Manage Brand Property')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage Brand Property')).toBeNull()
    })

    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(services.useAddRecCustomerMutation).toHaveBeenCalled()
    })
  })
  it('cancel should correctly close', async () => {
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/dashboard/mspreccustomers`,
      hash: '',
      search: ''
    })
  })
  it('should show Brand properties instead of ruckus end customer', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_HSP_SUPPORT)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add Brand Property Account')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Brand Properties'
    })).toBeVisible()

    await userEvent.click(screen.getAllByText('Manage')[0])
    await screen.findByText('Manage Brand Property')
  })
  it('should save correctly for multiple property add', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.MSP_MULTI_PROPERTY_CREATION_TOGGLE)
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    // Select customers
    await userEvent.click(screen.getAllByText('Manage')[0])
    await screen.findByText('Manage Brand Property')
    await screen.findByRole('button', { name: 'Save' })

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
    await userEvent.click(checkboxes.at(1)!)
    await userEvent.click(checkboxes.at(2)!)
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage Brand Property')).toBeNull()
    })

    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(services.useAddBrandCustomersMutation).toHaveBeenCalled()
    })
  })
  it('should save correctly for add for abac and rbac enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.ABAC_POLICIES_TOGGLE
      || ff === Features.RBAC_PHASE2_TOGGLE
    )
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    // Select customers
    await userEvent.click(screen.getAllByText('Manage')[0])
    await screen.findByText('Manage Brand Property')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage Brand Property')).toBeNull()
    })

    // Select adminstrators
    await userEvent.click(screen.getAllByText('Manage')[1])
    await screen.findByText('Manage MSP Delegations')
    await screen.findByRole('button', { name: 'Save' })

    expect(screen.getByText('1 selected')).toBeVisible()
    await userEvent.click(screen.getByRole('tab', { name: 'Privilege Groups' }))
    await userEvent.click(screen.getByText('wi-fi privilege group'))
    expect(await screen.findByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage MSP Delegations')).toBeNull()
    })

    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(services.useAddRecCustomerMutation).toHaveBeenCalled()
    })
  })
  it('should save correctly for add for abac enabled and rbac not enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.ABAC_POLICIES_TOGGLE)
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    // Select customers
    await userEvent.click(screen.getAllByText('Manage')[0])
    await screen.findByText('Manage Brand Property')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage Brand Property')).toBeNull()
    })

    // Select adminstrators
    await userEvent.click(screen.getAllByText('Manage')[1])
    await screen.findByText('Manage MSP Users')
    await screen.findByRole('button', { name: 'Assign' })

    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Assign' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Assign' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage MSP Users')).toBeNull()
    })

    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(services.useAddRecCustomerMutation).toHaveBeenCalled()
    })
  })
})
