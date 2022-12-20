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

jest.mock('./EdgeUpTimeWidget', () => ({
  EdgeUpTimeWidget: () => <div data-testid={'EdgeUpTimeWidget'} title='EdgeUpTimeWidget' />
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
            ctx.delay(500),
            ctx.json({ data: [currentEdge] })
          )
        }
      )
    )
  })

  it('should render no data correctly', async () => {
    render(
      <Provider>
        <EdgeOverview />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('No data')
  })

})