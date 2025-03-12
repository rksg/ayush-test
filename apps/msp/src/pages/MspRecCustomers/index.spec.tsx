import '@testing-library/jest-dom'
import userEvent      from '@testing-library/user-event'
import { Path, rest } from 'msw'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { MspAdministrator, MspRbacUrlsInfo, MspUrlsInfo }         from '@acx-ui/msp/utils'
import { PrivilegeGroup }                                         from '@acx-ui/rc/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, within, waitFor } from '@acx-ui/test-utils'
import { RolesEnum }                                              from '@acx-ui/types'
import { getUserProfile, setUserProfile }                         from '@acx-ui/user'
import { AccountType }                                            from '@acx-ui/utils'

import { MspRecCustomers } from '.'

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
      wifiLicenses: 0
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
          quantity: '0',
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

const fakeMSPAdminList = [
  {
    id: '22322506ed764da2afe726885845a359',
    email: 'test.com',
    createdDate: '2023-01-31T03:28:35.448+00:00',
    updatedDate: '2023-01-31T03:28:35.448+00:00',
    delegatedTo: 'f5ca6ac1a8cf4929ac5b78d6a1392599',
    type: 'MSP',
    status: 'ACCEPTED',
    delegatedBy: 'abc@email.com',
    delegatedToName: 'FisrtName 1551'
  }
]
const fakeDelegatedAdminList = [
  {
    msp_admin_id: '22322506ed764da2afe726885845a359',
    msp_admin_role: RolesEnum.PRIME_ADMIN
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

describe('MspRecCustomers', () => {
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
    services.useDelegateToMspEcPath = jest.fn().mockImplementation(() => {
      const delegateToMspEcPath = jest.fn()
      return { delegateToMspEcPath }
    })
    services.useCheckDelegateAdmin = jest.fn().mockImplementation(() => {
      const checkDelegateAdmin = jest.fn()
      return { checkDelegateAdmin }
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
      rest.delete(
        MspRbacUrlsInfo.deleteMspEcAccount.url,
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
      ),
      rest.put(
        MspRbacUrlsInfo.updateMspEcDelegatedAdmins.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.put(
        MspUrlsInfo.updateMspEcDelegatedAdmins.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
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
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(screen.getByText('Brand Properties')).toBeVisible()
    expect(screen.getByText('Add Property')).toBeVisible()

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
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(await screen.findByText('My Customers')).toBeVisible()
  })
  it.skip('should render correctly when feature flag turned on', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(await screen.findByText('My Customers')).toBeVisible()
    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    })
    expect(screen.getByText('Installed Devices')).toBeVisible()

    expect(screen.queryByText('Wi-Fi Licenses')).toBeNull()
  })
  it('should delete selected row', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    fireEvent.click(deleteButton)

    expect(await screen.findByRole('dialog')).toBeVisible()
    const deleteEcButton = screen.getByRole('button', { name: 'Delete Property' })
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
  it('should edit selected non-trial row', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    const editButton = screen.getByRole('button', { name: 'Edit' })
    fireEvent.click(editButton)

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/dashboard/mspRecCustomers/edit/Paid/${list.data[0].id}`,
      hash: '',
      search: ''
    })
  })
  it('should edit selected trial row', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const trialRow = await screen.findByRole('row', { name: /ec 222/i })
    fireEvent.click(within(trialRow).getByRole('checkbox'))

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/dashboard/mspRecCustomers/edit/Trial/${list.data[1].id}`,
      hash: '',
      search: ''
    })

  })
  it('should open drawer for multi-selected rows', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspRecCustomers />
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
    expect(screen.getAllByText('Assign MSP Administrators')).toHaveLength(2)
  })
  it('should render table for support user', async () => {
    const supportUserProfile = { ...userProfile }
    supportUserProfile.support = true
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: supportUserProfile }
    })
    render(
      <Provider>
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    expect(screen.getByText('Add Property')).not.toBeVisible()

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = within(tbody).getAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })
  })
  it('should work correctly for customer name clicked for non-support user', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    render(
      <Provider>
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getAllByRole('link')[0])

    expect(services.useCheckDelegateAdmin).toHaveBeenCalled()
  })
  it('should work correctly for customer name clicked for support user', async () => {
    const supportUserProfile = { ...userProfile }
    supportUserProfile.support = true
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: supportUserProfile }
    })
    render(
      <Provider>
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('link'))

    expect(services.useDelegateToMspEcPath).toHaveBeenCalled()
  })
  it('should render table for integrator', async () => {
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
        <MspRecCustomers />
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
        <MspRecCustomers />
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
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('link', { name: '1' }))

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
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('link', { name: '675dc01dc28846c383219b00d2f28f48' }))

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
        <MspRecCustomers />
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
        <MspRecCustomers />
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
  it('should navigate correctly for non-support var user', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: { tenantType: AccountType.VAR } }
    })
    render(
      <Provider>
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/dashboard/varCustomers`,
      hash: '',
      search: ''
    }, { replace: true })
  })
  it('should show brand property instead Ruckus End Customer for HSP', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_HSP_SUPPORT)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(screen.getByText('Brand Properties')).toBeVisible()
  })
  it('should open msp delegations drawer for abac and rbac ff enabled', async () => {
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
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers' }
      })

    // Click MSP Admin Count link
    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('link', { name: '1' }))

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(await screen.findByText('Manage MSP Delegations')).toBeVisible()
    expect(await screen.findByRole('tab', { name: 'Privilege Groups' })).toBeVisible()
    fireEvent.click(screen.getByRole('tab', { name: 'Privilege Groups' }))
    const checkbox = screen.getAllByRole('checkbox')[0]
    expect(checkbox).toBeEnabled()
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    expect(screen.getByRole('button', { name: 'Save' })).toBeDefined()
  })
  it('should open delegation admin drawer for abac enabled and rbac not enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.RBAC_PHASE2_TOGGLE)
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.RBAC_IMPLICIT_P1)
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile }
    })
    user.hasRoles = jest.fn().mockImplementation(() => {
      return true
    })
    services.useGetMspEcDelegatedAdminsQuery = jest.fn().mockImplementation(() => {
      return { data: fakeDelegatedAdminList }
    })
    services.useMspAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: fakeMSPAdminList }
    })
    render(
      <Provider>
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers' }
      })

    // Click MSP Admin Count link
    const row = await screen.findByRole('row', { name: /ec 111/i })
    fireEvent.click(within(row).getByRole('link', { name: '1' }))

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(await screen.findByText('Manage MSP Users')).toBeVisible()
    const checkbox = screen.getAllByRole('checkbox')[0]
    expect(checkbox).toBeEnabled()
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    expect(screen.getByRole('button', { name: 'Assign' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Assign' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
  it('should render correctly when rbacOpsApiEnabled nabled', async () => {
    setUserProfile({
      ...getUserProfile(),
      rbacOpsApiEnabled: true
    })
    render(
      <Provider>
        <MspRecCustomers />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(screen.getByText('Brand Properties')).toBeVisible()

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
