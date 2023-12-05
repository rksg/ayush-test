import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeLagFixtures, EdgeUrlsInfo }               from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import Lag from '.'

const { mockedEdgeLagList, mockEdgeLagStatusList } = EdgeLagFixtures

describe('EditEdge ports - LAG', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: 'sub-interface'
    }
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
          lagStatusList={mockEdgeLagStatusList.data}
          isLoading={false}
          portList={[]}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(2)
  })

  it('Should open add LAG drawer correctly', async () => {
    render(
      <Provider>
        <Lag
          lagStatusList={mockEdgeLagStatusList.data}
          isLoading={false}
          portList={[]}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await userEvent.click(screen.getByRole('button', { name: 'Add LAG' }))
    const drawer = await screen.findByRole('dialog')
    expect(within(drawer).getByText('Add LAG')).toBeVisible()
  })

  it.skip('Should delete LAG correctly', async () => {
    render(
      <Provider>
        <Lag
          lagStatusList={mockEdgeLagStatusList.data}
          isLoading={false}
          portList={[]}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const row = await screen.findByRole('row', { name: /LAG 1/i })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete LAG' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })
})
