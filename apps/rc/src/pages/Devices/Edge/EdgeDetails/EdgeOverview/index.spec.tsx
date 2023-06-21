import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }    from '@acx-ui/store'
import {
  render,
  screen,
  mockServer
} from '@acx-ui/test-utils'

import { mockEdgeData as currentEdge, mockEdgeDnsServersData, mockEdgePortStatus } from '../../__tests__/fixtures'

import { EdgeOverview } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgePortsByTrafficWidget: () => <div data-testid='rc-EdgePortsByTrafficWidget'></div>,
  EdgeResourceUtilizationWidget: () => <div data-testid='rc-EdgeResourceUtilizationWidget'></div>,
  EdgeTrafficByVolumeWidget: () => <div data-testid='rc-EdgeTrafficByVolumeWidget'></div>,
  EdgeUpTimeWidget: () => <div data-testid='rc-EdgeUpTimeWidget'></div>
}))

describe('Edge Detail Overview', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'tenant-id', serialNumber: 'edge-serialnum' }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_req, res, ctx) => {
          return res(
            ctx.json({ data: [currentEdge] })
          )
        }
      ),
      rest.get(
        EdgeUrlsInfo.getDnsServers.url,
        (_req, res, ctx) => {
          return res(
            ctx.json(mockEdgeDnsServersData)
          )
        }
      ),
      rest.post(
        EdgeUrlsInfo.getEdgePortStatusList.url,
        (_req, res, ctx) => {
          return res(
            ctx.json(mockEdgePortStatus)
          )
        }
      )
    )
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <EdgeOverview />
      </Provider>, {
        route: { params }
      })

    screen.getAllByRole('img', { name: 'loader' })
    // Edge alarm widget
    await screen.findByText('No data')
    await screen.findByTestId('rc-EdgePortsByTrafficWidget')
    await screen.findByTestId('rc-EdgeResourceUtilizationWidget')
    await screen.findByTestId('rc-EdgeTrafficByVolumeWidget')
    await screen.findByTestId('rc-EdgeUpTimeWidget')
  })

  it('should correctly change tab', async () => {
    render(
      <Provider>
        <EdgeOverview />
      </Provider>, {
        route: { params }
      })

    screen.getAllByRole('img', { name: 'loader' })
    await screen.findByText('No data')
    const portTab = await screen.findByRole('tab', { name: 'Ports' })
    await userEvent.click(portTab)
    expect(await screen.findByRole('button', { name: 'Configure Port Settings' })).toBeVisible()
    const portsRow = await screen.findAllByRole('row')
    expect(portsRow.length).toBe(2)
  })

  it('should correctly dispaly active tab by router', async () => {
    render(
      <Provider>
        <EdgeOverview />
      </Provider>, {
        route: { params: { ...params, activeSubTab: 'ports' } }
      })

    screen.getAllByRole('img', { name: 'loader' })
    await screen.findByText('No data')
    expect(await screen.findByRole('button', { name: 'Configure Port Settings' })).toBeVisible()
    const monitorTab = await screen.findByRole('tab', { name: 'Monitor' })
    await userEvent.click(monitorTab)
    expect(await screen.findByTestId('rc-EdgePortsByTrafficWidget')).toBeVisible()
  })
})