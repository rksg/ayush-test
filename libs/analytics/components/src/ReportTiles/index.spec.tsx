import userEvent from '@testing-library/user-event'

import { Provider, dataApiURL, store, dataApi } from '@acx-ui/store'
import { mockGraphqlQuery, render, screen }     from '@acx-ui/test-utils'

import { networkSummaryInfo } from './__tests__/fixtures'

import { ReportTile } from '.'

describe('ReportTile', () => {
  beforeEach(()=> {
    store.dispatch(dataApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'NetworkInfo', { data: { network: { node: networkSummaryInfo } } })
  })
  it('should render correctly', async () => {
    render(<ReportTile/>, {
      wrapper: Provider,
      route: { params: { tenantId: 'tenant-id' } }
    })
    expect(await screen.findAllByTestId('Tile')).toHaveLength(5)
    expect(await screen.findByText('AP Count')).toBeVisible()
    expect(await screen.findByText('9.52K')).toBeVisible()
    expect(await screen.findByText('Unique Clients')).toBeVisible()
    expect(await screen.findByText('813')).toBeVisible()
    expect(await screen.findByText('Traffic')).toBeVisible()
    expect(await screen.findByText('2.74 TB')).toBeVisible()
    expect(await screen.findByText('Applications')).toBeVisible()
    expect(await screen.findByText('1.52K')).toBeVisible()
    expect(await screen.findByText('Active WLANs')).toBeVisible()
    expect(await screen.findByText('--')).toBeVisible()
  })
  it('should handle Tile onClick', async () => {
    const spy = jest.spyOn(global, 'setInterval')
    render(<ReportTile/>, {
      wrapper: Provider,
      route: { params: { tenantId: 'tenant-id' } }
    })
    const tiles = await screen.findAllByTestId('Tile')
    await userEvent.click(tiles[0])
    expect(spy.mock.calls.some(args => args[1] === 5000)).toBe(true)
  })
})
