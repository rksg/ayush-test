import  userEvent from '@testing-library/user-event'
import { rest }   from 'msw'

import { showToast }                                from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { mspApi }                                   from '@acx-ui/msp/services'
import { MspUrlsInfo }                              from '@acx-ui/msp/utils'
import { administrationApi }                        from '@acx-ui/rc/services'
import { AdministrationUrlsInfo }                   from '@acx-ui/rc/utils'
import { Provider, store }                          from '@acx-ui/store'
import { mockServer, render, screen, waitFor  }     from '@acx-ui/test-utils'

import { mockedEtitlementsList, mockedSummary } from '../__tests__/fixtures'

import PendingActivations from '.'

const mockedWindowOpen = jest.fn()
const mockedRefreshFn = jest.fn()
jest.spyOn(Date, 'now').mockImplementation(() => {
  return new Date('2023-01-11T12:33:37.101+00:00').getTime()
})
jest.spyOn(window, 'open').mockImplementation(mockedWindowOpen)
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  showToast: jest.fn()
}))
jest.mock('./SubscriptionHeader', () => ({
  SubscriptionHeader: () => (<div data-testid='rc-SubscriptionHeader' />)
}))
const services = require('@acx-ui/rc/services')
const activations = {
  data: [{
    orderId: '123',
    productName: 'test',
    productCode: 'aaa',
    quantity: 100,
    spaEndDate: '2024-12-01',
    orderCreateDate: '2024-03-03',
    orderAcxRegistrationCode: 'ABC123'
  }]
}

describe('PendingActivations', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.DEVICE_AGNOSTIC)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    mockedWindowOpen.mockClear()
    mockedRefreshFn.mockClear()

    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }

    store.dispatch(administrationApi.util.resetApiState())
    store.dispatch(mspApi.util.resetApiState())

    services.useGetEntitlementsListQuery = jest.fn().mockImplementation(() => {
      return { data: mockedEtitlementsList }
    })
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.refreshLicensesData.url.split('?')[0],
        (req, res, ctx) => {
          if (req.url.searchParams.get('refresh') === 'true') {
            mockedRefreshFn()
            return res(ctx.status(202))
          } else {
            return res(ctx.json({
              banners: [],
              entitlements: mockedEtitlementsList,
              summary: mockedSummary
            }))
          }
        }
      ),
      rest.post(
        AdministrationUrlsInfo.internalRefreshLicensesData.oldUrl as string,
        (_req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        MspUrlsInfo.getMspProfile.url,
        (_req, res, ctx) => res(ctx.json({
          msp_external_id: '0000A000001234YFFOO',
          msp_label: '',
          msp_tenant_name: ''
        }))
      ),
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

    expect(screen.getByRole('button', { name: 'Manage Subscriptions' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeVisible()
    await screen.findByRole('columnheader', { name: 'SPA Activation Code' })
    expect(await screen.findByRole('row', { name: /test/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /aaa/i })).toBeVisible()
  })

  it('should refresh successfully', async () => {
    const mockedShowToast = jest.fn()
    jest.mocked(showToast).mockImplementation(mockedShowToast)

    render(
      <Provider>
        <PendingActivations />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByRole('row', { name: /test/i })).toBeVisible()

    const licenseManagementButton =
    await screen.findByRole('button', { name: 'Manage Subscriptions' })
    await userEvent.click(licenseManagementButton)
    expect(mockedWindowOpen).toBeCalled()
    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    await userEvent.click(refreshButton)
    await waitFor(() => expect(mockedRefreshFn).toBeCalled())
  })

  it('should display toast message when refresh failed', async () => {
    const spyConsole = jest.spyOn(console, 'log')
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.refreshLicensesData.url.split('?')[0],
        (req, res, ctx) => {
          if (req.url.searchParams.get('refresh') === 'true')
            return res(ctx.status(500))
          else
            return res(ctx.json({
              banners: [],
              entitlements: mockedEtitlementsList,
              summary: mockedSummary
            }))
        }
      ),
      rest.post(
        AdministrationUrlsInfo.internalRefreshLicensesData.oldUrl as string,
        (_req, res, ctx) => res(ctx.status(500))
      )
    )

    render(
      <Provider>
        <PendingActivations />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('columnheader', { name: 'SPA Activation Code' })
    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    await userEvent.click(refreshButton)
    // FIXME: might need to fix when general error handler behavior changed.
    await waitFor(() => expect(spyConsole).toBeCalled())
  })

  it('should open window correctly when activation code clicked', async () => {
    render(
      <Provider>
        <PendingActivations />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(await screen.findByRole('button', { name: /ABC123/i }))
    expect(mockedWindowOpen).toBeCalled()
  })
})
