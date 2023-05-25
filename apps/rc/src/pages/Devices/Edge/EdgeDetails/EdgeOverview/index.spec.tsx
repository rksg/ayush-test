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
            ctx.json({ data: [currentEdge] })
          )
        }
      )
    )
  })

  it('should render loading image and it should display No data after image disappear', async () => {
    render(
      <Provider>
        <EdgeOverview />
      </Provider>, {
        route: { params }
      })

    screen.getAllByRole('img', { name: 'loader' })
    await screen.findByText('No data')
  })
})