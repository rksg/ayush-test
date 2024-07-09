import { rest } from 'msw'

import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import {
  FirmwareRbacUrlsInfo,
  FirmwareUrlsInfo,
  SwitchFirmwareFixtures
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
  switchRelease
} from '../../__tests__/fixtures'
import {
  switchLatestV1002,
  switchVenueV1002
} from '../__tests__/fixtures'

import VersionBanner from '.'

const { mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures

describe('Switch Firmware Banner', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchDefaultFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersionsV1002))
      ),
      rest.post(
        FirmwareRbacUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(switchVenueV1002))
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
    await screen.findByText('10.0.10b')
  })
})
