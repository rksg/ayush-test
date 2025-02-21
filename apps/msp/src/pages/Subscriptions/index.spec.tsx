import '@testing-library/jest-dom'
import moment         from 'moment'
import { Path, rest } from 'msw'

import { Features, useIsSplitOn }                                            from '@acx-ui/feature-toggle'
import { mspApi }                                                            from '@acx-ui/msp/services'
import { MspRbacUrlsInfo, MspUrlsInfo }                                      from '@acx-ui/msp/utils'
import { administrationApi }                                                 from '@acx-ui/rc/services'
import { AdministrationUrlsInfo, LicenseUrlsInfo }                           from '@acx-ui/rc/utils'
import { store, Provider }                                                   from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitForElementToBeRemoved  } from '@acx-ui/test-utils'
import { getUserProfile, setUserProfile }                                    from '@acx-ui/user'

import { Subscriptions } from '.'

const entitlement =
  [
    {
      name: 'Switch',
      deviceSubType: 'ICX76',
      deviceType: 'MSP_SWITCH',
      effectiveDate: 'Mon Dec 06 00:00:00 UTC 2021',
      expirationDate: 'Tue Dec 06 23:59:59 UTC 2026',
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
      expirationDate: moment().add(30, 'days'),
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
      expirationDate: 'Tue Jul 18 23:59:59 UTC 2023',
      id: '373419143-1',
      isTrial: false,
      lastNotificationDate: null,
      quantity: 60,
      sku: 'CLD-MW00-1001',
      status: 'EXPIRED'
    },
    {
      name: 'APSW',
      deviceSubType: 'MSP_APSW',
      deviceType: 'MSP_APSW',
      effectiveDate: moment().add(30, 'days'),
      expirationDate: moment().add(120, 'days'),
      id: '373419122-1',
      isTrial: false,
      lastNotificationDate: null,
      quantity: 60,
      sku: 'CLD-MW00-1001',
      status: 'FUTURE'
    }
  ]

const summary =
  [
    {
      deviceSubType: 'ICX',
      deviceType: 'MSP_SWITCH',
      isTrial: false,
      quantity: 10,
      remainingDevices: 5,
      trial: false
    },
    {
      deviceSubType: 'MSP_WIFI',
      deviceType: 'MSP_WIFI',
      isTrial: false,
      quantity: 45,
      remainingDevices: 15,
      trial: false
    }
  ]

const entitlementSummary =
{
  mspEntitlementSummaries:
  [
    {
      courtesyQuantity: 5,
      deviceType: 'MSP_WIFI',
      effectiveDate: '2022-03-29T00:00:00.000+00:00',
      expirationDate: '2023-03-29T23:59:59.000+00:00',
      licenseType: 'MSP_WIFI',
      quantity: 100,
      remainingDays: 0,
      remainingLicenses: 105,
      trial: false
    },
    {
      courtesyQuantity: 1,
      deviceType: 'MSP_SWITCH',
      effectiveDate: '2022-03-29T00:00:00.000+00:00',
      expirationDate: '2023-03-29T23:59:59.000+00:00',
      licenseType: 'MSP_ICX',
      quantity: 10,
      remainingDays: 0,
      remainingLicenses: 11,
      trial: false
    }
  ]
}

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
  tenantType: 'REC'
}

describe('Subscriptions', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    store.dispatch(mspApi.util.resetApiState())
    store.dispatch(administrationApi.util.resetApiState())
    mockServer.use(
      rest.get(
        MspUrlsInfo.getMspEntitlement.url,
        (req, res, ctx) => res(ctx.json(entitlement))
      ),
      rest.get(
        MspUrlsInfo.getMspAssignmentSummary.url,
        (req, res, ctx) => res(ctx.json(summary))
      ),
      rest.get(
        MspUrlsInfo.getMspEntitlementSummary.url.split('?').at(0) as Path,
        (req, res, ctx) => res(ctx.json(entitlementSummary))
      ),
      rest.get(
        MspUrlsInfo.refreshMspEntitlement.url.split('?').at(0) as Path,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        LicenseUrlsInfo.getEntitlementsList.url,
        (req, res, ctx) => res(ctx.json(entitlement))
      ),
      rest.post(
        LicenseUrlsInfo.getEntitlementSummary.url,
        (req, res, ctx) => res(ctx.json(summary))
      ),
      rest.get(
        AdministrationUrlsInfo.getTenantDetails.url,
        (req, res, ctx) => res(ctx.json(fakeTenantDetails))
      ),
      rest.patch(
        MspRbacUrlsInfo.refreshMspEntitlement.url,
        (req, res, ctx) => res(ctx.json(entitlement))
      )
    )
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }
  })
  it('should render correctly', async () => {
    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getAllByText('Active')).toHaveLength(2)
    expect(screen.queryByText('Expired')).toBeNull()
    const generateUsageButton = await screen.findByRole('button', { name: 'Generate Usage Report' })
    fireEvent.click(generateUsageButton)
    const licenseManagementButton =
    await screen.findByRole('button', { name: 'Manage Subscriptions' })
    fireEvent.click(licenseManagementButton)
    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    fireEvent.click(refreshButton)
  })
  it('should render correctly DEVICE_AGNOSTIC feature flag on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.DEVICE_AGNOSTIC)
    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getAllByText('Active')).toHaveLength(2)
    expect(screen.queryByText('Expired')).toBeNull()
    const generateUsageButton = await screen.findByRole('button', { name: 'Generate Usage Report' })
    fireEvent.click(generateUsageButton)
    const licenseManagementButton =
    await screen.findByRole('button', { name: 'Manage Subscriptions' })
    fireEvent.click(licenseManagementButton)
    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    fireEvent.click(refreshButton)
  })
  it('should render correctly rbac feature flag on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.ENTITLEMENT_RBAC_API)
    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    const generateUsageButton = await screen.findByRole('button', { name: 'Generate Usage Report' })
    fireEvent.click(generateUsageButton)
    const licenseManagementButton =
    await screen.findByRole('button', { name: 'Manage Subscriptions' })
    fireEvent.click(licenseManagementButton)
    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    fireEvent.click(refreshButton)
  })
  it('should render correctly virtual SmartEdge feature flag on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE)
    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    const generateUsageButton = await screen.findByRole('button', { name: 'Generate Usage Report' })
    fireEvent.click(generateUsageButton)
    const licenseManagementButton =
    await screen.findByRole('button', { name: 'Manage Subscriptions' })
    fireEvent.click(licenseManagementButton)
    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    fireEvent.click(refreshButton)
  })
  it('should render correctly when rbacOpsApiEnabled nabled', async () => {
    setUserProfile({
      ...getUserProfile(),
      rbacOpsApiEnabled: true
    })
    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getAllByText('Active')).toHaveLength(2)
    expect(screen.queryByText('Expired')).toBeNull()
  })
})
