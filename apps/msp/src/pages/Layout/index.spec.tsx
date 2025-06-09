import '@testing-library/jest-dom'
import { rest } from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed }              from '@acx-ui/feature-toggle'
import { Provider, rbacApiURL }                                  from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor }        from '@acx-ui/test-utils'
import { getUserProfile, setUserProfile }                        from '@acx-ui/user'
import { AccountVertical, getJwtTokenPayload, isDelegationMode } from '@acx-ui/utils'

import HspContext from '../../HspContext'

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

const tenantNonVarDetail = {
  createdDate: '2022-12-24T01:06:03.205+00:00',
  entitlementId: 'asgn__24de8731-832c-4191-b1b0-c2d2a339d6b1_GioRFRJW',
  externalId: '_24de8731-832c-4191-b1b0-c2d2a339d6b1_GioRFRJW',
  id: '3061bd56e37445a8993ac834c01e2710',
  isActivated: true,
  maintenanceState: false,
  name: 'Din Tai Fung',
  ruckusUser: false,
  status: 'active',
  tenantType: 'MSP_NON_VAR',
  updatedDate: '2022-12-24T01:06:05.021+00:00',
  upgradeGroup: 'production'
}

const tenantInstallerDetail = {
  createdDate: '2022-12-24T01:06:03.205+00:00',
  entitlementId: 'asgn__24de8731-832c-4191-b1b0-c2d2a339d6b1_GioRFRJW',
  externalId: '_24de8731-832c-4191-b1b0-c2d2a339d6b1_GioRFRJW',
  id: '3061bd56e37445a8993ac834c01e2710',
  isActivated: true,
  maintenanceState: false,
  name: 'Din Tai Fung',
  ruckusUser: false,
  status: 'active',
  tenantType: 'MSP_INSTALLER',
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
const rcServices = require('@acx-ui/rc/services')
const user = require('@acx-ui/user')
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const mockedHasConfigTemplateAccess = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  hasConfigTemplateAccess: () => mockedHasConfigTemplateAccess
}))
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: jest.fn().mockReturnValue({
    lastName: '',
    firstName: '',
    userName: '',
    exp: 0,
    tenantId: '',
    acx_account_vertical: ''
  }),
  isDelegationMode: jest.fn().mockImplementation(() => {
    return false
  })
}))
jest.mock('@acx-ui/main/components', () => ({
  ...jest.requireActual('@acx-ui/main/components'),
  LicenseBanner: () => <div data-testid='license-banner' />,
  ActivityButton: () => <div data-testid='activity-button' />,
  AlarmsButton: () => <div data-testid='alarms-button' />,
  HelpButton: () => <div data-testid='help-button' />,
  UserButton: () => <div data-testid='user-button' />,
  FetchBot: () => <div data-testid='fetch-bot' />
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  CloudMessageBanner: () => <div data-testid='cloud-message-banner' />
}))

jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)

