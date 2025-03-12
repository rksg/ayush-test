import  userEvent from '@testing-library/user-event'
import { rest }   from 'msw'

import { showToast }                                    from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { mspApi }                                       from '@acx-ui/msp/services'
import { MspRbacUrlsInfo, MspUrlsInfo }                 from '@acx-ui/msp/utils'
import { administrationApi }                            from '@acx-ui/rc/services'
import { AdministrationUrlsInfo }                       from '@acx-ui/rc/utils'
import { Provider, store }                              from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within  } from '@acx-ui/test-utils'
import { AccountType }                                  from '@acx-ui/utils'

import { mockedEtitlementsList, mockedSummary, fakeMspEcProfile } from './__tests__/fixtures'

import Subscriptions from '.'

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

const excludedFlags = [Features.DEVICE_AGNOSTIC, Features.ENTITLEMENT_PENDING_ACTIVATION_TOGGLE,
  Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE, Features.ENTITLEMENT_RBAC_API
]

describe('Subscriptions', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => !excludedFlags.includes(ff as Features))

    mockedWindowOpen.mockClear()
    mockedRefreshFn.mockClear()

    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }

    store.dispatch(administrationApi.util.resetApiState())
    store.dispatch(mspApi.util.resetApiState())

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
      rest.get(
        AdministrationUrlsInfo.getEntitlementsList.newApi
          ? AdministrationUrlsInfo.getEntitlementsList.url
          : AdministrationUrlsInfo.getEntitlementsList.oldUrl as string,
        (_req, res, ctx) => res(ctx.json(mockedEtitlementsList))
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
      rest.get(
        MspRbacUrlsInfo.getMspProfile.url,
        (_req, res, ctx) => res(ctx.json({
          msp_external_id: '0000A000001234YFFOO',
          msp_label: '',
          msp_tenant_name: ''
        }))
      ),
      rest.get(
        MspUrlsInfo.getMspEcProfile.url,
        (req, res, ctx) => res(ctx.json({ ...fakeMspEcProfile, tenantType: AccountType.REC }))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('columnheader', { name: 'Device Count' })
    expect(await screen.findByRole('row', { name: /ICX 7650/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /ICX 7150-C08P .* Active/i })).toBeVisible()
    expect(screen.queryByRole('row', { name: /Wi-Fi .* Expired/i })).toBeNull()
    expect((await screen.findByTestId('rc-SubscriptionHeader'))).toBeVisible()
  })

  it('should refresh successfully', async () => {
    const mockedShowToast = jest.fn()
    jest.mocked(showToast).mockImplementation(mockedShowToast)

    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByRole('row', { name: /ICX 7650/i })).toBeVisible()

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
        <Subscriptions />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('columnheader', { name: 'Device Count' })
    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    await userEvent.click(refreshButton)
    // FIXME: might need to fix when general error handler behavior changed.
    await waitFor(() => expect(spyConsole).toBeCalled())
  })

  it('should display empty string when subscription type is not mapped', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.DEVICE_AGNOSTIC)

    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params }
      })
    await screen.findByRole('columnheader', { name: 'Part Number' })
    const data = await screen.findAllByRole('row')
    // because it is default sorted by "timeleft" in descending order
    const cells = await within(data[data.length - 2] as HTMLTableRowElement).findAllByRole('cell')
    expect((cells[0] as HTMLTableCellElement).textContent).toBe('')
  })

  it('should correctly handle device sub type', async () => {
    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('columnheader', { name: 'Device Count' })
    await userEvent.click(screen.getByRole('button', { name: 'Clear Filters' }))
    const wifiRow = await screen.findByRole('row', { name: /Wi-Fi/i })
    const wifiRowCells = await within(wifiRow as HTMLTableRowElement).findAllByRole('cell')
    expect((wifiRowCells[1] as HTMLTableCellElement).innerHTML).toBe('Trial')

    const edgeRow = await screen.findByRole('row', { name: /RUCKUS Edge/i })
    const edgeRowCells = await within(edgeRow as HTMLTableRowElement).findAllByRole('cell')
    expect((edgeRowCells[1] as HTMLTableCellElement).innerHTML).toBe('Basic')
  })

  it('should correctly handle edge data', async () => {
    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('columnheader', { name: 'Device Count' })
    await screen.findByRole('row', { name: /RUCKUS Edge/i })
  })
  it('should filter edge data when edge FF is not denabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => !excludedFlags.concat(Features.EDGES_TOGGLE)
      .includes(ff as Features))

    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('columnheader', { name: 'Device Count' })
    await userEvent.click(screen.getByRole('button', { name: 'Clear Filters' }))
    await screen.findByRole('row', { name: /Wi-Fi/i })
    expect(screen.queryByRole('row', { name: /RUCKUS Edge/i })).toBeNull()
    expect((await screen.findByTestId('rc-SubscriptionHeader'))).toBeVisible()
    expect(screen.queryAllByText('RUCKUS Edge').length).toBe(0)
  })

  it('should show banner on no subscription active error', async () => {

    mockServer.use(rest.get(
      AdministrationUrlsInfo.getEntitlementsList.newApi
        ? AdministrationUrlsInfo.getEntitlementsList.url
        : AdministrationUrlsInfo.getEntitlementsList.oldUrl as string,
      (req, res, ctx) => {
        return res(ctx.status(417), ctx.json({
          errors: [{
            code: 'ENTITLEMENT-10003',
            message: `Cannot display subscription data: entitlement ID is missing.
            At least one tenant subscription must be active.`
          }]
        }))
      }
    ))

    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params }
      })

    // eslint-disable-next-line max-len
    expect(await screen.findByText('At least one active subscription must be available! Please activate subscription and click on'))
      .toBeVisible()
    const refreshButton = await screen.findByTestId('bannerRefreshLink')
    await userEvent.click(refreshButton)
    await waitFor(() => expect(mockedRefreshFn).toBeCalled())
  })
})
