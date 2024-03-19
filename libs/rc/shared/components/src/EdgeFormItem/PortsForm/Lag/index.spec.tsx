import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeGeneralFixtures, EdgeLag, EdgeLagFixtures, EdgePortConfigFixtures, EdgeSdLanFixtures, EdgeSdLanUrls, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                                              from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }                                                                           from '@acx-ui/test-utils'

import { EdgePortsDataContext } from '../PortDataProvider'

import Lag from '.'

const { mockEdgeList } = EdgeGeneralFixtures
const { mockedEdgeLagList, mockEdgeLagStatusList } = EdgeLagFixtures
const { mockEdgePortStatus } = EdgePortConfigFixtures
const { mockedSdLanDataListP2 } = EdgeSdLanFixtures

const defaultPortsContextdata = {
  portData: [],
  lagData: mockedEdgeLagList.content as EdgeLag[],
  portStatus: mockEdgePortStatus,
  isLoading: false,
  isFetching: false
}

describe('EditEdge ports - LAG', () => {
  const mockedEdgeID = 'mocked_edge_id'

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.get(
        EdgeUrlsInfo.getEdgeLagList.url,
        (_, res, ctx) => res(ctx.json(mockedEdgeLagList))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteEdgeLag.url,
        (_, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataListP2 }))
      )
    )
  })

  it('Should render LAG tab correctly', async () => {
    render(
      <Provider>
        <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
          <Lag
            serialNumber={mockedEdgeID}
            lagStatusList={mockEdgeLagStatusList.data}
            isLoading={false}
          />
        </EdgePortsDataContext.Provider>
      </Provider>)
    const rows = await screen.findAllByRole('row', { name: /LAG \d/i })
    expect(rows.length).toBe(2)
  })

  it('Should open add LAG drawer correctly', async () => {
    render(
      <Provider>
        <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
          <Lag
            serialNumber={mockedEdgeID}
            lagStatusList={mockEdgeLagStatusList.data}
            isLoading={false}
          />
        </EdgePortsDataContext.Provider>
      </Provider>)

    await userEvent.click(screen.getByRole('button', { name: 'Add LAG' }))
    const drawer = await screen.findByRole('dialog')
    expect(within(drawer).getByText('Add LAG')).toBeVisible()
  })

  it('Should delete LAG correctly', async () => {
    render(
      <Provider>
        <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
          <Lag
            serialNumber={mockedEdgeID}
            lagStatusList={mockEdgeLagStatusList.data}
            isLoading={false}
          />
        </EdgePortsDataContext.Provider>
      </Provider>)

    const row = await screen.findByRole('row', { name: /LAG 1/i })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete LAG' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })
})
