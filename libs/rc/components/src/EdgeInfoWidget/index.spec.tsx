import { rest } from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }    from '@acx-ui/store'
import { render,
  screen,
  fireEvent,
  mockServer
} from '@acx-ui/test-utils'

import { tenantID, currentEdge, edgePortsSetting, edgeDnsServers } from './__tests__/fixtures'

import { EdgeInfoWidget } from '.'

jest.mock('./EdgeAlarmWidget', () => ({
  EdgeAlarmWidget: () => <div data-testid='rc-EdgeAlarmWidget' />
}))
jest.mock('./EdgePortsWidget', () => ({
  EdgePortsWidget: () => <div data-testid='rc-EdgePortsWidget' />
}))
jest.mock('./EdgeSysResourceBox', () => ({
  EdgeSysResourceBox: () => <div data-testid='rc-EdgeSysResourceBox' />
}))
jest.mock('./EdgeDetailsDrawer', () => ({
  default: () => <div data-testid='rc-EdgeDetailsDrawer'/>,
  __esModule: true
}))
describe('Edge Information Widget', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: tenantID, serialNumber: currentEdge.serialNumber }

  beforeEach(() => {
    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getDnsServers.url,
        (_req, res, ctx) => res(ctx.json(edgeDnsServers))
      )
    )
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <EdgeInfoWidget
          currentEdge={currentEdge}
          edgePortsSetting={edgePortsSetting}
          isEdgeStatusLoading={false}
          isPortListLoading={false} />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/overview' }
      })

    expect(await screen.findByTestId('rc-EdgeAlarmWidget')).toBeVisible()
    expect(await screen.findByTestId('rc-EdgePortsWidget')).toBeVisible()
    const resourceBoxs = await screen.findAllByTestId('rc-EdgeSysResourceBox')
    expect(resourceBoxs.length).toBe(3)
  })

  it('should display more details', async () => {
    render(
      <Provider>
        <EdgeInfoWidget
          currentEdge={currentEdge}
          edgePortsSetting={edgePortsSetting}
          isEdgeStatusLoading={true}
          isPortListLoading={true} />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/overview' }
      })

    fireEvent.click(await screen.findByRole('button', { name: 'More Details' }))
    expect(await screen.findByTestId('rc-EdgeDetailsDrawer')).toBeVisible()
  })
})