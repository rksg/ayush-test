import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { firmwareApi }                                       from '@acx-ui/rc/services'
import {
  FirmwareUrlsInfo, SwitchFirmwareFixtures, SwitchUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { VenueFirmwareList } from '..'
import {
  switchVenue,
  preference,
  switchRelease,
  switchUpgradeStatusDetails_KittoVenue1,
  switchLatest
} from '../__test__/fixtures'

const { mockSwitchCurrentVersions } = SwitchFirmwareFixtures

const retryRequestSpy = jest.fn()

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

describe('SwitchFirmware - VenueStatusDrawer', () => {
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
      rest.post(
        SwitchUrlsInfo.retryFirmwareUpdate.url,
        (req, res, ctx) => {
          retryRequestSpy()
          return res(ctx.json({ requestId: 'requestId' }))}
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatest))
      ),
      rest.post(
        FirmwareUrlsInfo.getSwitchFirmwareStatusList.url,
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

    expect(await screen.findByText('My-Venue')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Check Status/i }))

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

    expect(await screen.findByText('My-Venue')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: /Check Status/i }))
    expect(await screen.findByText('DEV-EZD3317P008')).toBeInTheDocument()
    expect(screen.getByText('Firmware update status')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Retry/i }))
    expect(retryRequestSpy).toBeCalledTimes(1)
  })
})
