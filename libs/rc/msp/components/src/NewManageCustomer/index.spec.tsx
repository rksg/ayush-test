import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import moment    from 'moment-timezone'
import { rest }  from 'msw'

import { ToastProps }                                                                                         from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                                           from '@acx-ui/feature-toggle'
import { MspAdministrator, MspEcData, MspEcDelegatedAdmins, MspRbacUrlsInfo, MspUrlsInfo, SupportDelegation } from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo, EntitlementDeviceType, LicenseUrlsInfo }                                     from '@acx-ui/rc/utils'
import { Provider }                                                                                           from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitForElementToBeRemoved, waitFor }                          from '@acx-ui/test-utils'
import { RolesEnum }                                                                                          from '@acx-ui/types'
import { UserUrlsInfo }                                                                                       from '@acx-ui/user'

import { addressParser, NewManageCustomer } from '.'

const autocompleteResult: google.maps.places.PlaceResult = {
  address_components: [
    {
      long_name: '350',
      short_name: '350',
      types: ['street_number']
    },
    {
      long_name: 'West Java Drive',
      short_name: 'W Java Dr',
      types: ['route']
    },
    {
      long_name: 'United States',
      short_name: 'US',
      types: ['country', 'political']
    },
    {
      long_name: '94089',
      short_name: '94089',
      types: ['postal_code', 'neighborhood']
    },
    {
      long_name: '1026',
      short_name: '1026',
      types: ['postal_code_suffix', 'postal_town']
    }
  ],
  adr_address:
  // eslint-disable-next-line max-len
      "<span class='street-address'>350 W Java Dr</span>, <span class='locality'>Sunnyvale</span>, <span class='region'>CA</span> <span class='postal-code'>94089-1026</span>, <span class='country-name'>USA</span>",
  formatted_address: '350 W Java Dr, Sunnyvale, CA 94089, USA',
  icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png',
  icon_background_color: '#7B9EB0',
  icon_mask_base_uri:
      'https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet',
  name: '350 W Java Dr',
  place_id: 'ChIJp5L7yL63j4ARCqQI-eAJu0A',
  types: ['premise'],
  // eslint-disable-next-line max-len
  url: 'https://maps.google.com/?q=350+W+Java+Dr,+Sunnyvale,+CA+94089,+USA&ftid=0x808fb7bec8fb92a7:0x40bb09e0f908a40a',
  utc_offset: -420,
  vicinity: 'Sunnyvale'
}
const assignmentSummary =
  [
    {
      quantity: 12,
      purchasedQuantity: 20,
      courtesyQuantity: 0,
      usedQuantity: 2,
      usedQuantityForOwnAssignment: 1,
      isTrial: false,
      licenseType: EntitlementDeviceType.APSW,
      remainingLicenses: 8,
      usageType: 'ASSIGNED',
      remainingQuantity: 8
    },
    {
      quantity: 12,
      purchasedQuantity: 20,
      courtesyQuantity: 0,
      usedQuantity: 2,
      usedQuantityForOwnAssignment: 1,
      isTrial: false,
      licenseType: EntitlementDeviceType.SLTN_TOKEN,
      remainingLicenses: 8,
      usageType: 'ASSIGNED',
      remainingQuantity: 8
    }
  ]

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
      is_active: 'true',
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
      id: '2765e98c7b9446e2a5bdd4720e0e8914',
      name: 'OFFICE_ADMIN',
      description: 'Guest Manager',
      roleName: 'OFFICE_ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    },
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8911',
      name: 'PRIME_ADMIN',
      description: 'Admin Role',
      roleName: 'ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false
    }
  ]

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

const assignmentSummaryMockFn = jest.fn()
const assignmentHistoryMockFn = jest.fn()
const mspEcAccountMockFn = jest.fn()
const privilegeListCallMockFn = jest.fn()
const addCustomerMockFn = jest.fn()

