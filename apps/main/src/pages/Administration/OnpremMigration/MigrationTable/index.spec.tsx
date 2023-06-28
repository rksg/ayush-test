import { rest } from 'msw'

import {
  MigrationUrlsInfo
} from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'


import {
  migrations,
  configurations
} from '../__tests__/fixtures'

import MigrationTable from '.'


describe('Migration Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        MigrationUrlsInfo.getZdMigrationList.url,
        (req, res, ctx) => res(ctx.json(migrations))
      ),
      rest.post(
        MigrationUrlsInfo.getZdConfigurationList.url,
        (req, res, ctx) => res(ctx.json(configurations))
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
    await screen.findByText('Backup File')
    expect(asFragment().querySelector('div[class="ant-space-item"]')).not.toBeNull()

    const items = await screen.findAllByText('Qualified')
    fireEvent.click(items[0])
    await screen.findByText('Migration Details')
  })

})
