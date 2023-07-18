import { ReactElement } from 'react'

import { rest } from 'msw'

import { useGetDhcpPoolStatsQuery }                        from '@acx-ui/rc/services'
import { DhcpPoolStats, EdgeDhcpUrls, useTableQuery }      from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor } from '@acx-ui/test-utils'
import { RequestPayload }                                  from '@acx-ui/types'

import { mockDhcpPoolStatsData } from './__tests__/fixtures'

import { EdgeDhcpPoolTable } from '.'

const wrapper = ({ children }: { children: ReactElement }) => (
  <Provider>{children}</Provider>
)

describe('EdgeDhcpPoolTable', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpPoolStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpPoolStatsData))
      )
    )
  })

  it('Should render EdgeDhcpPoolTable with table query props successfully', async () => {
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
        <EdgeDhcpPoolTable tableQuery={result.current} />
      </Provider>)
    const row = await screen.findAllByRole('row', { name: /TestPool/i })
    expect(row.length).toBe(3)
  })

  it('Should render EdgeDhcpPoolTable with edgeId props successfully', async () => {
    render(
      <Provider>
        <EdgeDhcpPoolTable edgeId='testId' />
      </Provider>)
    const row = await screen.findAllByRole('row', { name: /TestPool/i })
    expect(row.length).toBe(3)
  })
})