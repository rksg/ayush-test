import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { firmwareApi }                       from '@acx-ui/rc/services'
import {
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


import {
  switchVenue,
  preference,
  switchRelease,
  switchLatest,
  switchVenueWithEmptyFirmware
} from './__test__/fixtures'

import { VenueFirmwareList } from '.'

const { mockSwitchCurrentVersions } = SwitchFirmwareFixtures

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
  useGetSwitchDefaultVersionsQuery: () => ({
    data: mockSwitchCurrentVersions
  })
}))


describe('SwitchFirmware - VenueFirmwareList', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    store.dispatch(firmwareApi.util.resetApiState())
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersions))
      ),
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

    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(switchVenueWithEmptyFirmware))
      )
    )

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

    const row = await screen.findByRole('row', { name: /My-Venue/i })
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

    const row = await screen.findByRole('row', { name: /My-Venue/i })
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

    const kittoVenue2 = await screen.findByRole('row', { name: /KittoVenue2/i })
    await userEvent.click(within(kittoVenue2).getByRole('checkbox'))
    expect(screen.getByRole('button', { name: 'Update Now' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: 'Update Now' }))
    expect(await screen.findByTestId('test-SwitchUpgradeWizard')).toBeInTheDocument()
  })

  it('clicks status - check status', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })
    const checkStatusButton = await screen.findByRole('button', { name: 'Check Status' })
    await userEvent.click(checkStatusButton)
    expect(await screen.findByTestId('test-VenueStatusDrawer')).toBeInTheDocument()
  })

})
