import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { ToastProps }                                                                        from '@acx-ui/components'
import { useIsSplitOn }                                                                      from '@acx-ui/feature-toggle'
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
  content: [
    {
      account_name: 'Aloft Lexington',
      account_id: '0012J00002ZKO5FQAX',
      email_id: 'msprec2@email.com'
    },
    {
      account_name: 'Springhill Suites Las Vegas',
      account_id: '0012J00002ZKO68QAH',
      email_id: 'msprec3@email.com'
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
jest.spyOn(services, 'useUpdateMspEcDelegatedAdminsMutation')
mockServer.use(
  rest.put(
    MspUrlsInfo.updateMspEcDelegatedAdmins.url,
    (req, res, ctx) => res(ctx.json({ requestId: '123' }))
  )
)

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
      //   rest.put(
      //     MspUrlsInfo.updateMspEcAccount.url,
      //     (_req, res, ctx) => res(ctx.json({ requestId: 'update' }))
      //   ),
      rest.post(
        MspUrlsInfo.enableMspEcSupport.url,
        (_req, res, ctx) => res(ctx.json({ requestId: 'enable' }))
      ),
      rest.delete(
        MspUrlsInfo.disableMspEcSupport.url,
        (_req, res, ctx) => res(ctx.json({ requestId: 'disable' }))
      )
    )

    jest.spyOn(services, 'useAddCustomerMutation')
    jest.spyOn(services, 'useAddRecCustomerMutation')
    jest.spyOn(services, 'useUpdateCustomerMutation')
    jest.spyOn(services, 'useEnableMspEcSupportMutation')
    jest.spyOn(services, 'useDisableMspEcSupportMutation')
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
    // services.useMspEcAdminListQuery = jest.fn().mockImplementation(() => {
    //   return { data: ecAdministrators }
    // })
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

    expect(screen.getByText('Add REC Customer Account')).toBeVisible()

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Start service in' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    expect(screen.getByRole('button', { name: 'Add' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()

  })

  xit('should render correctly for edit', async () => {
    params.action = 'edit'
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    expect(screen.queryByText('Add Customer Account')).toBeNull()

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()

    expect(screen.getByDisplayValue('123 Main Street')).toBeVisible()
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
      name: 'MSP REC Customers'
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

  xit('should save correctly for edit', async () => {
    params.action = 'edit'
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    const subscriptionInput = screen.getAllByRole('spinbutton')
    fireEvent.change(subscriptionInput[0], { target: { value: '1' } })
    expect(await screen.findByDisplayValue('1')).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    // Wait for form to finish
    await waitFor(() => {
      expect(screen.getAllByRole('textbox')[0]).toHaveValue('')
    })

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: 'update' },
      status: 'fulfilled'
    })]

    // Assert correct api and navigate were called
    await waitFor(() => {
      expect(services.useUpdateCustomerMutation).toHaveLastReturnedWith(value)
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/dashboard/mspreccustomers`,
      hash: '',
      search: ''
    }, { replace: true })


  })

  it('should save correctly for add for data with integrator', async () => {
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    // Select customers
    await userEvent.click(screen.getAllByText('Manage')[0])
    await screen.findByText('Manage Customer')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage Customer')).toBeNull()
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

    // Select integrators
    // await userEvent.click(screen.getAllByText('Manage')[2])
    // await screen.findByText('Manage Integrator')
    // await screen.findByRole('button', { name: 'Save' })

    // fireEvent.click(screen.getAllByRole('radio')[0])
    // expect(screen.getByText('1 selected')).toBeVisible()
    // expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    // fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    // await waitFor(() => {
    //   expect(screen.queryByText('Manage Integrator')).toBeNull()
    // })

    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    // Wait for form to finish
    // await waitFor(() => {
    //   expect(screen.getAllByRole('textbox')[0]).toHaveValue('')
    // })

    // screen.getByRole('test')

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: 'add' },
      status: 'fulfilled'
    })]

    // const add = screen.getByRole('button', { name: 'Add' })
    // await waitFor(() => {
    //   expect(add.getAttribute('ant-click-animating-without-extra-node')).not.toBeTruthy()
    // })

    await waitFor(() => {
      expect(services.useAddRecCustomerMutation).toHaveLastReturnedWith(value)
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/dashboard/mspreccustomers`,
      hash: '',
      search: ''
    }, { replace: true })

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
    await screen.findByText('Manage Customer')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage Customer')).toBeNull()
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

    // Wait for form to finish
    // await waitFor(() => {
    //   expect(screen.getAllByRole('textbox')[0]).toHaveValue('')
    // })

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: 'add' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(services.useAddRecCustomerMutation).toHaveLastReturnedWith(value)
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/dashboard/mspreccustomers`,
      hash: '',
      search: ''
    }, { replace: true })
  })
  xit('should save correctly for add for data with no installer nor integrator', async () => {
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
    await screen.findByText('Manage Customer')
    await screen.findByRole('button', { name: 'Save' })

    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText('1 selected')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByText('Manage Customer')).toBeNull()
    })

    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    // Wait for form to finish
    // await waitFor(() => {
    //   expect(screen.getAllByRole('textbox')[0]).toHaveValue('')
    // })

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: 'add' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(services.useAddRecCustomerMutation).toHaveLastReturnedWith(value)
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/dashboard/mspreccustomers`,
      hash: '',
      search: ''
    }, { replace: true })
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

})
