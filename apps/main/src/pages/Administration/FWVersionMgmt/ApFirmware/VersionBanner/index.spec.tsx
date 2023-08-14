import { rest } from 'msw'

import { FirmwareUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }         from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockedAvailableABFList } from './__tests__/fixtures'

import VersionBanner from '.'
describe('VersionBanner', () => {
  const params: { tenantId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getAvailableFirmwareList.url.replace('?status=release', ''),
        (req, res, ctx) => {
          const searchParams = req.url.searchParams
          if (searchParams.get('status') === 'release' && searchParams.get('abf') === 'all') {
            return res(ctx.json([ ...mockedAvailableABFList ]))
          }

          return res(ctx.json([]))
        }
      )
    )
  })

  it('should render the latest firmware version by onboard date', async () => {
    render(
      <Provider>
        <VersionBanner />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      }
    )

    expect(await screen.findByText('7.0.0.103.325')).toBeVisible()
    expect(await screen.findByText('6.2.2.103.82')).toBeVisible()
    expect(await screen.findByText('6.2.0.103.518')).toBeVisible()
  })
})
