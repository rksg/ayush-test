import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { ToastProps }                                                                        from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                          from '@acx-ui/feature-toggle'
import { MspAdministrator, MspEcData, MspEcDelegatedAdmins, MspUrlsInfo, SupportDelegation } from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo }                                                            from '@acx-ui/rc/utils'
import { Provider }                                                                          from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor }                                    from '@acx-ui/test-utils'
import { RolesEnum }                                                                         from '@acx-ui/types'
import { UserUrlsInfo }                                                                      from '@acx-ui/user'

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

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
const utils = require('@acx-ui/rc/utils')
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils')
}))
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

describe('AddRecCustomer', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })
  let params: { tenantId: string, mspEcTenantId: string, action: string, status?: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        UserUrlsInfo.getUserProfile.url,
        (req, res, ctx) => res(ctx.json(userProfile))
      ),
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
      )
    )

    jest.spyOn(services, 'useAddCustomerMutation')
    jest.spyOn(services, 'useAddRecCustomerMutation')
    jest.spyOn(services, 'useUpdateCustomerMutation')
    jest.spyOn(services, 'useEnableMspEcSupportMutation')
    jest.spyOn(services, 'useDisableMspEcSupportMutation')
    jest.spyOn(services, 'useUpdateMspEcDelegatedAdminsMutation')
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

    expect(screen.getByText('Add RUCKUS End Customer Account')).toBeVisible()

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
      name: 'RUCKUS End Customers'
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
    await screen.findByText('Manage RUCKUS End Customer')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage RUCKUS End Customer')).toBeNull()
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
    await screen.findByText('Manage RUCKUS End Customer')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage RUCKUS End Customer')).toBeNull()
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
    await screen.findByText('Manage RUCKUS End Customer')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage RUCKUS End Customer')).toBeNull()
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
    await screen.findByText('Manage RUCKUS End Customer')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage RUCKUS End Customer')).toBeNull()
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

})
