import { rest } from 'msw'

import { EdgeGeneralFixtures, EdgeSdLanFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                             from '@acx-ui/store'
import { mockServer, render, screen }                           from '@acx-ui/test-utils'

import { SmartEdgesTable } from './SmartEdgesTable'

jest.mock('./EdgeInfoDrawer', () => ({
  ...jest.requireActual('./EdgeInfoDrawer'),
  EdgeInfoDrawer: () => <div data-testid='EdgeInfoDrawer' />
}))

const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures
const mockedSdLanData = mockedMvSdLanDataList[0]

describe('Edge SD-LAN Detail - SmartEdgesTable', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_, res, ctx) => res(ctx.json(mockEdgeClusterList))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <SmartEdgesTable sdLanData={mockedSdLanData} />
      </Provider>
    )
    expect(await screen.findByRole('row', { name: 'SE_Cluster 0 12 9 37' })).toBeVisible()
    expect(await screen.findByRole('row', { name: 'SE_Cluster 3 10 20' })).toBeVisible()
  })
})