import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { firmwareApi }                                           from '@acx-ui/rc/services'
import {
  FirmwareRbacUrlsInfo,
  FirmwareUrlsInfo, SwitchFirmwareFixtures, SwitchRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { VenueFirmwareList } from '..'
import {
  switchLatestV1002
} from '../../__tests__/fixtures'
import {
  preference,
  switchReleaseV1002,
  switchUpgradeStatusDetails_KittoVenue1
} from '../__test__/fixtures'

const retryRequestSpy = jest.fn()

jest.mock('./SwitchUpgradeWizard', () => ({
  ...jest.requireActual('./SwitchUpgradeWizard'),
  SwitchUpgradeWizard: () => {
    return <div data-testid='test-SwitchUpgradeWizard' />
  }
}))

const { mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures

describe('SwitchFirmware - VenueStatusDrawer', () => {
  let params: { tenantId: string }
  const checkSwitchVenue = [
    {
      venueId: '72a44bc9039f4a20a4733e208dfb8b5a',
      venueName: 'My-Venue-cli-profile-skip',
      versions: [
        {
          modelGroup: 'ICX7X',
          version: '09010h_cd2_b4'
        },
        {
          modelGroup: 'ICX82',
          version: '10010a_cd3_b11'
        },
        {
          modelGroup: 'ICX71',
          version: '09010h_cd2_b4'
        }
      ],
      lastScheduleUpdateTime: '2024-05-23T03:55:15.151+00:00',
      preDownload: true,
      switchCounts: [
        {
          modelGroup: 'ICX71',
          count: 1
        }
      ],
      status: 'SUCCESS',
      scheduleCount: 0
    }
  ]

  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(firmwareApi.util.resetApiState())
    mockServer.use(
      rest.post(
        FirmwareRbacUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(checkSwitchVenue))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchAvailableFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchReleaseV1002))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json(preference))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchFirmwarePredownload.url,
        (req, res, ctx) => res(ctx.json({
          preDownload: false
        }))
      ),
      rest.post(
        FirmwareUrlsInfo.updateSwitchVenueSchedules.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'requestId' }))
      ),
      rest.post(
        SwitchRbacUrlsInfo.retryFirmwareUpdate.url,
        (req, res, ctx) => {
          retryRequestSpy()
          return res(ctx.json({ requestId: 'requestId' }))}
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersionsV1002))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchDefaultFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchFirmwareStatusList.url,
        (req, res, ctx) => res(ctx.json(switchUpgradeStatusDetails_KittoVenue1))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render drawer', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })
    const row = await screen.findByRole('row', { name: /My-Venue-cli-profile-skip/i })
    const checkStatusButton = await within(row).findByText(/Check Status/i)
    await userEvent.click(checkStatusButton)
    expect(await screen.findByText('DEV-EZD3317P008')).toBeInTheDocument()
    expect(screen.getByText('Firmware update status')).toBeInTheDocument()
  })


  it('status fail - do retry', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue-cli-profile-skip/i })
    const checkStatusButton = await within(row).findByText(/Check Status/i)
    await userEvent.click(checkStatusButton)
    expect(await screen.findByText('DEV-EZD3317P008')).toBeInTheDocument()
    expect(screen.getByText('Firmware update status')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Retry/i }))
    expect(retryRequestSpy).toBeCalledTimes(1)
  })
})
