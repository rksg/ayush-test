import '@testing-library/jest-dom'
import userEvent      from '@testing-library/user-event'
import { Path, rest } from 'msw'

import { ToastProps }                                                                 from '@acx-ui/components'
import { AssignedEc, MspAdministrator, MspEcData, MspEcDelegatedAdmins, MspUrlsInfo } from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo }                                                     from '@acx-ui/rc/utils'
import { Provider }                                                                   from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor }                             from '@acx-ui/test-utils'
import { RolesEnum }                                                                  from '@acx-ui/types'
import { UserUrlsInfo }                                                               from '@acx-ui/user'
import { AccountType }                                                                from '@acx-ui/utils'

import { ManageIntegrator, addressParser } from '.'

const timezoneResult = {
  dstOffset: 3600,
  rawOffset: -28800,
  status: 'OK',
  timeZoneId: 'America/Los_Angeles',
  timeZoneName: 'Pacific Daylight Time'
}

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
      types: ['postal_code']
    },
    {
      long_name: '1026',
      short_name: '1026',
      types: ['postal_code_suffix']
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
      courtesyMspEntitlementsUsed: false,
      deviceType: 'MSP_WIFI',
      quantity: 93,
      remainingDevices: 12,
      trial: false
    },
    {
      courtesyMspEntitlementsUsed: false,
      deviceSubType: 'ICX_76',
      deviceType: 'MSP_SWITCH',
      quantity: 13,
      remainingDevices: 92,
      trial: false
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
      deviceType: 'MSP_WIFI',
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
      deviceType: 'MSP_SWITCH',
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
      // id?: string;
      name: 'mspeleu',
      // tenant_type?: string,
      // address?: Address,
      street_address: '123 Main Street',
      // state?: string;
      // country?: string;
      // postal_code?: string;
      // phone_number?: string;
      // fax_number?: string;
      // city?: string;
      // mapping_url?: string;
      // service_effective_date?: string;
      // service_expiration_date?: string;
      is_active: 'true'
      // tenant_id?: string;
      // parent_tenant_id?: string;
      // admin_email?: string;
      // admin_firstname?: string;
      // admin_lastname?: string;
      // admin_role?: string;
      // licenses?: {};
      // delegations?: MspIntegratorDelegated[];
      // admin_delegations?: MspEcDelegatedAdmins[];
      // number_of_days?: string;
    }

