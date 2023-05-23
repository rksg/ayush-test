import {
  render,
  screen
} from '@acx-ui/test-utils'

import ValidationStatus from './ValidationStatus'


describe('Migration Status Form', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    // mockServer.use(
    //   rest.get(
    //     AdministrationUrlsInfo.getDelegations.url,
    //     (req, res, ctx) => res(ctx.json(migrations))
    //   )
    // )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    const {} = render(
      <ValidationStatus />, {
        route: { params, path: '/:tenantId/administration/onpremMigration/add' }
      })

    // eslint-disable-next-line max-len
    await screen.findByText('ZoneDirector configurations is being validated and may take a few minutes to complete.')
  })

})
