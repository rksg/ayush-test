import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import { defaultNetworkPath }                        from '@acx-ui/analytics/utils'
import { Provider, dataApiURL, store, dataApi }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitFor } from '@acx-ui/test-utils'
import { PathFilter, DateRange, NetworkPath }        from '@acx-ui/utils'

import { networkSummaryInfo } from './__tests__/fixtures'

import { ReportTile } from '.'

const pathFilters: PathFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  path: defaultNetworkPath
}

describe('ReportTile', () => {
  beforeEach(()=> {
    store.dispatch(dataApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'NetworkInfo', { data: { network: { node: networkSummaryInfo } } })
  })
  it('should render correctly', async () => {
    render(<ReportTile pathFilters={pathFilters} />, {
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
    render(<ReportTile pathFilters={pathFilters} />, {
      wrapper: Provider,
      route: { params: { tenantId: 'tenant-id' } }
    })
    const tiles = await screen.findAllByTestId('Tile')
    await userEvent.click(tiles[0])
    expect(spy.mock.calls.some(args => args[1] === 5000)).toBe(true)
  })
  it('reset to first tile when path changed', async () => {
    const { rerender } = render(<ReportTile pathFilters={pathFilters} />, {
      wrapper: Provider,
      route: { params: { tenantId: 'tenant-id' } }
    })

    const tiles = await screen.findAllByTestId('Tile')

    await userEvent.click(tiles[4])
    expect(tiles[4]).toBeChecked()

    const node = {
      ..._.pick(networkSummaryInfo, ['apCount', 'clientCount']),
      type: 'apMac',
      name: '00:00:00:00:00:01'
    }
    mockGraphqlQuery(dataApiURL, 'NetworkInfo', { data: { network: { node } } })

    const changedPathFilter = {
      ...pathFilters,
      path: [
        { type: 'network', name: 'Network' },
        { type: 'system', name: 'S1' },
        { type: 'zone', name: 'Z1' },
        { type: 'apGroup', name: 'NetworAG1' },
        { type: 'AP', name: '00:00:00:00:00:01' }
      ] as NetworkPath
    }
    rerender(<ReportTile pathFilters={changedPathFilter} />)

    const newTiles = await waitFor(async () => {
      const newTiles = await screen.findAllByTestId('Tile')
      expect(newTiles).toHaveLength(2)
      return newTiles
    })
    expect(newTiles[0]).toBeChecked()
  })
})
