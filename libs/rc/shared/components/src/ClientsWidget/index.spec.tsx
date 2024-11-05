import { rest }    from 'msw'
import { useIntl } from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { CommonUrlsInfo }         from '@acx-ui/rc/utils'
import { Provider  }              from '@acx-ui/store'
import { render,
  screen,
  mockRestApiQuery,
  waitForElementToBeRemoved,
  renderHook,
  mockServer
} from '@acx-ui/test-utils'

import { ClientsWidgetV2,
  getSwitchClientChartData } from '.'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useDashboardFilter: () => ({
    filters: {
      filter: {
        networkNodes: [
          {
            0: {
              name: 'Venue A',
              id: 'venue_a'
            },
            1: {
              name: 'Subnet 1',
              id: 'subnet_1'
            }
          }
        ]
      }
    }
  })
}))

describe('Clients widget v2', () => {
  jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.DASHBOARD_NEW_API_TOGGLE)
  it('should render loader and then content for no data', async () => {
    mockRestApiQuery(CommonUrlsInfo.getClientSummaries.url, 'post',{})
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const { asFragment } = render(<Provider><ClientsWidgetV2 /></Provider>,
      { route: { params } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Clients')
    await screen.findByText('No Wi-Fi Clients')
    await screen.findByText('No Wired Clients')
    expect(asFragment().querySelectorAll('svg').length).toBe(1)
  })
  it('should render properly with chart', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getClientSummaries.url,
        (req, res, ctx) => res(ctx.json({
          summary: {
            switchClients: {
              summary: {},
              totalCount: 2
            },
            clients: {
              summary: { Good: 2, Poor: 1, Unknown: 1 },
              totalCount: 4
            }
          }
        }))
      )
    )
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
    const { asFragment } = render(<Provider><ClientsWidgetV2 /></Provider>,
      { route: { params } })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Clients')
    await screen.findByText('Wi-Fi')
    await screen.findByText('Wired')
    expect(asFragment().querySelectorAll('svg').length).toBe(3)
  })
})

describe('getSwitchClientChartData', () => {
  const data = {
    summary: {
      switchClients: {
        summary: {
          '02e2ddbc88e1428987666d31edbc3d9a': '2'
        },
        totalCount: 2
      }
    }
  }
  it('should return correct formatted data', async () => {
    const { result } = renderHook(() => getSwitchClientChartData(data, useIntl()))
    expect(result.current).toEqual([{
      color: '#23AB36',
      name: 'Clients',
      value: 2
    }])
  })
  it('should return empty array if no data', () => {
    const { result } = renderHook(() => getSwitchClientChartData(undefined, useIntl()))
    expect(result.current).toEqual([])
  })
})
