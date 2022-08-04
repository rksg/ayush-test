import { rest } from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { AlarmsTable } from '.'

const list = {
  totalCount: 10,
  page: 1,
  data: []
}

describe('Venues Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <AlarmsTable />
      </Provider>, {
        route: { params, path: '/:tenantId/dashboard' }
      })
    expect(asFragment()).toMatchSnapshot()

    await screen.findByText('Alarms')
  })
})