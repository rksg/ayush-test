import { rest } from 'msw'

import { EdgeUrlsInfo }               from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { screen, render, mockServer } from '@acx-ui/test-utils'

import { OltDetails } from './index'

describe('OltDetails', ()=>{ //TODO
  const params = {
    tenantId: 'tenant-id',
    oltId: 'olt-id'
  }
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json([]))
      )
    )
  })

  it('should render correctly', () => {
    render(<Provider>
      <OltDetails />
    </Provider>, {
      route: { params }
    })
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })
})
