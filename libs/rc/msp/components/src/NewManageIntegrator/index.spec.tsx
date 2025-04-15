import '@testing-library/jest-dom'
import userEvent      from '@testing-library/user-event'
import { Path, rest } from 'msw'

import { ToastProps }                                                                                  from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                                    from '@acx-ui/feature-toggle'
import { AssignedEc, MspAdministrator, MspEcData, MspEcDelegatedAdmins, MspRbacUrlsInfo, MspUrlsInfo } from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo, EntitlementDeviceType, LicenseUrlsInfo }                              from '@acx-ui/rc/utils'
import { Provider }                                                                                    from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved }                   from '@acx-ui/test-utils'
import { RolesEnum }                                                                                   from '@acx-ui/types'
import { UserUrlsInfo }                                                                                from '@acx-ui/user'
import { AccountType }                                                                                 from '@acx-ui/utils'

import { addressParser, NewManageIntegrator } from '.'

const user = require('@acx-ui/user')

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

describe('NewManageIntegrator', () => {
  let params: { tenantId: string, mspEcTenantId: string, action: string, type?: string }
  params = {
    tenantId: '3061bd56e37445a8993ac834c01e2710',
    mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
    action: 'add',
    type: AccountType.MSP_INTEGRATOR
  }
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  user.useUserProfileContext = jest.fn().mockImplementation(() => {
    return { data: userProfile }
  })
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
      rest.post(LicenseUrlsInfo.getMspEntitlementSummary.url,
        (req, res, ctx) => {
          assignmentSummaryMockFn()
          return res(ctx.json({ data: assignmentSummary }))
        }
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
      )

    )
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render correctly for add', async () => {
    render(
      <Provider>
        <NewManageIntegrator />
      </Provider>, {
        route: { params, path: '/:tenantId/integrators/create' }
      })

    expect(screen.getByText('Add Tech Partner')).toBeVisible()

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Customers' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Subscriptions' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    const inputs = screen.getAllByRole('textbox')
    await fireEvent.change(inputs[4], { target: { value: 'Smith' } })
    await fireEvent.change(inputs[0], { target: { value: 'JohnSmith' } })
    await fireEvent.change(inputs[2], { target: { value: 'john@mail.com' } })
    await fireEvent.change(inputs[3], { target: { value: 'John' } })
    await fireEvent.change(await screen.findByRole('textbox', { name: 'Address' }),
      { target: { value: 'US, virginia' } })

    const manageLink = screen.getAllByText('Manage')[0]

    await fireEvent.click(manageLink)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' })[0])

    await expect(screen.getByRole('row',
      { name: 'John johnsmith@mail.com Prime Admin' })).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))

    await expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await expect(await screen.findByRole('heading', { name: 'Access Period' })).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    await expect(await screen.findByRole('heading', { name: 'Subscriptions' })).toBeVisible()
    await expect(await screen.findAllByText('Service Expiration Date')).toHaveLength(2)

    const apswInput = screen.getAllByRole('spinbutton')[0]

    await fireEvent.change(apswInput, { target: { value: '1' } })

    const sltnInput = screen.getAllByRole('spinbutton')[1]

    await fireEvent.change(sltnInput, { target: { value: '1' } })

    fireEvent.mouseDown(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'Custom date' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()

    await expect(screen.getByRole('button', { name: 'Add Tech Partner' })).not.toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Add Tech Partner' }))

    await expect(addCustomerMockFn).toBeCalled()
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

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await expect(updateCustomerMockFn).toBeCalled()
  })
  it('should validate required inputs correctly', async () => {
    render(
      <Provider>
        <NewManageIntegrator />
      </Provider>, {
        route: { params, path: '/:tenantId/integrators/create' }
      })

    expect(screen.queryByText('Please enter Account Name')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Customers' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Subscriptions' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    expect(await screen.findByText('Please enter Account Name')).toBeVisible()
  })

  it('should render correctly for FF disabled', async () => {
    jest.mocked(useIsSplitOn)
      .mockImplementation(ff => ff !== Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE
        && ff !== Features.G_MAP
      && ff !== Features.MSP_APP_MONITORING)

    render(
      <Provider>
        <NewManageIntegrator />
      </Provider>, {
        route: { params, path: '/:tenantId/integrators/create' }
      })

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Customers' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Subscriptions' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    const inputs = screen.getAllByRole('textbox')
    await fireEvent.change(inputs[4], { target: { value: 'Smith' } })
    await fireEvent.change(inputs[0], { target: { value: 'JohnSmith' } })
    await fireEvent.change(inputs[2], { target: { value: 'john@mail.com' } })
    await fireEvent.change(inputs[3], { target: { value: 'John' } })
    await fireEvent.change(await screen.findByRole('textbox', { name: 'Address' }),
      { target: { value: 'US, virginia' } })


    await expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await expect(await screen.findByRole('heading', { name: 'Access Period' })).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    await expect(await screen.findByRole('heading', { name: 'Subscriptions' })).toBeVisible()

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
})
