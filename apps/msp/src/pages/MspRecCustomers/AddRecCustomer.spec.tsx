import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { ToastProps }                                                                from '@acx-ui/components'
import { useIsSplitOn }                                                              from '@acx-ui/feature-toggle'
import { MspAdministrator, MspEcData, MspEcDelegatedAdmins, MspUrlsInfo }            from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo }                                                    from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitForElementToBeRemoved, waitFor } from '@acx-ui/test-utils'
import { RolesEnum }                                                                 from '@acx-ui/types'
import { UserUrlsInfo }                                                              from '@acx-ui/user'

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

const ecAdministrators: MspAdministrator[] = [
  {
    id: 'deb5d270540840adad117bb982c86429',
    email: 'newec@eee.com',
    name: 'first',
    lastName: 'last',
    role: RolesEnum.ADMINISTRATOR,
    delegateToAllECs: true,
    detailLevel: 'debug'
  }
]

// const ecSupport: SupportDelegation[] = [
//   {
//     id: '',
//     type: '',
//     status: '',
//     createdDate: '',
//     delegatedBy: '',
//     delegatedTo: '',
//     delegatedToName: '',
//     expiryDate: '',
//     updatedDate: ''
//   }
// ]

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
      )//,
    //   rest.put(
    //     MspUrlsInfo.updateMspEcAccount.url,
    //     (_req, res, ctx) => res(ctx.json({ requestId: 'update' }))
    //   ),
    //   rest.post(
    //     MspUrlsInfo.enableMspEcSupport.url,
    //     (_req, res, ctx) => res(ctx.json({ requestId: 'enable' }))
    //   ),
    //   rest.delete(
    //     MspUrlsInfo.disableMspEcSupport.url,
    //     (_req, res, ctx) => res(ctx.json({ requestId: 'disable' }))
    //   ),
    )

    jest.spyOn(services, 'useAddCustomerMutation')
    jest.spyOn(services, 'useUpdateCustomerMutation')
    // jest.spyOn(services, 'useEnableMspEcSupportMutation')
    // jest.spyOn(services, 'useDisableMspEcSupportMutation')
    services.useGetMspEcQuery = jest.fn().mockImplementation(() => {
      return { data: mspEcAccount }
    })
    services.useMspAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: administrators }
    })
    services.useGetMspEcDelegatedAdminsQuery = jest.fn().mockImplementation(() => {
      return { data: delegatedAdmins }
    })
    services.useMspEcAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: ecAdministrators }
    })
    // services.useGetMspEcSupportQuery = jest.fn().mockImplementation(() => {
    //   return { data: ecSupport }
    // })
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

    // expect(screen.getByPlaceholderText('Set address here')).toBeDisabled()
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

  //   it('should render correctly for trial edit mode', async () => {
  //     params.action = 'edit'
  //     params.status = 'Trial'
  //     render(
  //       <Provider>
  //         <AddRecCustomer />
  //       </Provider>, {
  //         route: { params }
  //       })

  //     expect(screen.queryByText('Add Customer Account')).toBeNull()
  //     expect(await screen.findByText('The account is in Trial Mode')).toBeVisible()
  //     expect(screen.getByRole('heading', { name: 'Subscriptions (Trial Mode)' })).toBeVisible()
  //     expect(screen.getAllByRole('button', { name: 'Start Subscription' })).toHaveLength(2)
  //     expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  //     expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
  //   })

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

  xit('should validate customer name correctly', async () => {
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspRecCustomers/create' }
      })

    expect(screen.getByPlaceholderText('Set address here')).toBeDisabled()
    expect(screen.queryByText('Please enter Customer Name')).toBeNull()

    // Click 'Next' button
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    // Should still be on first "Account Details" page due to invalid input
    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Start service in' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    // Validator alert should appear for invalid input
    expect(await screen.findByText('Please enter Customer Name')).toBeVisible()
  })

  xit('should validate email input correctly', async () => {
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    // Input valid values for other fields
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[4], { target: { value: 'Smith' } })
    expect(await screen.findByDisplayValue('Smith')).toBeVisible()
    fireEvent.change(inputs[0], { target: { value: 'JohnSmith' } })
    expect(await screen.findByDisplayValue('JohnSmith')).toBeVisible()
    fireEvent.change(inputs[3], { target: { value: 'John' } })
    expect(await screen.findByDisplayValue('John')).toBeVisible()


    // Input incorrect email
    fireEvent.change(inputs[2], { target: { value: 'john@mail' } })
    expect(await screen.findByDisplayValue('john@mail')).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    })

    // Assert alert shows up
    expect(await screen.findByRole('alert')).toBeVisible()
  })

  xit('should enable/disable support correctly', async () => {
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

  xit('should save correctly for add', async () => {
    render(
      <Provider>
        <AddRecCustomer />
      </Provider>, {
        route: { params }
      })

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[4], { target: { value: 'Smith' } })
    expect(await screen.findByDisplayValue('Smith')).toBeVisible()
    fireEvent.change(inputs[0], { target: { value: 'JohnSmith' } })
    expect(await screen.findByDisplayValue('JohnSmith')).toBeVisible()
    fireEvent.change(inputs[2], { target: { value: 'john@mail.com' } })
    expect(await screen.findByDisplayValue('john@mail.com')).toBeVisible()
    fireEvent.change(inputs[3], { target: { value: 'John' } })
    expect(await screen.findByDisplayValue('John')).toBeVisible()


    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.queryByRole('alert')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loading' }))
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await waitFor(() => {
      expect(screen.getByText('Start service in')).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Summary' })).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Add Customer' }))

    // Wait for form to finish
    await waitFor(() => {
      expect(screen.getAllByRole('textbox')[0]).toHaveValue('')
    })

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: 'add' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(services.useAddCustomerMutation).toHaveLastReturnedWith(value)
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/dashboard/mspreccustomers`,
      hash: '',
      search: ''
    }, { replace: true })
  })

})
