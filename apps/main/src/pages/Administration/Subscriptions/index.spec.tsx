import '@testing-library/jest-dom'
import { rest } from 'msw'

import { AdministrationUrlsInfo }                                  from '@acx-ui/rc/utils'
import { Provider }                                                from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor, within  } from '@acx-ui/test-utils'

import { mockedEtitlementsList, mockedSummary } from './__tests__/fixtures'

import Subscriptions from '.'

jest.spyOn(Date, 'now').mockImplementation(() => {
  return new Date('2023-01-11T12:33:37.101+00:00').getTime()
})
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  StackedBarChart: () => (<div data-testid='rc-StackedBarChart' />)
}))

describe('Subscriptions', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: '3061bd56e37445a8993ac834c01e2710'
    }

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getEntitlementsList.newApi
          ? AdministrationUrlsInfo.getEntitlementsList.url
          : AdministrationUrlsInfo.getEntitlementsList.oldUrl as string,
        (req, res, ctx) => res(ctx.json(mockedEtitlementsList))
      ),
      rest.get(
        AdministrationUrlsInfo.getEntitlementSummary.newApi
          ? AdministrationUrlsInfo.getEntitlementSummary.url
          : AdministrationUrlsInfo.getEntitlementSummary.oldUrl as string,
        (req, res, ctx) => res(
          ctx.json(AdministrationUrlsInfo.getEntitlementSummary.newApi ? {
            banners: [],
            entitlements: mockedEtitlementsList,
            summary: mockedSummary
          } : mockedSummary))
      ),
      rest.post(
        AdministrationUrlsInfo.refreshLicensesData.url,
        (req, res, ctx) => res(ctx.status(202))
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
    expect(await screen.findByText(/2\s+\/\s+130/i)).toBeVisible()
    expect(await screen.findByRole('row', { name: /ICX 7650/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /ICX 7150-C08P .* Active/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /Wi-Fi .* Expired/i })).toBeVisible()
    expect((await screen.findAllByTestId('rc-StackedBarChart')).length).toBe(3)

    const licenseManagementButton =
    await screen.findByRole('button', { name: 'Manage Subsciptions' })
    fireEvent.click(licenseManagementButton)
    const refreshButton = await screen.findByRole('button', { name: 'Refresh' })
    fireEvent.click(refreshButton)
    await waitFor(async () => {
      expect(await screen.findByText('Successfully refreshed.')).toBeVisible()
    })
  })

  it('should display toast message when refresh failed', async () => {
    mockServer.use(
      rest.post(
        AdministrationUrlsInfo.refreshLicensesData.url,
        (req, res, ctx) => res(ctx.status(500))
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
    fireEvent.click(refreshButton)
    await waitFor(async () => {
      expect(await screen.findByText('Failed, please try again later.')).toBeVisible()
    })
  })

  it('should display empty string when subscription type is not mapped', async () => {
    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('columnheader', { name: 'Device Count' })
    const data = await screen.findAllByRole('row')
    const cells = await within(data[data.length - 1] as HTMLTableRowElement).findAllByRole('cell')
    expect((cells[0] as HTMLTableCellElement).innerHTML).toBe('')
  })

  it('should correctly handle device sub type', async () => {
    render(
      <Provider>
        <Subscriptions />
      </Provider>, {
        route: { params }
      })

    await screen.findByRole('columnheader', { name: 'Device Count' })
    const wifiRow = await screen.findByRole('row', { name: /Wi-Fi/i })
    const wifiRowCells = await within(wifiRow as HTMLTableRowElement).findAllByRole('cell')
    expect((wifiRowCells[1] as HTMLTableCellElement).innerHTML).toBe('Trial')

    const edgeRow = await screen.findByRole('row', { name: /SmartEdge/i })
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
    await screen.findByRole('row', { name: /Edge/i })
  })
})