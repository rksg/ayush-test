import { rest } from 'msw'

import { useIsSplitOn }               from '@acx-ui/feature-toggle'
import { EdgeDhcpUrls }               from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockedEdgeDhcpData, mockEdgeDhcpHostStats } from './__tests__/fixtures'

import { EdgeDhcpLeaseTable } from '.'

describe('EdgeDhcpLeaseTable', () => {

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpHostStats.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpHostStats))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcpByEdgeId.url,
        (req, res, ctx) => res(ctx.json(mockedEdgeDhcpData))
      )
    )
  })

  it('Should render EdgeDhcpPoolTable with edgeId props successfully', async () => {
    render(
      <Provider>
        <EdgeDhcpLeaseTable edgeId='testId' />
      </Provider>)
    const row = await screen.findAllByRole('row', { name: /TestHost/i })
    expect(row.length).toBe(2)
  })

  it('Should render expired time correctly', async () => {
    render(
      <Provider>
        <EdgeDhcpLeaseTable edgeId='testId' isInfinite />
      </Provider>)
    const infiniteText = await screen.findAllByText('Infinite')
    expect(infiniteText.length).toBe(2)
  })
})