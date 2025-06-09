/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                                             from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo, CommonUrlsInfo, VenueObjectList } from '@acx-ui/rc/utils'
import { Provider }                                                from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  waitFor
} from '@acx-ui/test-utils'

import { fakedPrivilegeGroupList } from '../__tests__/fixtures'

import { EditPrivilegeGroup } from './EditPrivilegeGroup'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: jest.fn().mockReturnValue({ state: {
    isOnboardedMsp: true,
    name: 'custom role',
    description: 'custom role'
  } }),
  useTenantLink: () => jest.fn()
}))

const router = require('react-router-dom')

const mspServices = require('@acx-ui/msp/services')
const services = require('@acx-ui/rc/services')


const venueList = {
  totalCount: 3,
  page: 1,
  data: [
    {
      id: '81bcdd47ae0a49c2b2bab470ceb9e24d',
      name: 'new venue',
      country: 'United States'
    },
    {
      id: '0bac1d1f17644dd39090bee1b204a637',
      name: 'new venue 2',
      country: 'United States'
    },
    {
      id: '33292ac6f6ac4c75953da823b93d094f',
      name: 'test',
      country: 'Hong Kong'
    }
  ]
}

const customerList = {
  totalCount: 6,
  page: 1,
  data: [
    {
      id: '3756dcf148c2473ba0c3dd8b811a9bcd',
      name: 'AC Hotel Atlanta Airport Gateway',
      entitlements: [],
      children: [{ name: 'Venue A', id: 'AAA', selected: false }]
    },
    {
      id: '07da017483044526875ae33acbd0117e',
      name: 'Amy',
      entitlements: [
        {
          expirationDateTs: '1711558765000',
          consumed: '0',
          quantity: '50',
          entitlementDeviceType: 'DVCNWTYPE_APSW',
          tenantId: '07da017483044526875ae33acbd0117e',
          type: 'entitlement',
          expirationDate: '2024-03-27T16:59:25Z',
          toBeRemovedQuantity: 0,
          accountType: 'TRIAL',
          wifiDeviceCount: '0',
          switchDeviceCount: '0',
          edgeDeviceCount: '0',
          outOfComplianceDevices: '0',
          futureOutOfComplianceDevices: '0',
          futureOfComplianceDate: '1711558765000'
        }
      ],
      accountType: 'TRIAL',
      wifiLicenses: 0,
      switchLicenses: 0,
      edgeLicenses: 0,
      apSwLicenses: 50,
      installerCount: 0,
      integratorCount: 0,
      children: [
        { name: 'Venue B', id: 'BBB', selected: false },
        { name: 'Venue Z', id: 'ZZZZ', selected: false }
      ]
    },
    {
      id: '5d4b605aa0604241b2cd7a238b7d5c56',
      name: 'int 1',
      entitlements: [],
      installerCount: 0,
      integratorCount: 0,
      children: [{ name: 'Venue C', id: 'CCC', selected: false }]
    },
    {
      id: '3f8dd5028b0f4a9da61a0d69c50405b6',
      name: 'new ec Platinum',
      entitlements: [
        {
          expirationDateTs: '1707421038000',
          consumed: '0',
          quantity: '50',
          entitlementDeviceType: 'DVCNWTYPE_APSW',
          tenantId: '3f8dd5028b0f4a9da61a0d69c50405b6',
          type: 'entitlement',
          expirationDate: '2024-02-08T19:37:18Z',
          toBeRemovedQuantity: 0,
          accountType: 'TRIAL',
          wifiDeviceCount: '0',
          switchDeviceCount: '0',
          edgeDeviceCount: '0',
          outOfComplianceDevices: '0',
          futureOutOfComplianceDevices: '0',
          futureOfComplianceDate: '1707421038000'
        }
      ],
      accountType: 'TRIAL',
      wifiLicenses: 0,
      switchLicenses: 0,
      edgeLicenses: 0,
      apSwLicenses: 50,
      installerCount: 0,
      integratorCount: 0,
      children: [{ name: 'Venue D', id: 'DDD', selected: false }]
    },
    {
      id: '4378c5e5cddb483594cca0a48a74007a',
      name: 'new gold ec',
      entitlements: [
        {
          expirationDateTs: '1707420886000',
          consumed: '0',
          quantity: '50',
          entitlementDeviceType: 'DVCNWTYPE_APSW',
          tenantId: '4378c5e5cddb483594cca0a48a74007a',
          type: 'entitlement',
          expirationDate: '2024-02-08T19:34:46Z',
          toBeRemovedQuantity: 0,
          accountType: 'TRIAL',
          wifiDeviceCount: '0',
          switchDeviceCount: '0',
          edgeDeviceCount: '0',
          outOfComplianceDevices: '0',
          futureOutOfComplianceDevices: '0',
          futureOfComplianceDate: '1707420886000'
        }
      ],
      accountType: 'TRIAL',
      wifiLicenses: 0,
      switchLicenses: 0,
      edgeLicenses: 0,
      apSwLicenses: 50,
      installerCount: 0,
      integratorCount: 0,
      children: [{ name: 'Venue E', id: 'EEE', selected: false }]
    },
    {
      id: 'de2dae3028ac40d39c08221bf24a191c',
      name: 'test tier',
      entitlements: [
        {
          expirationDateTs: '1706379418000',
          consumed: '0',
          quantity: '50',
          entitlementDeviceType: 'DVCNWTYPE_APSW',
          tenantId: 'de2dae3028ac40d39c08221bf24a191c',
          type: 'entitlement',
          expirationDate: '2024-01-27T18:16:58Z',
          toBeRemovedQuantity: 0,
          accountType: 'TRIAL',
          wifiDeviceCount: '0',
          switchDeviceCount: '0',
          edgeDeviceCount: '0',
          outOfComplianceDevices: '0',
          futureOutOfComplianceDevices: '0',
          futureOfComplianceDate: '1706379418000'
        }
      ],
      accountType: 'TRIAL',
      wifiLicenses: 0,
      switchLicenses: 0,
      edgeLicenses: 0,
      apSwLicenses: 50,
      installerCount: 0,
      integratorCount: 0,
      children: [{ name: 'Venue F', id: 'FFF', selected: false }]
    }
  ]
}

