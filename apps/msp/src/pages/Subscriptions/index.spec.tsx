import '@testing-library/jest-dom'
import { Path, rest } from 'msw'

import { Features, useIsSplitOn }                                            from '@acx-ui/feature-toggle'
import { MspUrlsInfo }                                                       from '@acx-ui/msp/utils'
import { Provider }                                                          from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitForElementToBeRemoved  } from '@acx-ui/test-utils'

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
      expirationDate: 'Tue Dec 01 23:59:59 UTC 2026',
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

describe('Subscriptions', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
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
        MspUrlsInfo.getMspCustomersListDropdown.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json({}))
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
    expect(screen.getAllByText('Expired')).toHaveLength(2)
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
    expect(screen.getAllByText('Expired')).toHaveLength(2)
    const generateUsageButton = await screen.findByRole('button', { name: 'Generate Usage Report' })
    fireEvent.click(generateUsageButton)
    const licenseManagementButton =
    await screen.findByRole('button', { name: 'Manage Subscriptions' })
    fireEvent.click(licenseManagementButton)
    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    fireEvent.click(refreshButton)
  })

  it('should render correctly MSP_SELF_ASSIGNMENT feature flag on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_SELF_ASSIGNMENT)
    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getAllByText('Active')).toHaveLength(2)
    expect(screen.getAllByText('Expired')).toHaveLength(2)
    const generateUsageButton = await screen.findByRole('button', { name: 'Generate Usage Report' })
    fireEvent.click(generateUsageButton)
    const licenseManagementButton =
    await screen.findByRole('button', { name: 'Manage Subscriptions' })
    fireEvent.click(licenseManagementButton)
    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    fireEvent.click(refreshButton)
  })

})