const administrators: MspAdministrator[] = [
  {
    id: 'id1',
    lastName: 'Smith',
    name: 'John',
    email: 'johnsmith@mail.com',
    role: RolesEnum.PRIME_ADMIN,
    // delegateToAllECs?: boolean;
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


describe('ManageIntegrator', () => {
  let params: { tenantId: string, mspEcTenantId: string, action: string, type?: string }
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
      rest.get(
        MspUrlsInfo.getAssignedMspEcToIntegrator.url.split('?')[0] as Path,
        (_req, res, ctx) => res(ctx.json(assignedEc))
      ),
      rest.post(
        MspUrlsInfo.addMspEcAccount.url,
        (_req, res, ctx) => res(ctx.json({ requestId: 'add' }))
      ),
      rest.put(
        MspUrlsInfo.updateMspEcAccount.url,
        (_req, res, ctx) => res(ctx.json({ requestId: 'update' }))
      ),
      rest.get(
        'https://maps.googleapis.com/maps/api/timezone/*',
        (req, res, ctx) => res(ctx.json(timezoneResult))
      )
    )

    jest.spyOn(services, 'useAddCustomerMutation')
    jest.spyOn(services, 'useUpdateCustomerMutation')
    services.useMspAssignmentSummaryQuery = jest.fn().mockImplementation(() => {
      return { data: assignmentSummary }
    })
    services.useMspAssignmentHistoryQuery = jest.fn().mockImplementation(() => {
      return { data: assignmentHistory }
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
    services.useMspEcAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: ecAdministrators }
    })
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: list }
    })

    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710',
      mspEcTenantId: '1576b79db6b549f3b1f3a7177d7d4ca5',
      action: 'add',
      type: AccountType.MSP_INTEGRATOR
    }
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render correctly for add', async () => {
    render(
      <Provider>
        <ManageIntegrator />
      </Provider>, {
        route: { params, path: '/:tenantId/integrators/create' }
      })

    expect(screen.getByText('Add Tech Partner')).toBeVisible()

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Customers' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Subscriptions' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()
  })
  it('should render correctly for edit', async () => {
    params.action = 'edit'
    render(
      <Provider>
        <ManageIntegrator />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Tech Partner Account')).toBeVisible()

    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Account Administrator' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Subscriptions' })).toBeVisible()

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  })
  it('should validate required inputs correctly', async () => {
    render(
      <Provider>
        <ManageIntegrator />
      </Provider>, {
        route: { params, path: '/:tenantId/integrators/create' }
      })

    // expect(screen.getByPlaceholderText('Set address here')).toBeDisabled()
    expect(screen.queryByText('Please enter Account Name')).toBeNull()

    // Click 'Next' button
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    // Should still be on first "Account Details" page due to invalid input
    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Customers' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Subscriptions' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Summary' })).toBeNull()

    // Validator alert should appear for invalid input
    expect(await screen.findByText('Please enter Account Name')).toBeVisible()
  })
  it('should validate wifi subscription input correctly', async () => {
    render(
      <Provider>
        <ManageIntegrator />
      </Provider>, {
        route: { params }
      })

    // Input valid values for other fields
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'JohnSmith' } })
    expect(await screen.findByDisplayValue('JohnSmith')).toBeVisible()
    fireEvent.change(inputs[2], { target: { value: 'john@mail.com' } })
    expect(await screen.findByDisplayValue('john@mail.com')).toBeVisible()
    fireEvent.change(inputs[3], { target: { value: 'John' } })
    expect(await screen.findByDisplayValue('John')).toBeVisible()
    fireEvent.change(inputs[4], { target: { value: 'Smith' } })
    expect(await screen.findByDisplayValue('Smith')).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Access Periods' })).toBeVisible()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => {
      expect(screen.getByText('WiFi Subscription')).toBeVisible()
    })

    // Input invalid wifi subscription number
    const input = screen.getAllByRole('spinbutton')
    fireEvent.change(input[0], { target: { value: '-1' } })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    // Assert error alert shows up
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeVisible()
    })
  })
  it('should save correctly for add', async () => {
    render(
      <Provider>
        <ManageIntegrator />
      </Provider>, {
        route: { params }
      })

    // Input valid values for all required fields
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'JohnSmith' } })
    expect(await screen.findByDisplayValue('JohnSmith')).toBeVisible()
    fireEvent.change(inputs[2], { target: { value: 'john@mail.com' } })
    expect(await screen.findByDisplayValue('john@mail.com')).toBeVisible()
    fireEvent.change(inputs[3], { target: { value: 'John' } })
    expect(await screen.findByDisplayValue('John')).toBeVisible()
    fireEvent.change(inputs[4], { target: { value: 'Smith' } })
    expect(await screen.findByDisplayValue('Smith')).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Access Periods' })).toBeVisible()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => {
      expect(screen.getByText('WiFi Subscription')).toBeVisible()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Summary' })).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Add Tech Partner' }))

    // Wait for form to finish
    await waitFor(() => {
      expect(screen.getAllByRole('textbox')[0]).toHaveValue('')
    })

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: 'add' },
      status: 'fulfilled'
    })]

    // Assert correct api and navigate were called
    await waitFor(() => {
      expect(services.useAddCustomerMutation).toHaveLastReturnedWith(value)
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/v/integrators`,
      hash: '',
      search: ''
    }, { replace: true })
  })
  it('should save correctly for edit', async () => {
    params.action = 'edit'
    render(
      <Provider>
        <ManageIntegrator />
      </Provider>, {
        route: { params }
      })


    const input = screen.getAllByRole('spinbutton')
    fireEvent.change(input[0], { target: { value: '1' } })
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
      pathname: `/${params.tenantId}/v/integrators`,
      hash: '',
      search: ''
    }, { replace: true })
  })
  it('should call address parser', async () => {
    const { address } = await addressParser(autocompleteResult)

    const addressResult = {
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
      city: 'United States',
      country: 'United States'
    }

    expect(address).toEqual(addressResult)
  })
})
