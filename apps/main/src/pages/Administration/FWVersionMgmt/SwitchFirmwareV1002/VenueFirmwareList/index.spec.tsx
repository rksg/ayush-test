import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { firmwareApi }                       from '@acx-ui/rc/services'
import {
  FirmwareRbacUrlsInfo,
  FirmwareUrlsInfo, SwitchFirmwareFixtures
} from '@acx-ui/rc/utils'
import {
  Provider, store
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { switchLatestV1002, switchVenueV1002 } from '../__tests__/fixtures'

import {
  preference,
  switchReleaseV1002
} from './__test__/fixtures'

import { VenueFirmwareList } from '.'

jest.mock('./SwitchUpgradeWizard', () => ({
  ...jest.requireActual('./SwitchUpgradeWizard'),
  SwitchUpgradeWizard: () => {
    return <div data-testid='test-SwitchUpgradeWizard' />
  }
}))

jest.mock('./VenueStatusDrawer', () => ({
  ...jest.requireActual('./VenueStatusDrawer'),
  VenueStatusDrawer: () => {
    return <div data-testid='test-VenueStatusDrawer' />
  }
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetSwitchCurrentVersionsV1001Query: () => ({
    data: mockSwitchCurrentVersionsV1002
  })
}))
const { mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures


describe('SwitchFirmware - VenueFirmwareList', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(firmwareApi.util.resetApiState())
    mockServer.use(
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchDefaultFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      ),
      rest.post(
        FirmwareRbacUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(switchVenueV1002))
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
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersionsV1002))
      ),
      rest.post(
        FirmwareUrlsInfo.updateSwitchVenueSchedules.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'requestId' }))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    expect(await screen.findByText('My-Venue')).toBeInTheDocument()
  })

  it('should render table with empty firmware', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    expect(await screen.findByText('My-Venue')).toBeInTheDocument()
  })

  it('clicks update now', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue-cli-template/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Update Now' }))
    expect(await screen.findByTestId('test-SwitchUpgradeWizard')).toBeInTheDocument()
  })

  it('clicks change update schedule', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue-cli-template/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /Change Update Schedule/i }))
    expect(await screen.findByTestId('test-SwitchUpgradeWizard')).toBeInTheDocument()
  })

  it('clicks skip', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const kittoVenue2 = await screen.findByRole('row', { name: /My-Venue-cli-profile-skip/i })
    await userEvent.click(within(kittoVenue2).getByRole('checkbox'))
    expect(screen.getByRole('button', { name: 'Skip Update' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Skip Update' }))
    expect(await screen.findByTestId('test-SwitchUpgradeWizard')).toBeInTheDocument()
  })

  it('clicks status - check status', async () => {
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

    mockServer.use(
      rest.post(
        FirmwareRbacUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(checkSwitchVenue))
      )
    )

    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })
    const row = await screen.findByRole('row', { name: /My-Venue-cli-profile-skip/i })
    const checkStatusButton = await within(row).findByText(/Check Status/i)
    await userEvent.click(checkStatusButton)
    expect(await screen.findByTestId('test-VenueStatusDrawer')).toBeInTheDocument()
  })

})
