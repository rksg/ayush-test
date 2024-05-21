import { rest } from 'msw'

import { useIsSplitOn }                                                      from '@acx-ui/feature-toggle'
import { EdgeDHCPFixtures, EdgeDhcpUrls, EdgeGeneralFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                          from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved }             from '@acx-ui/test-utils'

import { mockEdgeDhcpHostStats } from './__tests__/fixtures'

import { EdgeDhcpLeaseTable } from '.'

const { mockDhcpStatsData, mockEdgeDhcpDataList } = EdgeDHCPFixtures
const { mockEdgeList } = EdgeGeneralFixtures

describe('EdgeDhcpLeaseTable', () => {

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpHostStats.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpHostStats))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList.content[0]))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpStatsData))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      )
    )
  })

  it('Should render EdgeDhcpPoolTable with edgeId props successfully', async () => {
    render(
      <Provider>
        <EdgeDhcpLeaseTable edgeId='testId' />
      </Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findAllByRole('row', { name: /TestHost/i })
    expect(row.length).toBe(2)
  })

  it('Should render expired time correctly', async () => {
    render(
      <Provider>
        <EdgeDhcpLeaseTable edgeId='testId' isInfinite />
      </Provider>)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const infiniteText = await screen.findAllByText('Infinite')
    expect(infiniteText.length).toBe(2)
  })
})
