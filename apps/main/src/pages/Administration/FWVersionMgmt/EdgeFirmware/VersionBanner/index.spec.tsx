import { rest } from 'msw'

import { FirmwareUrlsInfo }           from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { latestReleaseVersions } from '../__tests__/fixtures'

import { VersionBanner } from '.'


describe('Edge firmware version banner', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getAvailableEdgeFirmwareVersions.url,
        (req, res, ctx) => res(ctx.json(latestReleaseVersions))
      )
    )
  })

  it('should render successfully', async () => {
    render(
      <Provider>
        <VersionBanner />
      </Provider>
    )

    expect(await screen.findByText('1.0.0.1710')).toBeVisible()
    expect(screen.getByText('Release')).toBeVisible()
    expect(screen.getByText('(Recommended)')).toBeVisible()
    expect(screen.getByText('02/23/2023')).toBeVisible()
  })

})