import { rest } from 'msw'

import {
  FirmwareCategory,
  FirmwareUrlsInfo
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
  switchVenue,
  switchRelease
} from '../../__tests__/fixtures'

import VersionBanner from '.'

const lastestFirmware = [
  {
    id: '09010e_b397', name: '09010e_b397',
    category: FirmwareCategory.RECOMMENDED, createdDate: '2023-02-07T16:31:10.245+00:00'
  },
  {
    id: '10010_b176', name: '10010_b176',
    category: FirmwareCategory.RECOMMENDED, createdDate: '2023-02-07T16:31:10.245+00:00'
  }]

describe('Switch Firmware Banner', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(lastestFirmware))
      ),
      rest.post(
        FirmwareUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(switchVenue))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchAvailableFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchRelease))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render banner', async () => {
    render(
      <Provider>
        <VersionBanner />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })
    await screen.findByText('9.0.10e_b397')
  })
})
