import { rest } from 'msw'

import {
  MigrationUrlsInfo
} from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'


import {
  migrations,
  migrationResult,
  configurationResult
} from '../__tests__/fixtures'

import MigrationSummary from './summary'


describe('Migration Summary', () => {
  let params: { tenantId: string, taskId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        MigrationUrlsInfo.getZdMigrationList.url,
        (req, res, ctx) => res(ctx.json(migrations))
      ), rest.get(
        MigrationUrlsInfo.getMigrationResult.url,
        (_, res, ctx) => res(
          ctx.json(migrationResult)
        )
      ), rest.get(
        MigrationUrlsInfo.getZdConfiguration.url,
        (_, res, ctx) => res(
          ctx.json(configurationResult)
        )
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      taskId: '8f068090-8cd8-49a2-a8ac-e6455342deb6'
    }
  })

  it('should render summary', async () => {
    render(
      <Provider>
        <MigrationSummary />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/onpremMigration/:taskId/summary' }
      })

    await screen.findByText('ZD Migration Summary')
  })

})
