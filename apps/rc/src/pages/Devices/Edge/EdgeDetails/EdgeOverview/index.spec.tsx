/* eslint-disable max-len */
import { rest } from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }    from '@acx-ui/store'
import {
  render,
  screen,
  mockServer
} from '@acx-ui/test-utils'

import { mockEdgeData as currentEdge } from '../../__tests__/fixtures'

import { EdgeOverview } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  EdgeInfoWidget: () => <div data-testid={'rc-EdgeInfoWidget'} title='EdgeInfoWidget' />,
  EdgeTrafficByVolumeWidget: () => <div data-testid={'analytics-EdgeTrafficByVolumeWidget'} title='EdgeTrafficByVolumeWidget' />,
  EdgePortsByTrafficWidget: () => <div data-testid={'analytics-EdgePortsByTrafficWidget'} title='EdgePortsByTrafficWidget' />
}))

describe('Edge Detail Overview Tab', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json({ data: [currentEdge] }))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <EdgeOverview />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(3)
    expect(await screen.findAllByTestId(/^rc/)).toHaveLength(1) })

})