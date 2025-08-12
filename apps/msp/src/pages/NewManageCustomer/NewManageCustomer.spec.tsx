import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed }                                                                          from '@acx-ui/feature-toggle'
import { MspAdministrator, MspEcData, MspEcDelegatedAdmins, MspEcTierEnum, MspRbacUrlsInfo, MspUrlsInfo, SupportDelegation } from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo }                                                                                            from '@acx-ui/rc/utils'
import { Provider }                                                                                                          from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }                                                                       from '@acx-ui/test-utils'
import { RolesEnum }                                                                                                         from '@acx-ui/types'
import type { ToastProps }                                                                                                   from '@acx-ui/utils'

import { NewManageCustomer } from '.'

const rbacMspEcAssignment = [{
  effectiveDate: 'Thu Mar 06 16:36:31 UTC 2025',
  expirationDate: 'Sat Apr 05 16:36:29 UTC 2025',
  quantity: 50,
  licenseType: 'APSW',
  isTrial: false,
  id: 418089,
  isSelfAssignment: false,
  createdDate: 'Thu Mar 06 16:36:31 UTC 2025',
  revokedDate: '',
  createdBy: 'msp3@email.com',
  revokedBy: '',
  status: 'VALID'
},
{
  effectiveDate: 'Thu Mar 06 16:36:31 UTC 2025',
  expirationDate: 'Sat Apr 05 16:36:29 UTC 2025',
  quantity: 50,
  licenseType: 'APSW',
  isTrial: true,
  id: 418090,
  isSelfAssignment: false,
  createdDate: 'Thu Mar 06 16:36:31 UTC 2025',
  revokedDate: '',
  createdBy: 'msp3@email.com',
  revokedBy: '',
  status: 'VALID'
},
{
  effectiveDate: 'Thu Mar 06 16:36:31 UTC 2025',
  expirationDate: 'Sat Apr 05 16:36:29 UTC 2025',
  quantity: 50,
  licenseType: 'SLTN_TOKEN',
  isTrial: true,
  id: 418091,
  isSelfAssignment: false,
  createdDate: 'Thu Mar 06 16:36:31 UTC 2025',
  revokedDate: '',
  createdBy: 'msp3@email.com',
  revokedBy: '',
  status: 'VALID'
},
{
  effectiveDate: 'Thu Mar 06 16:36:31 UTC 2025',
  expirationDate: 'Sat Apr 05 16:36:29 UTC 2025',
  quantity: 50,
  licenseType: 'SLTN_TOKEN',
  isTrial: false,
  id: 418092,
  isSelfAssignment: false,
  createdDate: 'Thu Mar 06 16:36:31 UTC 2025',
  revokedDate: '',
  createdBy: 'msp3@email.com',
  revokedBy: '',
  status: 'VALID'
}]

const mspEcAccount: MspEcData =
    {
      name: 'mspeleu',
      street_address: '123 Main Street',
      is_active: 'true',
      tier: MspEcTierEnum.Professional,
      service_effective_date: '2022-12-13 19:00:08Z',
      service_expiration_date: '2023-02-12 07:59:59Z',
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

const fakeTenantDetails = {
  id: 'ee87b5336d5d483faeda5b6aa2cbed6f',
  createdDate: '2023-01-31T04:19:00.241+00:00',
  updatedDate: '2023-02-15T02:34:21.877+00:00',
  entitlementId: '140360222',
  maintenanceState: false,
  name: 'Dog Company 1551',
  externalId: '0012h00000NrlYAAAZ',
  upgradeGroup: 'production',
  tenantMFA: {
    mfaStatus: 'DISABLED',
    recoveryCodes: '["825910","333815","825720","919107","836842"]' },
  preferences: '{"global":{"mapRegion":"UA"}}',
  ruckusUser: false,
  isActivated: true,
  status: 'active',
  tenantType: 'REC',
  extendedTrial: true
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

const assignmentSummaryMockFn = jest.fn()
const assignmentHistoryMockFn = jest.fn()
const mspEcAccountMockFn = jest.fn()
const updateCustomerMockFn = jest.fn()
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
      licenseType: 'APSW',
      skuTier: 'Platinum',
      isTrial: true
    },
    {
      effectiveDate: 'Tue Aug 12 00:00:00 UTC 2025',
      expirationDate: 'Thu Jul 16 23:59:59 UTC 2026',
      quantity: 2,
      licenseType: 'SLTN_TOKEN',
      skuTier: 'Platinum',
      isTrial: false
    },
    {
      effectiveDate: 'Tue Aug 12 00:00:00 UTC 2025',
      expirationDate: 'Thu Jul 16 23:59:59 UTC 2026',
      quantity: 2,
      licenseType: 'SLTN_TOKEN',
      skuTier: 'Platinum',
      isTrial: true
    }
  ]
}

