import  userEvent from '@testing-library/user-event'
import { rest }   from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed }               from '@acx-ui/feature-toggle'
import { mspApi }                                                 from '@acx-ui/msp/services'
import { administrationApi }                                      from '@acx-ui/rc/services'
import { AdministrationUrlsInfo }                                 from '@acx-ui/rc/utils'
import { Provider, store }                                        from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved  } from '@acx-ui/test-utils'
import { getUserProfile, setUserProfile }                         from '@acx-ui/user'

import { PendingActivations } from '.'

const mockedEtitlementsList =
  [
    {
      name: 'Switch',
      deviceSubType: 'ICX76',
      deviceType: 'SWITCH',
      effectiveDate: 'Mon Dec 06 00:00:00 UTC 2021',
      expirationDate: 'Wed Dec 06 23:59:59 UTC 2023',
      id: '358889502-1',
      tempLicense: false,
      lastNotificationDate: null,
      quantity: 100,
      sku: 'CLD-MS76-1001'
    },
    {
      name: 'Wi-Fi',
      deviceType: 'WIFI',
      effectiveDate: 'Mon Dec 06 00:00:00 UTC 2021',
      expirationDate: 'Sun Jan 01 23:59:59 UTC 2023',
      id: '373419142-1',
      tempLicense: true,
      lastNotificationDate: null,
      quantity: 80,
      sku: 'CLD-MW00-1001'
    },
    {
      name: 'Switch',
      deviceSubType: 'ICX71L',
      deviceType: 'SWITCH',
      effectiveDate: 'Mon Dec 06 00:00:00 UTC 2021',
      expirationDate: 'Wed Dec 06 23:59:59 UTC 2023',
      id: '358889505-1',
      tempLicense: false,
      lastNotificationDate: null,
      quantity: 30,
      sku: 'CLD-S08M-3001'
    },
    {
      deviceType: 'EDGE',
      effectiveDate: 'Fri Dec 10 00:00:00 UTC 2021',
      expirationDate: 'Wed Dec 06 23:59:59 UTC 2023',
      id: '358889302-1',
      tempLicense: false,
      lastNotificationDate: null,
      quantity: 70,
      sku: ''
    },
    {
      deviceType: 'UNKOWNTYPE',
      effectiveDate: 'Sun Dec 12 00:00:00 UTC 2021',
      expirationDate: 'Wed Dec 06 23:59:59 UTC 2023',
      id: '358889509-1',
      tempLicense: false,
      lastNotificationDate: null,
      quantity: 50,
      sku: ''
    },
    {
      name: 'Device',
      deviceType: 'APSW',
      effectiveDate: 'Mon Dec 06 00:00:00 UTC 2021',
      expirationDate: 'Wed Dec 06 23:59:59 UTC 2023',
      id: '358889506-1',
      tempLicense: false,
      lastNotificationDate: null,
      quantity: 30,
      sku: '',
      assignedLicense: true
    },
    {
      name: 'Device',
      deviceType: 'APSW',
      effectiveDate: 'Fri Dec 06 00:00:00 UTC 2024',
      expirationDate: 'Wed Apr 02 23:59:59 UTC 2024',
      id: '358889508-1',
      tempLicense: false,
      lastNotificationDate: null,
      quantity: 10,
      sku: ''
    }
  ]

const mockedWindowOpen = jest.fn()
jest.spyOn(Date, 'now').mockImplementation(() => {
  return new Date('2023-01-11T12:33:37.101+00:00').getTime()
})
jest.spyOn(window, 'open').mockImplementation(mockedWindowOpen)
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))
const services = require('@acx-ui/rc/services')
const activations = {
  data: [{
    orderId: '123',
    productName: 'test',
    productCode: 'aaa',
    quantity: 100,
    spaEndDate: '2024-12-01',
    productClass: 'ACX-ESNT-NEW',
    orderCreateDate: '2024-03-03',
    orderAcxRegistrationCode: 'ABC123'
  },
  {
    orderId: 'a0EO3000001ZfR7MAK',
    salesOrderId: 'a0FO3000000xJ0DMAU',
    productName: 'RUCKUS One Trial REC 90-Day',
    productCode: 'CLD-R1-TMP090-REC',
    quantity: 100,
    spaStartDate: '2024-04-22',
    spaEndDate: '2024-07-22',
    productClass: 'ACX-TRIAL-NEW',
    orderCreateDate: '2024-04-22T08:53:05.000+0000',
    orderAcxRegistrationCode: 'ACX-03726426-BUG-HIT-AXE',
    trial: true
  },
  {
    orderId: 'a0EO3000001haUHMAY',
    salesOrderId: 'a0FO30000012DgXMAU',
    productName: 'R1 Pro 1 AP/SW REC 1-Yr',
    productCode: 'CLD-PROF-APSW-REC1',
    quantity: 60,
    spaStartDate: '2024-04-22',
    spaEndDate: '2025-04-22',
    productClass: 'ACX-PROF-NEW',
    orderCreateDate: '2024-04-22T08:53:05.000+0000',
    orderAcxRegistrationCode: 'ACX-03726426-BUG-HIT-AXE'
  }]
}

describe('PendingActivations', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.DEVICE_AGNOSTIC)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    mockedWindowOpen.mockClear()

    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }

    store.dispatch(administrationApi.util.resetApiState())
    store.dispatch(mspApi.util.resetApiState())

    services.useGetEntitlementsListQuery = jest.fn().mockImplementation(() => {
      return { data: mockedEtitlementsList }
    })
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.getEntitlementsActivations.url,
        (req, res, ctx) => res(ctx.json(activations))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <PendingActivations />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByRole('columnheader', { name: 'SPA Activation Code' })
    expect(await screen.findByRole('row', { name: /test/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /aaa/i })).toBeVisible()
  })

  it('should open drawer correctly when part number clicked', async () => {
    render(
      <Provider>
        <PendingActivations />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(await screen.findByRole('button', { name: /aaa/i }))
    expect(await screen.findByText('Activate Purchase')).toBeVisible()
  })

  it('should render correctly when rbacOpsApiEnabled nabled', async () => {
    setUserProfile({
      ...getUserProfile(),
      rbacOpsApiEnabled: true
    })
    render(
      <Provider>
        <PendingActivations />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByRole('columnheader', { name: 'SPA Activation Code' })
    expect(await screen.findByRole('row', { name: /test/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /aaa/i })).toBeVisible()
  })
})
