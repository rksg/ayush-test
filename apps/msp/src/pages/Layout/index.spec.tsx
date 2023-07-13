import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo, MspUrlsInfo }         from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import Layout from '.'

const tenantDetail = {
  createdDate: '2022-12-24T01:06:03.205+00:00',
  entitlementId: 'asgn__24de8731-832c-4191-b1b0-c2d2a339d6b1_GioRFRJW',
  externalId: '_24de8731-832c-4191-b1b0-c2d2a339d6b1_GioRFRJW',
  id: '3061bd56e37445a8993ac834c01e2710',
  isActivated: true,
  maintenanceState: false,
  name: 'Din Tai Fung',
  ruckusUser: false,
  status: 'active',
  tenantType: 'VAR',
  updatedDate: '2022-12-24T01:06:05.021+00:00',
  upgradeGroup: 'production'
}

const userProfile1 = {
  adminId: '9b85c591260542c188f6a12c62bb3912',
  companyName: 'msp.eleu1658',
  dateFormat: 'mm/dd/yyyy',
  detailLevel: 'debug',
  email: 'msp.eleu1658@mail.com',
  externalId: '0032h00000gXuBNAA0',
  firstName: 'msp',
  lastName: 'eleu1658',
  role: 'PRIME_ADMIN',
  support: true,
  tenantId: '3061bd56e37445a8993ac834c01e2710',
  username: 'msp.eleu1658@rwbigdog.com',
  var: true,
  varTenantId: '3061bd56e37445a8993ac834c01e2710',
  allowedRegions: []
}

const userProfile2 = {
  adminId: '9b85c591260542c188f6a12c62bb3912',
  companyName: 'demo.msp',
  dateFormat: 'mm/dd/yyyy',
  detailLevel: 'debug',
  email: 'demo.msp@mail.com',
  externalId: '0032h00000gXuBNAA0',
  firstName: 'demo',
  lastName: 'msp',
  role: 'PRIME_ADMIN',
  support: false,
  tenantId: '3061bd56e37445a8993ac834c01e2710',
  username: 'demo.msp@rwbigdog.com',
  var: true,
  varTenantId: '3061bd56e37445a8993ac834c01e2710',
  allowedRegions: []
}

const mspEcProfile = {
  is_active: 'false',
  msp_label: '',
  name: '',
  service_effective_date: '',
  service_expiration_date: ''
}

const entitlement =
  [
    {
      name: 'Switch',
      deviceSubType: 'ICX76',
      deviceType: 'MSP_SWITCH',
      effectiveDate: 'Mon Dec 06 00:00:00 UTC 2021',
      expirationDate: 'Tue Dec 06 23:59:59 UTC 2023',
      id: '358889502-1',
      isTrial: false,
      lastNotificationDate: null,
      quantity: 100,
      sku: 'CLD-MS76-1001',
      status: 'VALID'
    },
    {
      name: 'Wi-Fi',
      deviceSubType: 'MSP_WIFI',
      deviceType: 'MSP_WIFI',
      effectiveDate: 'Mon Dec 06 00:00:00 UTC 2021',
      expirationDate: 'Tue Dec 01 23:59:59 UTC 2023',
      id: '373419142-1',
      isTrial: false,
      lastNotificationDate: null,
      quantity: 80,
      sku: 'CLD-MW00-1001',
      status: 'VALID'
    },
    {
      name: 'Wi-Fi',
      deviceSubType: 'MSP_WIFI',
      deviceType: 'MSP_WIFI',
      effectiveDate: 'Mon Dec 06 00:00:00 UTC 2021',
      expirationDate: 'Tue Dec 01 23:59:59 UTC 2023',
      id: '373419143-1',
      isTrial: false,
      lastNotificationDate: null,
      quantity: 60,
      sku: 'CLD-MW00-1001',
      status: 'EXPIRED'
    }
  ]

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
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

describe('Layout', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetTenantDetailQuery = jest.fn().mockImplementation(() => {
      return { data: tenantDetail }
    })
    services.useGetMspEcProfileQuery = jest.fn().mockImplementation(() => {
      return { data: mspEcProfile }
    })
    services.useGetAlarmCountQuery = jest.fn().mockImplementation(() => {
      return {}
    })
    services.useAlarmsListQuery = jest.fn().mockImplementation(() => {
      return {}
    })
    services.useGetMspEntitlementBannersQuery = jest.fn().mockImplementation(() => {
      return []
    })
    user.useGetPlmMessageBannerQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
    services.useGetGlobalValuesQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (req, res, ctx) => res(ctx.json({
          data: [],
          totalCount: 0
        }))
      ),
      rest.post(
        CommonUrlsInfo.getActivityList.url,
        (req, res, ctx) => res(ctx.json({
          page: 1,
          totalCount: 0
        }))
      ),
      rest.get(
        MspUrlsInfo.getMspEntitlement.url,
        (req, res, ctx) => res(ctx.json(entitlement))
      ),
      rest.get(
        'https://docs.cloud.ruckuswireless.com/ruckusone/userguide/mapfile/doc-mapper.json',
        (req, res, ctx) => res(ctx.json({}))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render layout correctly for support', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile1 }
    })
    render(
      <Provider>
        <Layout />
      </Provider>, { route: { params } })

    await waitFor(async () => {
      expect(await screen.findByText('My Customers')).toBeVisible()
    })
    expect(screen.queryByRole('menuitem', { name: 'Tech Partners' })).toBeNull()
    expect(screen.queryByRole('menuitem', { name: 'Device Inventory' })).toBeNull()
    expect(screen.queryByRole('menuitem', { name: 'Subscriptions' })).toBeNull()
    expect(screen.queryByRole('menuitem', { name: 'Settings' })).toBeNull()
  })
  it('should render layout correctly for non-support', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile2 }
    })
    render(
      <Provider>
        <Layout />
      </Provider>, { route: { params } })

    await waitFor(async () => {
      expect(await screen.findByText('My Customers')).toBeVisible()
    })
    expect(screen.queryByRole('menuitem', { name: 'Tech Partners' })).toBeNull()
    expect(screen.getByRole('menuitem', { name: 'Device Inventory' })).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Subscriptions' })).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeVisible()
  })
  it('should render correctly if no data', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return {}
    })
    render(
      <Provider>
        <Layout />
      </Provider>, { route: { params } })

    await waitFor(async () => {
      expect(await screen.findByText('My Customers')).toBeVisible()
    })
    expect(screen.getByRole('menuitem', { name: 'Tech Partners' })).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Device Inventory' })).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Subscriptions' })).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeVisible()
  })
  it('should navigate correctly if guest manager', async () => {
    user.hasRoles = jest.fn().mockImplementation(() => {
      return true
    })
    render(
      <Provider>
        <Layout />
      </Provider>, { route: { params } })

    await waitFor(async () => {
      expect(await screen.findByText('My Customers')).toBeVisible()
    })
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/users/guestsManager`,
      hash: '',
      search: ''
    })
  })

  it('should navigate correctly if dpsk admin', async () => {
    user.hasRoles = jest.fn().mockImplementation(() => {
      return true
    })
    render(
      <Provider>
        <Layout />
      </Provider>, { route: { params } })

    await waitFor(async () => {
      expect(await screen.findByText('My Customers')).toBeVisible()
    })
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/users/dpskAdmin`,
      hash: '',
      search: ''
    })
  })
})
