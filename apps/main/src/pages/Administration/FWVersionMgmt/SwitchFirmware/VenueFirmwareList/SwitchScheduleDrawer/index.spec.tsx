import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { firmwareApi }     from '@acx-ui/rc/services'
import {
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

import { VenueFirmwareList }          from '..'
import {
  switchVenue,
  preference,
  switchRelease,
  switchLatest,
  upgradeSwitchViewList_KittoVenue1
} from '../__test__/fixtures'

import { SwitchScheduleDrawer } from '.'

const { mockSwitchCurrentVersions } = SwitchFirmwareFixtures

jest.mock('./SwitchUpgradeWizard', () => ({
  ...jest.requireActual('./SwitchUpgradeWizard'),
  SwitchUpgradeWizard: () => {
    return <div data-testid='test-SwitchUpgradeWizard' />
  }
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetSwitchDefaultVersionsQuery: () => ({
    data: mockSwitchCurrentVersions
  }),
  useGetSwitchCurrentVersionsQuery: () => ({
    data: mockSwitchCurrentVersions
  })
}))

describe('SwitchFirmware - SwitchScheduleDrawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    store.dispatch(firmwareApi.util.resetApiState())
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
      rest.get(
        FirmwareUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatest))
      ),
      rest.post(
        FirmwareUrlsInfo.getSwitchFirmwareList.url,
        (req, res, ctx) => res(ctx.json(upgradeSwitchViewList_KittoVenue1))
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
