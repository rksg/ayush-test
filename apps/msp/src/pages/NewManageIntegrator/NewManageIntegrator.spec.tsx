import '@testing-library/jest-dom'
import userEvent      from '@testing-library/user-event'
import { Path, rest } from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed }                                                    from '@acx-ui/feature-toggle'
import { AssignedEc, MspAdministrator, MspEcData, MspEcDelegatedAdmins, MspEcTierEnum, MspRbacUrlsInfo, MspUrlsInfo } from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo }                              from '@acx-ui/rc/utils'
import { Provider }                                                                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }                   from '@acx-ui/test-utils'
import { RolesEnum }                                                                                   from '@acx-ui/types'
import type { ToastProps }                                                                             from '@acx-ui/utils'
import { AccountType }                                                                                 from '@acx-ui/utils'

import { NewManageIntegrator } from '.'

const assignmentHistory =
  [
    {
      createdBy: 'msp.eleu1658@rwbigdog.com',
      dateAssignmentCreated: '2022-12-13 19:00:08.043Z',
      dateAssignmentRevoked: null,
      dateEffective: '2022-12-13 19:00:08Z',
      dateExpires: '2023-02-12 07:59:59Z',
      deviceType: 'MSP_APSW',
      id: 130468,
      mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
      mspTenantId: '3061bd56e37445a8993ac834c01e2710',
      quantity: 2,
      revokedBy: null,
      status: 'VALID',
      trialAssignment: false
    },
    {
      createdBy: 'msp.eleu1658@rwbigdog.com',
      dateAssignmentCreated: '2022-12-13 19:00:08.117Z',
      dateAssignmentRevoked: null,
      dateEffective: '2022-12-13 19:00:08Z',
      dateExpires: '2023-02-12 07:59:59Z',
      deviceSubType: 'ICX76',
      deviceType: 'MSP_SLTN_TOKEN',
      id: 130469,
      mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
      mspTenantId: '3061bd56e37445a8993ac834c01e2710',
      quantity: 2,
      revokedBy: null,
      status: 'VALID',
      trialAssignment: false
    }
  ]

const mspEcAccount: MspEcData =
    {
      name: 'mspeleu',
      street_address: '123 Main Street',
      is_active: 'true',
      service_effective_date: '2022-12-13 19:00:08Z',
      service_expiration_date: '2023-02-12 07:59:59Z',
      tier: MspEcTierEnum.Professional,
      privacyFeatures: [{
        featureName: 'ARC',
        isEnabled: true
      }]
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

const assignedEc: AssignedEc = {
  delegated_to: '',
  delegation_type: '',
  // expiry_date?: string;
  mspec_list: []
}

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

const settings = {
  privacyFeatures: [
    {
      featureName: 'APP_VISIBILITY',
      isEnabled: false
    },
    {
      featureName: 'ARC',
      isEnabled: true
    }
  ]
}

const v2Response = {
  data: [
    {
      effectiveDate: 'Tue Aug 12 00:00:00 UTC 2025',
      expirationDate: 'Tue Apr 18 23:59:59 UTC 2028',
      quantity: 2,
      licenseType: 'APSW',
      skuTier: 'Silver',
      isTrial: false
    },
    {
      effectiveDate: 'Tue Aug 12 00:00:00 UTC 2025',
      expirationDate: 'Thu Jul 16 23:59:59 UTC 2026',
      quantity: 2,
      licenseType: 'APSW',
      skuTier: 'Platinum',
      isTrial: false
    },
    {
      effectiveDate: 'Tue Aug 12 00:00:00 UTC 2025',
      expirationDate: 'Thu Jul 16 23:59:59 UTC 2026',
      quantity: 2,
      licenseType: 'SLTN_TOKEN',
      skuTier: 'Platinum',
      isTrial: false
    }
  ]
}

const privilegeGroupList =
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
    }
  ]

const addCustomerMockFn = jest.fn()
const updateCustomerMockFn = jest.fn()
const assignmentSummaryMockFn = jest.fn()
const assignmentHistoryMockFn = jest.fn()
const mspEcAccountMockFn = jest.fn()

jest.mock('@acx-ui/rc/generic-features/components', () => ({
  GoogleMapWithPreference: () => {
    return <div data-testid='rc-GoogleMapWithPreference' />
  },
  usePlacesAutocomplete: () => jest.fn()
}))

