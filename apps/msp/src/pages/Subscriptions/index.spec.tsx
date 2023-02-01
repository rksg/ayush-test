import '@testing-library/jest-dom'
import { rest } from 'msw'

import { MspUrlsInfo }                                                       from '@acx-ui/rc/utils'
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
    const GenerateUsageButton = await screen.findByRole('button', { name: 'Generate Usage Report' })
    fireEvent.click(GenerateUsageButton)
    const licenseManagementButton =
    await screen.findByRole('button', { name: 'Manage Subsciptions' })
    fireEvent.click(licenseManagementButton)
    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    fireEvent.click(refreshButton)

  })
})
