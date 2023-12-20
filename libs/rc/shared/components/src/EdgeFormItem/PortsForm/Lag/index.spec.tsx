import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeLagFixtures, EdgeUrlsInfo }                                          from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import Lag from '.'

const { mockedEdgeLagList, mockEdgeLagStatusList } = EdgeLagFixtures

describe('EditEdge ports - LAG', () => {
  const mockedEdgeID = 'mocked_edge_id'

  beforeEach(() => {
    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getEdgeLagList.url,
        (req, res, ctx) => res(ctx.json(mockedEdgeLagList))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteEdgeLag.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('Should render LAG tab correctly', async () => {
    render(
      <Provider>
        <Lag
          serialNumber={mockedEdgeID}
          lagStatusList={mockEdgeLagStatusList.data}
          isLoading={false}
          portList={[]}
        />
      </Provider>)
    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(2)
  })

  it('Should open add LAG drawer correctly', async () => {
    render(
      <Provider>
        <Lag
          serialNumber={mockedEdgeID}
          lagStatusList={mockEdgeLagStatusList.data}
          isLoading={false}
          portList={[]}
        />
      </Provider>)

    await userEvent.click(screen.getByRole('button', { name: 'Add LAG' }))
    const drawer = await screen.findByRole('dialog')
    expect(within(drawer).getByText('Add LAG')).toBeVisible()
  })

  it('Should delete LAG correctly', async () => {
    render(
      <Provider>
        <Lag
          serialNumber={mockedEdgeID}
          lagStatusList={mockEdgeLagStatusList.data}
          isLoading={false}
          portList={[]}
        />
      </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /LAG 1/i })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete LAG' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })
})
