import { rest } from 'msw'

import { WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  meshApsQuery
} from '../__tests__/fixtures'

import { RbacVenueMeshApsTable } from './RbacVenueMeshApsTable'

describe('RbacVenueMeshApsTable', () => {
  const params: { tenantId: string } = {
    tenantId: 'tenant123'
  }
  beforeEach(() => {
    mockServer.use(
      rest.post(WifiRbacUrlsInfo.getMeshAps.url.split('?')[0],
        (_, res, ctx) => res(ctx.json({ ...meshApsQuery }))
      )
    )
  })

  it('should render mesh radio correct', async () => {
    render(
      <Provider>
        <RbacVenueMeshApsTable />
      </Provider>, {
        route: { params }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByRole('row', { name: /Mesh Radio/ })).toBeVisible()
    expect(await screen.findByText('5 GHz')).toBeVisible()
  })
})
