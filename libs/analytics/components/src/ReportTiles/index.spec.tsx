import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import { Provider, dataApiURL, store, dataApi }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitFor } from '@acx-ui/test-utils'

import { networkSummaryInfo } from './__tests__/fixtures'

import { ReportTile } from '.'

describe('ReportTile', () => {
  beforeEach(()=> {
    store.dispatch(dataApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'NetworkInfo', { data: { network: { node: networkSummaryInfo } } })
  })
  it('should render correctly', async () => {
    render(<ReportTile
      path={[{ type: 'network', name: 'Network' }]}
    />, {
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
    render(<ReportTile
      path={[{ type: 'network', name: 'Network' }]}
    />, {
      wrapper: Provider,
      route: { params: { tenantId: 'tenant-id' } }
    })
    const tiles = await screen.findAllByTestId('Tile')
    await userEvent.click(tiles[0])
    expect(spy.mock.calls.some(args => args[1] === 5000)).toBe(true)
  })
  it('reset to first tile when path changed', async () => {
    const { rerender } = render(<ReportTile
      path={[{ type: 'network', name: 'Network' }]}
    />, {
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

    rerender(<ReportTile path={[
      { type: 'network', name: 'Network' },
      { type: 'system', name: 'S1' },
      { type: 'zone', name: 'Z1' },
      { type: 'apGroup', name: 'NetworAG1' },
      { type: 'AP', name: '00:00:00:00:00:01' }
    ]} />)

    const newTiles = await waitFor(async () => {
      const newTiles = await screen.findAllByTestId('Tile')
      expect(newTiles).toHaveLength(2)
      return newTiles
    })
    expect(newTiles[0]).toBeChecked()
  })
})
