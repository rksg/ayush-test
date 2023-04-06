import { rest } from 'msw'

import {
  FirmwareUrlsInfo
} from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render
} from '@acx-ui/test-utils'


import {
  switchVenue,
  preference,
  switchRelease
} from '../../__tests__/fixtures'

import VersionBanner from '.'

// eslint-disable-next-line max-len
const lastestFirmware = [{ id: '09010e_b397',name: '09010e_b397',category: 'RECOMMENDED',createdDate: '2023-02-07T16:31:10.245+00:00' }]

describe('Firmware Venues Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(switchVenue))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchAvailableFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchRelease))
      ),
      rest.get(
        FirmwareUrlsInfo.getUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json(preference))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(lastestFirmware))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    render(
      <Provider>
        <VersionBanner />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })
  })

})
