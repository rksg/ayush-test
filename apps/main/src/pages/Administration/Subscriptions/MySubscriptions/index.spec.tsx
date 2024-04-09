import  userEvent from '@testing-library/user-event'
import { rest }   from 'msw'

import { showToast }                                                               from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                from '@acx-ui/feature-toggle'
import { mspApi }                                                                  from '@acx-ui/msp/services'
import { MspUrlsInfo }                                                             from '@acx-ui/msp/utils'
import { administrationApi }                                                       from '@acx-ui/rc/services'
import { AdministrationUrlsInfo }                                                  from '@acx-ui/rc/utils'
import { Provider, store }                                                         from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within  } from '@acx-ui/test-utils'

import { mockedEtitlementsList, mockedSummary } from '../__tests__/fixtures'

import MySubscriptions from '.'

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

describe('MySubscriptions', () => {
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
      // rest.get(
      //   AdministrationUrlsInfo.getEntitlementsList.newApi
      //     ? AdministrationUrlsInfo.getEntitlementsList.url
      //     : AdministrationUrlsInfo.getEntitlementsList.oldUrl as string,
      //   (_req, res, ctx) => res(ctx.json(mockedEtitlementsList))
      // ),
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
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <MySubscriptions />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByRole('columnheader', { name: 'Device Count' })
    expect(await screen.findByRole('row', { name: /CLD-MS76-1001/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /CLD-S08M-3001 .* Active/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /Assigned .* Active/i })).toBeVisible()
  })

  it('should refresh successfully', async () => {
    const mockedShowToast = jest.fn()
    jest.mocked(showToast).mockImplementation(mockedShowToast)

    render(
      <Provider>
        <MySubscriptions />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByRole('row', { name: /CLD-MS76-1001/i })).toBeVisible()

    const licenseManagementButton =
    await screen.findByRole('button', { name: 'Manage Subsciptions' })
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
        <MySubscriptions />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByRole('columnheader', { name: 'Device Count' })
    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    await userEvent.click(refreshButton)
    // FIXME: might need to fix when general error handler behavior changed.
    await waitFor(() => expect(spyConsole).toBeCalled())
  })

  it('should display empty string when subscription type is not mapped', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <MySubscriptions />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByRole('columnheader', { name: 'Part Number' })
    const data = await screen.findAllByRole('row')
    // because it is default sorted by "timeleft" in descending order
    const cells = await within(data[data.length - 2] as HTMLTableRowElement).findAllByRole('cell')
    expect((cells[0] as HTMLTableCellElement).textContent).toBe('')
  })

})
