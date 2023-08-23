import '@testing-library/jest-dom'
import userEvent      from '@testing-library/user-event'
import { Path, rest } from 'msw'

import { useIsSplitOn }                                           from '@acx-ui/feature-toggle'
import { MspUrlsInfo }                                            from '@acx-ui/msp/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, within, waitFor } from '@acx-ui/test-utils'
import { AccountType }                                            from '@acx-ui/utils'

import { MspCustomers } from '.'

const list = {
  totalCount: 3,
  page: 1,
  data: [
    {
      assignedMspEcList: [],
      creationDate: '1659589676020',
      entitlements: [
        {
          consumed: '0',
          entitlementDeviceType: 'DVCNWTYPE_WIFI',
          expirationDate: '2022-11-02T06:59:59Z',
          expirationDateTs: '1667372399000',
          quantity: '2',
          tenantId: '701fe9df5f6b4c17928a29851c07cc04',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '701fe9df5f6b4c17928a29851c07cc04',
      integrator: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'ec 111',
      status: 'Active',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC',
      wifiLicenses: 2,
      switchLicenses: 1,
      edgeLicenses: 1
    },
    {
      assignedMspEcList: [],
      creationDate: '',
      entitlements: [
        {
          consumed: '0',
          entitlementDeviceType: 'DVCNWTYPE_WIFI',
          expirationDate: '2022-11-02T06:59:59Z',
          expirationDateTs: '1667372399000',
          quantity: '0',
          tenantId: '701fe9df5f6b4c17928a29851c07cc05',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '701fe9df5f6b4c17928a29851c07cc05',
      installer: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspInstallerAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'ec 222',
      status: 'Active',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC',
      wifiLicenses: 2,
      accountType: 'TRIAL'
    },
    {
      assignedMspEcList: [],
      creationDate: '1659589676050',
      entitlements: [],
      id: '701fe9df5f6b4c17928a29851c07cc06',
      integrator: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspIntegratorAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'ec 333',
      status: 'Inactive',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC',
      wifiLicenses: 0
    }
  ]
}
const userProfile = {
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

const mspPortal = {
  msp_label: 'eleu1658'
}

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
const rcServices = require('@acx-ui/rc/services')
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services')
}))
const user = require('@acx-ui/user')
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user')
}))
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('MspCustomers', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetMspLabelQuery = jest.fn().mockImplementation(() => {
      return { data: mspPortal }
    })
    services.useMspAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: [] }
    })
    services.useGetMspEcDelegatedAdminsQuery = jest.fn().mockImplementation(() => {
      return { data: undefined }
    })
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: undefined }
    })
    jest.spyOn(services, 'useMspCustomerListQuery')
    jest.spyOn(services, 'useSupportMspCustomerListQuery')
    jest.spyOn(services, 'useIntegratorCustomerListQuery')
    jest.spyOn(services, 'useDeleteMspEcMutation')
    jest.spyOn(services, 'useDeactivateMspEcMutation')
    jest.spyOn(services, 'useReactivateMspEcMutation')
    mockServer.use(
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        MspUrlsInfo.getSupportMspCustomersList.url.split('?').at(0) as Path,
        (req, res, ctx) => res(ctx.json({ ...list }))
      ),
      rest.delete(
        MspUrlsInfo.deleteMspEcAccount.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'f638e92c-9d6f-45b2-a680-20047741ef2c' }))
      ),
      rest.post(
        MspUrlsInfo.deactivateMspEcAccount.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.post(
        MspUrlsInfo.reactivateMspEcAccount.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.post(
        MspUrlsInfo.getIntegratorCustomersList.url,
        (req, res, ctx) => res(ctx.json({ ...list }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render correctly', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(screen.getByText('MSP Customers')).toBeVisible()
    expect(screen.getByText('Manage My Account')).toBeVisible()
    expect(screen.getByText('Add Customer')).toBeVisible()

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = within(tbody).getAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })
  })
  it('should render breadcrumb correctly', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(await screen.findByText('My Customers')).toBeVisible()
  })
  it('should edit for selected trial account row', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 222/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    const editButton = screen.getByRole('button', { name: 'Edit' })
    fireEvent.click(editButton)

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/v/dashboard/mspcustomers/edit/Trial/${list.data.at(1)?.id}`,
      hash: '',
      search: ''
    })
  })
  it('should edit for selected paid account row', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    const editButton = screen.getByRole('button', { name: 'Edit' })
    fireEvent.click(editButton)

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/v/dashboard/mspcustomers/edit/Paid/${list.data.at(0)?.id}`,
      hash: '',
      search: ''
    })
  })
  it('should resend invite for selected row', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    const resendInviteButton = screen.getByRole('button', { name: 'Resend Invitation Email' })
    fireEvent.click(resendInviteButton)

    expect(screen.getByRole('dialog')).toBeVisible()
  })
  it('should deactivate selected row', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeVisible()
    const deactivateButton = within(dialog).getByRole('button', { name: 'Deactivate' })
    fireEvent.click(deactivateButton)

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: '123' },
        status: 'fulfilled'
      })
    ]

    await waitFor(() =>
      expect(services.useDeactivateMspEcMutation).toHaveLastReturnedWith(value))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).toBeNull())
  })
  it('should reactivate selected row', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    const row = await screen.findByRole('row', { name: /ec 333/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    fireEvent.click(screen.getByRole('button', { name: 'Reactivate' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeVisible()
    expect(screen.getByText('Reactivate Customer "ec 333"?')).toBeVisible()
    const reactivateButton = within(dialog).getByRole('button', { name: 'Reactivate' })
    fireEvent.click(reactivateButton)

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: '123' },
        status: 'fulfilled'
      })
    ]

    await waitFor(() =>
      expect(services.useReactivateMspEcMutation).toHaveLastReturnedWith(value))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).toBeNull())
  })
  it('should delete selected row', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    fireEvent.click(deleteButton)

    expect(await screen.findByRole('dialog')).toBeVisible()
    const deleteEcButton = screen.getByRole('button', { name: 'Delete EC' })
    await userEvent.type(screen.getByRole('textbox',
      { name: 'Type the word "Delete" to confirm:' }), 'Delete')
    await waitFor(() =>
      expect(deleteEcButton).not.toBeDisabled())
    fireEvent.click(deleteEcButton)

    const value: [Function, Object] = [
      expect.any(Function),
      expect.objectContaining({
        data: { requestId: 'f638e92c-9d6f-45b2-a680-20047741ef2c' },
        status: 'fulfilled'
      })
    ]

    await waitFor(() =>
      expect(services.useDeleteMspEcMutation).toHaveLastReturnedWith(value))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).toBeNull())
  })
  it('should open drawer for multi-selected rows', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    const row1 = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row1).getByRole('checkbox'))
    const row2 = await screen.findByRole('row', { name: /ec 333/i })
    fireEvent.click(within(row2).getByRole('checkbox'))

    expect(screen.getByText('2 selected')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Resend Invitation Email' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Reactivate' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Deactivate' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Assign MSP Administrators' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeVisible()
    expect(screen.getByText('Assign MSP Administrators')).toBeVisible()
  })
  it('should render table for support user', async () => {
    const supportUserProfile = { ...userProfile }
    supportUserProfile.support = true
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: supportUserProfile }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    expect(screen.getByText('Add Customer')).not.toBeVisible()

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = within(tbody).getAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })
  })
  it('should render table for integrator', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    const tenantDetails = { tenantType: AccountType.MSP_INSTALLER }
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: tenantDetails }
    })
    user.hasRoles = jest.fn().mockImplementation(() => {
      return true
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers' }
      })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = within(tbody).getAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })

    expect(screen.queryByText('Integrator')).toBeNull()

    // Assert MSP Admin Count link works
    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('link', { name: '0' }))

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText('Manage MSP Administrators')).toBeVisible()
  })
  it('should render table for mspec', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    services.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers' }
      })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = within(tbody).getAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })

    expect(screen.getByText('Integrator')).toBeVisible()
    expect(screen.getByText('Installer')).toBeVisible()
  })
  it('should open dialog when msp admin count link clicked', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    user.hasRoles = jest.fn().mockImplementation(() => {
      return true
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('link', { name: '1' }))

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText('Manage MSP Administrators')).toBeVisible()
  })
  it('should open dialog when integrator link clicked', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    user.hasRoles = jest.fn().mockImplementation(() => {
      return true
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('link', { name: '675dc01dc28846c383219b00d2f28f48' }))

    expect(screen.getByRole('dialog')).toBeVisible()
  })
  it('should open dialog when installer link clicked', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    user.hasRoles = jest.fn().mockImplementation(() => {
      return true
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 222/i })
    fireEvent.click(within(row).getByRole('link', { name: '675dc01dc28846c383219b00d2f28f48' }))

    expect(screen.getByRole('dialog')).toBeVisible()
  })
  it('should render table correctly if not admin', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    user.hasRoles = jest.fn().mockImplementation(() => {
      return false
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row1 = await screen.findByRole('row', { name: /ec 111/i })
    expect(within(row1).queryByRole('link', { name: '675dc01dc28846c383219b00d2f28f48' }))
      .toBeNull()

    const row2 = await screen.findByRole('row', { name: /ec 222/i })
    expect(within(row2).queryByRole('link', { name: '675dc01dc28846c383219b00d2f28f48' }))
      .toBeNull()
  })
})
