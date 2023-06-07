/* eslint-disable max-len */
import { rest } from 'msw'

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
describe('Edge Detail Overview Tab', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber }

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
})