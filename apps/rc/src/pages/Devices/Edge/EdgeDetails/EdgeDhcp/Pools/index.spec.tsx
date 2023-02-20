import { ReactElement } from 'react'

import { rest } from 'msw'

import { useGetDhcpPoolStatsQuery }                                   from '@acx-ui/rc/services'
import { DhcpPoolStats, EdgeDhcpUrls, RequestPayload, useTableQuery } from '@acx-ui/rc/utils'
import { Provider }                                                   from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor }            from '@acx-ui/test-utils'

import { mockDhcpPoolStatsData } from '../../../../../Services/DHCP/Edge/__tests__/fixtures'

import Pools from '.'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  })
}))

const wrapper = ({ children }: { children: ReactElement }) => (
  <Provider>{children}</Provider>
)

describe('Edge DHCP - Pools tab', () => {

  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'dhcp',
      activeSubTab: 'pools'
    }

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpPoolStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpPoolStatsData))
      )
    )
  })

  it('Should render Pools tab successfully', async () => {
    const { result } = renderHook(
      () => useTableQuery<DhcpPoolStats, RequestPayload<unknown>, unknown>({
        useQuery: useGetDhcpPoolStatsQuery,
        defaultPayload: {}
      }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())
    render(
      <Provider>
        <Pools tableQuery={result.current} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edge-details/:activeTab/:activeSubTab'
        }
      })
    const row = await screen.findAllByRole('row', { name: /TestPool/i })
    expect(row.length).toBe(3)
  })
})