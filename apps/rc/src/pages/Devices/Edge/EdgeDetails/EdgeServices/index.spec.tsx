/* eslint-disable max-len */
import { rest } from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }    from '@acx-ui/store'
import {
  render,
  screen,
  mockServer
} from '@acx-ui/test-utils'

import { mockEdgeData as currentEdge, mockedEdgeServiceList } from '../../__tests__/fixtures'

import { EdgeServices } from '.'


describe('Edge Detail Services Tab', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeServiceList.url,
        (req, res, ctx) => res(ctx.json(mockedEdgeServiceList))
      )
    )
  })

  it('should render services tab correctly', async () => {
    render(
      <Provider>
        <EdgeServices />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByRole('row', { name: /DHCP-1/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /NSG-1/i })).toBeVisible()
  })
})