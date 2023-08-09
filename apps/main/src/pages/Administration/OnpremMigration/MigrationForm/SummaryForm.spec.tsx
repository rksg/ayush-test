import {
  rest
}  from 'msw'

import {
  MigrationUrlsInfo
} from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render
} from '@acx-ui/test-utils'

import {
  migrationResult,
  configurationResult
} from '../__tests__/fixtures'

import SummaryForm from './SummaryForm'

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

describe('Summary Form', () => {
  let params: { tenantId: string, id: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        MigrationUrlsInfo.getMigrationResult.url,
        (req, res, ctx) => res(ctx.json(migrationResult))
      ), rest.get(
        MigrationUrlsInfo.getZdConfiguration.url,
        (_, res, ctx) => res(
          ctx.json(configurationResult)
        )
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: 'd819bd5c-c6f6-491d-9650-e0c96b2cf35c'
    }
  })

  it('should render table', async () => {
    render(
      <SummaryForm taskId='7746d00b-e515-4cf1-b5c6-f09b3047c1a1' />, {
        wrapper: wrapper,
        route: { params, path: '/:tenantId/administration/onpremMigration/add' }
      })

    // eslint-disable-next-line max-len
    // await screen.findByText('ZoneDirector configurations is being validated and may take a few minutes to complete.')
  })

})