describe('NewManageCustomer when multipool-mspec ff is enabled', () => {
  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff !== Features.G_MAP)
  })
  let params: { tenantId: string, mspEcTenantId: string, action: string, status?: string }
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        MspRbacUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.put(
        MspRbacUrlsInfo.updateMspEcAccount.url,
        (_req, res, ctx) => {
          updateCustomerMockFn()
          return res(ctx.json({ requestId: 'update' }))}
      ),
      rest.get(
        AdministrationUrlsInfo.getTenantDetails.url,
        (req, res, ctx) => res(ctx.json(fakeTenantDetails))
      ),
      rest.get(MspRbacUrlsInfo.getMspEcAccount.url,
        (req, res, ctx) => {
          mspEcAccountMockFn()
          return res(ctx.json(mspEcAccount))
        }
      ),
      rest.get(MspUrlsInfo.getAdministrators.url,
        (req, res, ctx) => res(ctx.json(administrators))
      ),
      rest.get(MspRbacUrlsInfo.getMspEcDelegatedAdmins.url,
        (req, res, ctx) => res(ctx.json(delegatedAdmins))
      ),
      rest.get(MspRbacUrlsInfo.getMspEcAdminList.url,
        (req, res, ctx) => res(ctx.json(ecAdministrators))
      ),
      rest.get(MspRbacUrlsInfo.getMspEcSupport.url,
        (req, res, ctx) => res(ctx.json(ecSupport))
      ),
      rest.post(MspRbacUrlsInfo.getMspEcAssignmentHistory.url,
        (req, res, ctx) => {
          assignmentHistoryMockFn()
          return res(ctx.json({ data: rbacMspEcAssignment }))
        }
      ),
      rest.post(
        MspRbacUrlsInfo.getCalculatedLicences.url,
        (_req, res, ctx) => {
          assignmentSummaryMockFn()
          return res(ctx.json(v2Response)) }
      )
    )

    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710',
      mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
      action: 'add'
    }
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly for edit', async () => {
    params.action = 'edit'
    params.status = 'ExtendedTrial'
    render(
      <Provider>
        <NewManageCustomer />
      </Provider>, {
        route: { params }
      })

    expect(screen.queryByText('Add Customer Account')).toBeNull()

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByDisplayValue('123 Main Street')).toBeVisible()

    await userEvent.click(screen.getByRole('radio', { name: 'Essentials' }))
    const dialog = await screen.findByRole('dialog')
    await expect(
      within(dialog).getByText('Are you sure you want to save the changes?')).toBeVisible()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(dialog).not.toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await expect(updateCustomerMockFn).toBeCalled()
  })

  it('should render correctly for edit && Trial', async () => {
    params.action = 'edit'
    params.status = 'Trial'
    render(
      <Provider>
        <NewManageCustomer />
      </Provider>, {
        route: { params }
      })

    expect(screen.queryByText('Add Customer Account')).toBeNull()

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByDisplayValue('123 Main Street')).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await expect(updateCustomerMockFn).toBeCalled()
  })
})
