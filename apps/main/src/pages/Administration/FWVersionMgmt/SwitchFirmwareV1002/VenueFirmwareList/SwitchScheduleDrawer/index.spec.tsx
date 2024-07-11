import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import { firmwareApi }     from '@acx-ui/rc/services'
import {
  FirmwareRbacUrlsInfo,
  FirmwareSwitchVenue,
  FirmwareUrlsInfo,
  SwitchFirmwareFixtures
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { VenueFirmwareList }                   from '..'
import { switchLatestV1002, switchVenueV1002 } from '../../__tests__/fixtures'
import {
  switchVenue,
  preference,
  switchReleaseV1002,
  upgradeSwitchViewList
} from '../__test__/fixtures'

import { SwitchScheduleDrawer } from '.'


jest.mock('./SwitchUpgradeWizard', () => ({
  ...jest.requireActual('./SwitchUpgradeWizard'),
  SwitchUpgradeWizard: () => {
    return <div data-testid='test-SwitchUpgradeWizard' />
  }
}))

const { mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures


describe('SwitchFirmware - SwitchScheduleDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(firmwareApi.util.resetApiState())
    mockServer.use(
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
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchDefaultFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      ),
      rest.post(
        FirmwareRbacUrlsInfo.getSwitchFirmwareList.url,
        (req, res, ctx) => res(ctx.json(upgradeSwitchViewList))
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

    expect(await screen.findByText('My-Venue')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: /View Schedule/i }))
    expect(await screen.findByText('Scheduled update')).toBeInTheDocument()
  })

  it('should render SwitchScheduleDrawer', async () => {
    render(
      <Provider>
        <SwitchScheduleDrawer
          visible={true}
          setVisible={() => { }}
          data={switchVenue.upgradeVenueViewList[0] as FirmwareSwitchVenue}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    expect(await screen.findByText('KittoVenue2')).toBeInTheDocument()
  })


})