describe('Layout', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetTenantDetailQuery = jest.fn().mockImplementation(() => {
      return { data: tenantDetail }
    })
    services.useGetMspEcProfileQuery = jest.fn().mockImplementation(() => {
      return { data: mspEcProfile }
    })
    services.useMspEntitlementListQuery = jest.fn().mockImplementation(() => {
      return { data: entitlement }
    })
    rcServices.useRbacEntitlementListQuery = jest.fn().mockImplementation(() => {
      return { data: entitlement }
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
    services.useGetBrandingDataQuery = jest.fn().mockImplementation(() => {
      return { data: { msp_label: '', name: '' } }
    })

    mockServer.use(
      rest.get(`${rbacApiURL}/tenantSettings`, (_req, res, ctx) => res(ctx.json(
        [{ key: 'brand-name', value: 'testBrand' }]
      )))
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
    expect(screen.queryByRole('menuitem', { name: 'Portal Settings' })).toBeNull()
  })

  it('should hide menu options in case of LSP', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile2 }
    })
    services.useGetTenantDetailQuery = jest.fn().mockImplementation(() => {
      return { data: tenantInstallerDetail }
    })
    render(
      <Provider>
        <HspContext.Provider value={{
          state: {
            isHsp: true
          },
          dispatch: jest.fn()
        }}>
          <Layout />
        </HspContext.Provider>
      </Provider>, { route: { params } })


    await expect(await screen.findByText('My Customers')).toBeVisible()

    expect(screen.queryByRole('menuitem', { name: 'testBrand' })).toBeNull()
    await fireEvent.mouseOver(screen.getByRole('menuitem', { name: 'My Customers' }))
    await expect(await screen.findByText('MSP Customers')).toBeInTheDocument()
  })

  it('should render layout correctly for non-support', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile2 }
    })
    jest.mocked(isDelegationMode).mockReturnValue(true)
    jest.mocked(getJwtTokenPayload).mockReturnValue({
      lastName: '',
      firstName: '',
      userName: '',
      exp: 0,
      tenantId: '',
      acx_account_vertical: AccountVertical.HOSPITALITY
    })

    render(
      <Provider>
        <Layout />
      </Provider>, { route: { params } })

    await waitFor(async () => {
      expect(await screen.findByText('My Customers')).toBeVisible()
    })
    expect(await screen.findByText('Support Home')).toBeVisible()
    expect(await screen.findByText('Hospitality Edition')).toBeVisible()
    expect(screen.queryByRole('menuitem', { name: 'Tech Partners' })).toBeNull()
    expect(screen.getByRole('menuitem', { name: 'Device Inventory' })).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Subscriptions' })).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Portal Settings' })).toBeVisible()
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
    expect(screen.getByRole('menuitem', { name: 'Portal Settings' })).toBeVisible()
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
  it('should render layout correctly for non-var', async () => {
    services.useGetTenantDetailQuery = jest.fn().mockImplementation(() => {
      return { data: tenantNonVarDetail }
    })
    render(
      <Provider>
        <Layout />
      </Provider>, { route: { params } })

    await waitFor(async () => {
      expect(await screen.findByText('My Customers')).toBeVisible()
    })
    expect(screen.queryByRole('menuitem', { name: 'Var Customers' })).toBeNull()
    expect(screen.queryByRole('menuitem', { name: 'Tech Partners' })).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Device Inventory' })).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Subscriptions' })).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Portal Settings' })).toBeVisible()
  })

  it('should render config template layout for MSP-Non-Var users', async () => {
    mockedHasConfigTemplateAccess.mockReturnValue(true)

    render(
      <Provider>
        <Layout />
      </Provider>, { route: { params } })

    expect(await screen.findByRole('menuitem', { name: 'Templates' })).toBeVisible()
  })
  it('should render layout correctly for MSP_INSTALLER', async () => {
    services.useGetTenantDetailQuery = jest.fn().mockImplementation(() => {
      return { data: tenantInstallerDetail }
    })

    render(
      <Provider>
        <Layout />
      </Provider>, { route: { params } })

    await waitFor(async () => {
      expect(await screen.findByText('My Customers')).toBeVisible()
    })
    expect(screen.queryByRole('menuitem', { name: 'testBrand' })).toBeNull()
    expect(screen.getByRole('menuitem', { name: 'Device Inventory' })).toBeVisible()
    expect(await screen.findByText('My Customers')).toBeVisible()
  })

  it('should render menues correctly for HSP', async () => {

    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_HSP_SUPPORT)
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_BRAND_360)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <HspContext.Provider value={{
          state: {
            isHsp: true
          },
          dispatch: jest.fn()
        }}>
          <Layout />
        </HspContext.Provider>
      </Provider>, { route: { params } })

    expect(await screen.findByText('My Customers')).toBeVisible()
    await fireEvent.mouseOver(screen.getByRole('menuitem', { name: 'My Customers' }))
    await expect(await screen.findByText('Brand Properties'))
      .toBeInTheDocument()
  })

  it('should render menues correctly if rbacOpsApiEnabled is true', async () => {
    setUserProfile({
      ...getUserProfile(),
      rbacOpsApiEnabled: true
    })
    render(
      <Provider>
        <HspContext.Provider value={{
          state: {
            isHsp: true
          },
          dispatch: jest.fn()
        }}>
          <Layout />
        </HspContext.Provider>
      </Provider>, { route: { params } })

    expect(await screen.findByText('My Customers')).toBeVisible()
  })
})
