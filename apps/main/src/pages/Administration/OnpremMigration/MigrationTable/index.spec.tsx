import { rest } from 'msw'

import {
  AdministrationUrlsInfo
} from '@acx-ui/rc/utils'
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
  migrations
} from '../__tests__/fixtures'

import MigrationTable from '.'


describe('Migration Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getDelegations.url,
        (req, res, ctx) => res(ctx.json(migrations))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <MigrationTable />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/onpremMigration' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Bak Filename')
    expect(asFragment().querySelector('div[class="ant-space-item"]')).not.toBeNull()
  })

})