describe('NewManageCustomer', () => {
  user.useUserProfileContext = jest.fn().mockImplementation(() => {
    return { data: userProfile }
  })
  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })
  let params: { tenantId: string, mspEcTenantId: string, action: string, status?: string }
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        MspRbacUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
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
        MspRbacUrlsInfo.addMspEcAccount.url,
        (_req, res, ctx) => {
          addCustomerMockFn()
          return res(ctx.json({ requestId: 'add' }))
        }
      ),
      rest.put(
        MspUrlsInfo.updateMspEcAccount.url,
        (_req, res, ctx) => res(ctx.json({ requestId: 'update' }))
      ),
      rest.post(
        MspUrlsInfo.enableMspEcSupport.url,
        (_req, res, ctx) => res(ctx.json({ requestId: 'enable' }))
      ),
      rest.delete(
        MspUrlsInfo.disableMspEcSupport.url,
        (_req, res, ctx) => res(ctx.json({ requestId: 'disable' }))
      ),
      rest.get(
        AdministrationUrlsInfo.getTenantDetails.url,
        (req, res, ctx) => res(ctx.json(fakeTenantDetails))
      ),
      rest.get(AdministrationUrlsInfo.getPrivacySettings.url,
        (req, res, ctx) => res(ctx.json(settings))),
      rest.post(LicenseUrlsInfo.getMspEntitlementSummary.url,
        (req, res, ctx) => {
          assignmentSummaryMockFn()
          return res(ctx.json({ data: assignmentSummary }))
        }
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
      rest.get(AdministrationUrlsInfo.getPrivilegeGroups.url,
        (req, res, ctx) => {
          privilegeListCallMockFn()
          return res(ctx.json(fakedPrivilegeGroupList)) }
      ),
      rest.post(MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => {
          return res(ctx.json(list))
        }
      ),
      rest.post(MspRbacUrlsInfo.getMspEcAssignmentHistory.url,
        (req, res, ctx) => {
          assignmentHistoryMockFn()
          return res(ctx.json({ data: rbacMspEcAssignment }))
        }
      ),
      rest.get(MspUrlsInfo.getMspEcSupport.url,
        (req, res, ctx) => res(ctx.json(ecSupport))
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
  it('should render correctly for add', async () => {
    render(
      <Provider>
        <NewManageCustomer />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Add Customer Account')).toBeVisible()

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Start service in' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    await waitFor(async () => {
      await expect(assignmentSummaryMockFn).toBeCalled()
      await expect(privilegeListCallMockFn).toBeCalled()
    })

    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()

    await fireEvent.change(screen.getByRole('textbox', { name: 'Customer Name' }),
      { target: { value: 'John Doe' } })
    await fireEvent.change(screen.getByRole('textbox', { name: 'Address' }),
      { target: { value: 'US, Virginia' } })
    await fireEvent.click(screen.getByRole('radio', { name: 'Essentials' }))

    await fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await expect(await screen.findByRole('heading', { name: 'Start service in' })).toBeVisible()

    await expect(screen.getByRole('radio', { name: 'Trial Mode' })).toBeVisible()
    await expect(screen.getByRole('radio', { name: 'Extended Trial Mode' })).toBeVisible()
    await expect(screen.getByRole('radio', { name: 'Paid Subscription' })).toBeVisible()

    await fireEvent.click(screen.getByRole('radio', { name: 'Paid Subscription' }))

    const apswInput = screen.getAllByRole('spinbutton')[0]

    await fireEvent.change(apswInput, { target: { value: '1' } })

    await fireEvent.mouseDown(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'Custom date' }))

    await userEvent.click(screen.getByRole('img', { name: 'calendar' }))

    const selectDt = moment().add(3,'days').format('YYYY-MM-DD')

    await userEvent.click(screen.getByRole('cell', { name: selectDt }))

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Add Customer' }))

    await expect(addCustomerMockFn).toBeCalled()

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
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <NewManageCustomer />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    expect(await screen.findByText('My Customers')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'MSP Customers'
    })).toBeVisible()
  })

  it('should validate customer name correctly', async () => {
    render(
      <Provider>
        <NewManageCustomer />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

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

  it('should call address parser', async () => {
    const { address: _address } = await addressParser(autocompleteResult)

    const addressResult = {
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      city: '1026',
      country: 'United States'
    }

    expect(_address).toEqual(addressResult)

    // with state
    const _autocompleteResult = { ...autocompleteResult }

    _autocompleteResult.address_components?.push({
      long_name: 'California',
      short_name: 'CA',
      types: ['administrative_area_level_1']
    })

    const addressResult1 = {
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      city: '1026, California',
      country: 'United States'
    }

    const { address: address1 } = await addressParser(_autocompleteResult)

    expect(address1).toEqual(addressResult1)
  })

  it('should call address parser with no city and state', async () => {
    const autocompleteResult1 = { ...autocompleteResult }

    autocompleteResult1.address_components=[{
      long_name: 'United States',
      short_name: 'US',
      types: ['country']
    },{
      long_name: 'California',
      short_name: 'CA',
      types: []
    }]

    const addressResult = {
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      city: 'United States',
      country: 'United States'
    }

    const { address } = await addressParser(autocompleteResult1)

    expect(address).toEqual(addressResult)

    // with no city only state
    const _autocompleteResult = { ...autocompleteResult }

    _autocompleteResult.address_components=[{
      long_name: 'California',
      short_name: 'CA',
      types: ['administrative_area_level_1']
    }]

    const _addressResult = {
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      city: ', California',
      country: ''
    }

    const { address: _address } = await addressParser(_autocompleteResult)

    expect(_address).toEqual(_addressResult)
  })

  xit('should have correct workflow', async () => {
    render(
      <Provider>
        <NewManageCustomer />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard/mspCustomers/create' }
      })

    // Set required inputs
    const customerNameInput = screen.getByRole('textbox', { name: 'Customer Name' })
    fireEvent.change(customerNameInput, { target: { value: 'John' } })

    const emailInput = screen.getByRole('textbox', { name: 'Email' })
    fireEvent.change(emailInput, { target: { value: 'john@mail.com' } })

    const firstNameInput = screen.getByRole('textbox', { name: 'First Name' })
    fireEvent.change(firstNameInput, { target: { value: 'John' } })

    const lastNameInput = screen.getByRole('textbox', { name: 'Last Name' })
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } })

    // Click 'Next' button
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'close-circle' }))

    // Should be on second "Subscriptions" page
    expect(screen.getByRole('button', { name: 'Back' })).not.toBeDisabled()
    expect(screen.getByRole('heading', { name: 'Start service in' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Account Details' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    // Click 'Next' button
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    // Should be on last "Summary" page
    expect(screen.getByRole('button', { name: 'Back' })).not.toBeDisabled()
    expect(screen.getByRole('heading', { name: 'Summary' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Start service in' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Account Details' })).toBeNull()

    // Click 'Back' button
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    // Should be back on second "Subscriptions" page
    expect(screen.getByRole('button', { name: 'Back' })).not.toBeDisabled()
    expect(screen.getByRole('heading', { name: 'Start service in' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Account Details' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    // Click 'Back' button
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    // Should be back on first "Account Details" page
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Start service in' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    // Click 'Cancel' button
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    // Page should no longer be visible
    expect(screen.queryByRole('heading', { name: 'Start service in' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Account Details' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

  })

  it('should show dialog on service tier radio option change', async () => {
    params.action = 'edit'
    render(
      <Provider>
        <NewManageCustomer />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByRole('radio', { name: 'Professional' })).toBeEnabled()
    const radioBtn = screen.getByRole('radio', { name: 'Essentials' })
    await userEvent.click(radioBtn)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeVisible()
    const cancelDialog = screen.getAllByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelDialog[1])
    expect(screen.getByRole('radio', { name: 'Professional' })).toBeEnabled()
  })

  it('should render correctly for FF disabled', async () => {
    jest.mocked(useIsSplitOn)
      .mockImplementation(ff => ff !== Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE
          && ff !== Features.G_MAP
        && ff !== Features.MSP_APP_MONITORING)

    render(
      <Provider>
        <NewManageCustomer />
      </Provider>, {
        route: { params }
      })
  })

})