describe('NewManageIntegrator when multipool-mspec ff is enabled', () => {
  let params: { tenantId: string, mspEcTenantId: string, action: string, type?: string }
  params = {
    tenantId: '3061bd56e37445a8993ac834c01e2710',
    mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
    action: 'add',
    type: AccountType.MSP_INTEGRATOR
  }
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  jest.mocked(useIsSplitOn)
  .mockImplementation(ff => ff !== Features.G_MAP)
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        MspRbacUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({ global: {
          mapRegion: 'TW'
        } }))
      ),
      rest.get(
        MspUrlsInfo.getAssignedMspEcToIntegrator.url.split('?')[0] as Path,
        (_req, res, ctx) => res(ctx.json(assignedEc))
      ),
      rest.post(
        MspRbacUrlsInfo.addMspEcAccount.url,
        (_req, res, ctx) => {
          addCustomerMockFn()
          return res(ctx.json({ requestId: 'add' }))
        }
      ),
      rest.put(
        '/tenants/1576b79db6b549f3b1f3a7177d7d4ca5',
        (_req, res, ctx) => {
          updateCustomerMockFn()
          return res(ctx.json({ requestId: 'update' }))
        }
      ),
      rest.get(AdministrationUrlsInfo.getPrivacySettings.url,
        (req, res, ctx) => res(ctx.json(settings))
      ),
      rest.get(MspUrlsInfo.getMspAssignmentHistory.url,
        (req, res, ctx) => {
          assignmentHistoryMockFn()
          return res(ctx.json(assignmentHistory))
        }
      ),
      rest.get(MspUrlsInfo.getAdministrators.url,
        (req, res, ctx) => res(ctx.json(administrators))
      ),
      rest.get(AdministrationUrlsInfo.getPrivilegeGroups.url,
        (req, res, ctx) => res(ctx.json(privilegeGroupList))
      ),
      rest.get(MspRbacUrlsInfo.getMspEcDelegatedAdmins.url,
        (req, res, ctx) => res(ctx.json(delegatedAdmins))
      ),
      rest.get(MspRbacUrlsInfo.getMspEcAdminList.url,
        (req, res, ctx) => res(ctx.json(ecAdministrators))
      ),
      rest.get(MspRbacUrlsInfo.getMspEcAccount.url,
        (req, res, ctx) => {
          mspEcAccountMockFn()
          return res(ctx.json(mspEcAccount))
        }
      ),
      rest.post(MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => {
          return res(ctx.json(list))
        }
      ),
      rest.post(
        MspRbacUrlsInfo.getCalculatedLicences.url,
        (_req, res, ctx) => {
          assignmentSummaryMockFn()
          return res(ctx.json(v2Response)) }
      )

    )
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render correctly for edit', async () => {
    render(
      <Provider>
        <NewManageIntegrator />
      </Provider>, {
        route: { params: { ...params, action: 'edit' },
          path: '/:tenantId/integrators/:action/:type/:mspEcTenantId' }
      })

    await expect(await screen.findByRole('textbox', { name: 'Account Name' })).toBeVisible()
    await expect(await screen.findByRole('textbox', { name: 'Address' })).toBeVisible()

    await waitFor(async () => {
      await expect(assignmentSummaryMockFn).toBeCalled()
      await expect(assignmentHistoryMockFn).toBeCalled()
      await expect(mspEcAccountMockFn).toBeCalled()
      await expect(screen.getByRole('textbox', { name: 'Account Name' })).toHaveValue('mspeleu')
    })
    await userEvent.click(screen.getByRole('radio', { name: 'Essentials' }))
    const dialog = await screen.findByRole('dialog')    
    await expect(within(dialog).getByText('Are you sure you want to save the changes?')).toBeVisible()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(dialog).not.toBeInTheDocument())

    await userEvent.click(screen.getByRole('radio', { name: 'Essentials' }))
    const dialog2 = await screen.findByRole('dialog')
    await expect(within(dialog2).getByText('Are you sure you want to save the changes?')).toBeVisible()
    await userEvent.click(within(dialog2).getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(dialog2).not.toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await expect(updateCustomerMockFn).toBeCalled()
  })

})