let firstSelectedVenueList = {} as VenueObjectList
firstSelectedVenueList['com.ruckus.cloud.venue.model.venue'] = ['BBB']
let secondSelectedVenueList = {} as VenueObjectList
secondSelectedVenueList['com.ruckus.cloud.venue.model.venue'] = ['AAA']
const privilegeGroup = {
  allCustomers: false,
  delegation: true,
  description: 'some description',
  name: 'some-name',
  type: 'Custom',
  roleName: 'READ_ONLY',
  policies: [{
    id: 'policyId',
    entityInstanceId: '81bcdd47ae0a49c2b2bab470ceb9e24d'
  }],
  policyEntityDTOS: [{
    tenantId: '07da017483044526875ae33acbd0117e',
    allVenues: true
  }, {
    tenantId: '3756dcf148c2473ba0c3dd8b811a9bcd',
    allVenues: false,
    objectList: secondSelectedVenueList
  }]
}

describe('Edit Privilege Group', () => {
  let params: { tenantId: string, groupId: string, action?: string }
  beforeEach(() => {
    params = {
      tenantId: '8c36a0a9ab9d4806b060e112205add6f',
      groupId: 'abc'
    }
    jest.spyOn(services, 'useUpdatePrivilegeGroupMutation')
    mspServices.useGetMspProfileQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
    services.useGetCustomRolesQuery = jest.fn().mockImplementation(() => {
      return { data: [{ name: 'PRIME_ADMIN' }] }
    })
    mspServices.useGetMspEcWithVenuesListQuery = jest.fn().mockImplementation(() => {
      return { data: customerList }
    })
    services.useGetOnePrivilegeGroupQuery = jest.fn().mockImplementation(() => {
      return { data: privilegeGroup }
    })
    services.useGetVenuesQuery = jest.fn().mockImplementation(() => {
      return { data: venueList }
    })
    mspServices.useGetMspEcListQuery = jest.fn().mockImplementation(() => {
      return { data: customerList }
    })
    services.useGetPrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
      return { data: fakedPrivilegeGroupList }
    })
    mockServer.use(
      rest.put(
        AdministrationUrlsInfo.updatePrivilegeGroup.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(venueList))
      )
    )
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render correctly', async () => {
    render(
      <Provider>
        <EditPrivilegeGroup />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Group Settings')).toBeVisible()
    expect(screen.getByText('Name')).toBeVisible()
    expect(screen.getByText('Description')).toBeVisible()
    expect(screen.getByText('Role')).toBeVisible()
    expect(screen.getByText('Scope')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should save correctly', async () => {
    render(
      <Provider>
        <EditPrivilegeGroup />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Group Settings')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(services.useUpdatePrivilegeGroupMutation).toHaveLastReturnedWith(value)
    })
    expect(mockedUsedNavigate).toHaveBeenLastCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/privilegeGroups`,
      hash: '',
      search: ''
    })
  })
  it('should close correctly', async () => {
    render(
      <Provider>
        <EditPrivilegeGroup />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Group Settings')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockedUsedNavigate).toHaveBeenLastCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/privilegeGroups`,
      hash: '',
      search: ''
    })
  })
  it('should display selected venues and customers correctly', async () => {
    params.action = 'edit'
    render(
      <Provider>
        <EditPrivilegeGroup />
      </Provider>, {
        route: { params }
      }
    )
    // Select venues
    await userEvent.click(screen.getByRole('radio', { name: 'All Venues' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Specific Venues' }))
    expect(await screen.findByText('new venue')).toBeVisible()
    await userEvent.click(screen.getAllByRole('button', { name: 'Change' })[0])
    await screen.findByText('Select Venues')
    await screen.findByText('new venue 2')
    expect(screen.getAllByRole('checkbox')).toHaveLength(6)
    await userEvent.click(screen.getAllByRole('checkbox')[2])
    expect(screen.getByText('3 selected')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Save Selection' }))
    expect(await screen.findByText('new venue')).toBeVisible()
    expect(screen.getByText('new venue 2')).toBeVisible()
    expect(screen.getByText('test')).toBeVisible()

    // Select customers
    await userEvent.click(screen.getByRole('radio', { name: 'All Customers' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Specific Customer(s)' }))
    expect(screen.getByText('AC Hotel Atlanta Airport Gateway (1 Venues)')).toBeVisible()
    expect(screen.getByText('Amy (All Venues)')).toBeVisible()
    await userEvent.click(screen.getAllByRole('button', { name: 'Change' })[1])
    await screen.findByText('Select Customers')
    await screen.findByText('int 1')
    expect(screen.getAllByRole('checkbox')).toHaveLength(9)
    await userEvent.click(screen.getAllByRole('checkbox')[3])
    await userEvent.click(screen.getAllByRole('checkbox')[4])
    await userEvent.click(screen.getAllByRole('checkbox')[5])
    await userEvent.click(screen.getByRole('button', { name: 'Save Selection' }))
    expect(screen.queryByText('AC Hotel Atlanta Airport Gateway (1 Venues)')).toBeNull()
    expect(screen.queryByText('Amy (All Venues)')).toBeNull()
    expect(screen.getByText('int 1 (All Venues)')).toBeVisible()

    // Add
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]

    await waitFor(() => {
      expect(services.useUpdatePrivilegeGroupMutation).toHaveLastReturnedWith(value)
    })
    expect(mockedUsedNavigate).toHaveBeenLastCalledWith({
      pathname: `/${params.tenantId}/t/administration/userPrivileges/privilegeGroups`,
      hash: '',
      search: ''
    })
  })
  it('should render correctly for not onboarded msp', async () => {
    jest.spyOn(router, 'useLocation').mockReturnValue({ state: {
      isOnboardedMsp: false,
      name: 'custom role'
    } })

    render(
      <Provider>
        <EditPrivilegeGroup />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Name')).toBeVisible()
    expect(screen.getByText('Description')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.queryByText('Own Account')).toBeNull()
    await userEvent.click(screen.getByRole('radio', { name: 'Specific Venues' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Change' }))
    await screen.findByText('Select Venues')
    await screen.findByText('new venue')
    await screen.findByText('new venue 2')
    await screen.findByText('test')
    expect(screen.getAllByRole('checkbox')).toHaveLength(4)
    await userEvent.click(screen.getAllByRole('checkbox')[2])
    expect(screen.getByRole('button', { name: 'Save Selection' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Save Selection' }))
    await waitFor(() => {
      expect(screen.queryByText('Select Venues')).toBeNull()
    })
    expect(screen.getByText('new venue 2')).toBeVisible()
  })
})
