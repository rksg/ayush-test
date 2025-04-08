import '@testing-library/jest-dom'
import userEvent      from '@testing-library/user-event'
import moment         from 'moment'
import { Path, rest } from 'msw'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }                            from '@acx-ui/feature-toggle'
import { MspAdministrator, MspEcTierEnum, MspRbacUrlsInfo, MspUrlsInfo }                     from '@acx-ui/msp/utils'
import { PrivilegeGroup }                                                                    from '@acx-ui/rc/utils'
import { Provider }                                                                          from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, within, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { getUserProfile, setUserProfile }                                                    from '@acx-ui/user'
import { AccountType }                                                                       from '@acx-ui/utils'

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
      edgeLicenses: 1,
      accountTier: MspEcTierEnum.Essentials
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
      accountType: 'TRIAL',
      accountTier: MspEcTierEnum.Essentials
    },
    {
      assignedMspEcList: [],
      creationDate: '1659589676050',
      entitlements: [
        {
          consumed: '0',
          entitlementDeviceType: 'APSW',
          expirationDate: '2022-11-02T06:59:59Z',
          expirationDateTs: '1667372399000',
          quantity: '5',
          tenantId: '701fe9df5f6b4c17928a29851c07cc06',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        },
        {
          consumed: '0',
          entitlementDeviceType: 'APSW',
          expirationDate: '2022-11-02T06:59:59Z',
          expirationDateTs: '1667372399000',
          quantity: '0',
          tenantId: '701fe9df5f6b4c17928a29851c07cc06',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
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
      wifiLicenses: 0,
      accountTier: MspEcTierEnum.Professional
    },
    {
      assignedMspEcList: [],
      creationDate: '1659589676050',
      entitlements: [
        {
          consumed: '1',
          entitlementDeviceType: 'APSW',
          expirationDate: moment().add(30, 'days'),
          expirationDateTs: '1667372399000',
          quantity: '10',
          tenantId: '701fe9df5f6b4c17928a29851c07cc07',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '701fe9df5f6b4c17928a29851c07cc07',
      integrator: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspIntegratorAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'ec 444',
      status: 'Inactive',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC',
      wifiLicenses: 0,
      accountTier: MspEcTierEnum.Professional
    },
    {
      assignedMspEcList: [],
      creationDate: '1659589677050',
      entitlements: [
        {
          consumed: '2',
          entitlementDeviceType: 'APSW',
          expirationDate: moment().add(70, 'days'),
          expirationDateTs: '1667372399000',
          quantity: '10',
          tenantId: '701fe9df5f6b4c17928a29851c07cc07',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '701fe9df5f6b4c17928a29851c07cc22',
      integrator: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspIntegratorAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'ec 888',
      status: 'Inactive',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC',
      wifiLicenses: 0,
      accountTier: MspEcTierEnum.Professional
    }
  ]
}
const alarmList = {
  mspEcAlarmCountList: [
    {
      tenantId: '701fe9df5f6b4c17928a29851c07cc04',
      alarmCount: 0
    },
    {
      tenantId: '701fe9df5f6b4c17928a29851c07cc05',
      alarmCount: 0
    },
    {
      tenantId: '701fe9df5f6b4c17928a29851c07cc06',
      alarmCount: 0
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
    const emptyList: MspAdministrator[] = []
    services.useMspAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: emptyList }
    })
    services.useGetMspEcDelegatedAdminsQuery = jest.fn().mockImplementation(() => {
      return { data: undefined }
    })
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: undefined }
    })
    rcServices.useGetPrivilegeGroupsWithAdminsQuery = jest.fn().mockImplementation(() => {
      return { data: fakedPrivilegeGroupList }
    })
    const emptyPGList: PrivilegeGroup[] = []
    rcServices.useGetMspEcDelegatePrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
      return { data: emptyPGList }
    })
    jest.spyOn(services, 'useMspCustomerListQuery')
    jest.spyOn(services, 'useSupportMspCustomerListQuery')
    jest.spyOn(services, 'useIntegratorCustomerListQuery')
    jest.spyOn(services, 'useDeleteMspEcMutation')
    jest.spyOn(services, 'useDeactivateMspEcMutation')
    jest.spyOn(services, 'useReactivateMspEcMutation')
    jest.spyOn(services, 'useGetMspEcAlarmListQuery')
    mockServer.use(
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        MspRbacUrlsInfo.getMspCustomersList.url,
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
      rest.delete(
        MspRbacUrlsInfo.deleteMspEcAccount.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'f638e92c-9d6f-45b2-a680-20047741ef2c' }))
      ),
      rest.put(
        MspRbacUrlsInfo.reactivateMspEcAccount.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.delete(
        MspRbacUrlsInfo.deactivateMspEcAccount.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
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
      ),
      rest.post(
        MspUrlsInfo.getMspEcAlarmList.url,
        (req, res, ctx) => res(ctx.json(alarmList))
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
  it('should render correctly when feature flag turned on', async () => {
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
    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    })
    expect(screen.getByText('Used Licenses')).toBeVisible()
    // expect(screen.getByText('Device Subscriptions Utilization')).toBeVisible()

    expect(screen.queryByText('Wi-Fi Licenses')).toBeNull()
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

    const rows = await screen.findAllByRole('row')
    expect(within(rows[2]).getByRole('cell', { name: /ec 222/i })).toBeVisible()
    fireEvent.click(within(rows[2]).getByRole('checkbox')) //ec 222

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

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /ec 111/i })).toBeVisible()
    fireEvent.click(within(rows[1]).getByRole('checkbox')) //ec 111

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

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /ec 111/i })).toBeVisible()
    fireEvent.click(within(rows[1]).getByRole('checkbox')) //ec 111

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

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /ec 111/i })).toBeVisible()
    fireEvent.click(within(rows[1]).getByRole('checkbox')) //ec 111

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
    const rows = await screen.findAllByRole('row')
    expect(within(rows[3]).getByRole('cell', { name: /ec 333/i })).toBeVisible()
    fireEvent.click(within(rows[3]).getByRole('checkbox')) //ec 333

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

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /ec 111/i })).toBeVisible()
    fireEvent.click(within(rows[1]).getByRole('checkbox')) //ec 111

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
    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /ec 111/i })).toBeVisible()
    fireEvent.click(within(rows[1]).getByRole('checkbox')) //ec 111
    expect(within(rows[3]).getByRole('cell', { name: /ec 333/i })).toBeVisible()
    fireEvent.click(within(rows[3]).getByRole('checkbox')) //ec 333

    expect(screen.getByText('2 selected')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Resend Invitation Email' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Reactivate' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Deactivate' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Assign MSP Administrators' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeVisible()
    // expect(screen.getAllByText('Assign MSP Administrators')).toHaveLength(2)
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
  it('should render table for installer', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.ABAC_POLICIES_TOGGLE)
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
    expect(within(rows[0]).getByRole('cell', { name: /ec 111/i })).toBeVisible()
    fireEvent.click(within(rows[0]).getByRole('link', { name: '0' }))

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText('Manage Tech Partner Administrators')).toBeVisible()
  })
  it('should render table for integrator', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.ABAC_POLICIES_TOGGLE)
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    const tenantDetails = { tenantType: AccountType.MSP_INTEGRATOR }
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
    expect(within(rows[0]).getByRole('cell', { name: /ec 111/i })).toBeVisible()
    fireEvent.click(within(rows[0]).getByRole('link', { name: '0' }))

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText('Manage Tech Partner Administrators')).toBeVisible()
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

    expect(screen.getByText('Integrator Count')).toBeVisible()
    expect(screen.getByText('Installer Count')).toBeVisible()
  })
  it('should open dialog when msp admin count link clicked', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.ABAC_POLICIES_TOGGLE)
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

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /ec 111/i })).toBeVisible()
    fireEvent.click(within(rows[1]).getByRole('link', { name: '1' })) //ec 111

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText('Manage MSP Administrators')).toBeVisible()
  })
  it('should open dialog when integrator link clicked', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
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

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /ec 111/i })).toBeVisible()
    fireEvent.click(within(rows[1]).getByRole('link', { name: '675dc01dc28846c383219b00d2f28f48' })) //ec 111

    expect(screen.getByRole('dialog')).toBeVisible()
  })
  it('should open dialog when installer link clicked', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
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

    const rows = await screen.findAllByRole('row')
    expect(within(rows[2]).getByRole('cell', { name: /ec 222/i })).toBeVisible()
    fireEvent.click(within(rows[2]).getByRole('link', { name: '675dc01dc28846c383219b00d2f28f48' })) //ec 222

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

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /ec 111/i })).toBeVisible()
    expect(within(rows[1]).queryByRole('link', { name: '675dc01dc28846c383219b00d2f28f48' })) //ec 111
      .toBeNull()

    expect(within(rows[2]).getByRole('cell', { name: /ec 222/i })).toBeVisible()
    expect(within(rows[2]).queryByRole('link', { name: '675dc01dc28846c383219b00d2f28f48' })) //ec 222
      .toBeNull()
  })
  it('should navigate correctly for non-support var user', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: { tenantType: AccountType.VAR } }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/dashboard/varCustomers`,
      hash: '',
      search: ''
    }, { replace: true })
  })
  it('should open msp delegations dialog for abac and rbac enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.ABAC_POLICIES_TOGGLE
      || ff === Features.RBAC_PHASE2_TOGGLE)
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.RBAC_IMPLICIT_P1)
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

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /ec 111/i })).toBeVisible()
    fireEvent.click(within(rows[1]).getByRole('link', { name: '1' })) //ec 111

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText('Manage MSP Delegations')).toBeVisible()
  })
  it('should open delegation admin dialog for abac enabled and rbac not enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.ABAC_POLICIES_TOGGLE)
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.RBAC_IMPLICIT_P1)
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

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /ec 111/i })).toBeVisible()
    fireEvent.click(within(rows[1]).getByRole('link', { name: '1' })) //ec 111

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText('Manage MSP Users')).toBeVisible()
  })
  it('should open manage delegations dialog for abac/rbac enabled for support access', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.ABAC_POLICIES_TOGGLE
      || ff === Features.RBAC_PHASE2_TOGGLE
      || ff === Features.ASSIGN_MULTI_EC_TO_MSP_ADMINS)
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.RBAC_IMPLICIT_P1)
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    user.hasRoles = jest.fn().mockImplementation(() => {
      return true
    })
    services.useGetMspEcAlarmListQuery = jest.fn().mockImplementation(() => {
      return { data: alarmList }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(screen.getAllByRole('checkbox')[1])
    expect(await screen.findByRole('button', { name: 'Assign MSP Administrators' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Assign MSP Administrators' }))

    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(screen.getByText('Manage MSP Delegations')).toBeVisible()
  })
  it('should open delegation admin dialog for abac enabled for support access', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.ABAC_POLICIES_TOGGLE
      || ff === Features.ASSIGN_MULTI_EC_TO_MSP_ADMINS)
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.RBAC_IMPLICIT_P1)
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    user.hasRoles = jest.fn().mockImplementation(() => {
      return true
    })
    services.useGetMspEcAlarmListQuery = jest.fn().mockImplementation(() => {
      return { data: alarmList }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(screen.getAllByRole('checkbox')[1])
    expect(await screen.findByRole('button', { name: 'Assign MSP Administrators' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Assign MSP Administrators' }))

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText('Manage MSP Users')).toBeVisible()
    expect(screen.getAllByText('Assign MSP Administrators')).toHaveLength(1)
  })
  it('should open admin dialog for abac enabled & multiselected for support access', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.ABAC_POLICIES_TOGGLE
      || ff === Features.ASSIGN_MULTI_EC_TO_MSP_ADMINS)
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.RBAC_IMPLICIT_P1)
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    user.hasRoles = jest.fn().mockImplementation(() => {
      return true
    })
    services.useGetMspEcAlarmListQuery = jest.fn().mockImplementation(() => {
      return { data: alarmList }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    expect(await screen.findByRole('button', { name: 'Assign MSP Administrators' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Assign MSP Administrators' }))

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getAllByText('Assign MSP Administrators')).toHaveLength(2)
  })
  it('should render filter correctly for extended trial', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: { extendedTrial: true } }
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
  })
  it('should render correctly when rbacOpsApiEnabled nabled', async () => {
    setUserProfile({
      ...getUserProfile(),
      rbacOpsApiEnabled: true
    })
    render(
      <Provider>
        <MspCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(screen.getByText('MSP Customers')).toBeVisible()

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = within(tbody).getAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })
  })
})
