import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
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
  within,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'


import {
  switchVenue,
  preference,
  switchRelease,
  switchLatest
} from '../../__tests__/fixtures'

import { VenueFirmwareListLegacy } from '.'

const { mockSwitchCurrentVersions } = SwitchFirmwareFixtures

describe('Firmware Venues Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    store.dispatch(firmwareApi.util.resetApiState())
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getSwitchFirmwarePredownload.url,
        (req, res, ctx) => res(ctx.json({
          preDownload: false
        }))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json({
          days: [
            'Sunday',
            'Saturday'
          ],
          times: [
            '00:00-02:00',
            '02:00-04:00',
            '04:00-06:00'
          ],
          autoSchedule: true,
          betaProgram: false
        }))
      ),
      rest.post(
        FirmwareUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(switchVenue))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersions))
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
        FirmwareUrlsInfo.getSwitchDefaultFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatest))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <VenueFirmwareListLegacy />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[class="ant-space-item"]')).not.toBeNull()
  })

  it('should change schedule selected row', async () => {
    render(
      <Provider>
        <VenueFirmwareListLegacy />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(row).getByRole('checkbox'))

    const changeButton = screen.getByRole('button', { name: /Change Update Schedule/i })
    await userEvent.click(changeButton)

    await screen.findByText('Selected time will apply to each venue according to own time-zone')
    const changeVenueButton = await screen.findByText('Save')
    await userEvent.click(changeVenueButton)
  })

  // eslint-disable-next-line max-len
  it('should not render the next schedule version of the selected row in dialog when feature flag is off', async () => {
    render(
      <Provider>
        <VenueFirmwareListLegacy />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row2 = await screen.findByRole('row', { name: /v2/i })
    await userEvent.click(within(row2).getByRole('checkbox'))

    const changeButton = screen.getByRole('button', { name: /Change Update Schedule/i })
    await userEvent.click(changeButton)

    expect(screen.getByRole('heading', {
      name: /Choose which version to update the venue to:/i
    })).toBeVisible()

    const notCheckedOptions = await screen.findAllByRole('radio', { hidden: false, checked: false })
    expect(notCheckedOptions).toHaveLength(7)

    await screen.findByText('Selected time will apply to each venue according to own time-zone')
    expect(screen.getByRole('button', { name: /Save/i })).toBeDisabled()
  })

  // eslint-disable-next-line max-len
  it('should render the next schedule version of the selected row in dialog when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)

    render(
      <Provider>
        <VenueFirmwareListLegacy />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row2 = await screen.findByRole('row', { name: /v2/i })
    await userEvent.click(within(row2).getByRole('checkbox'))

    const changeButton = screen.getByRole('button', { name: /Change Update Schedule/i })
    await userEvent.click(changeButton)

    const notCheckedOptions = await screen.findAllByRole('radio', { hidden: false, checked: false })
    // eslint-disable-next-line max-len
    const versionNotCheckedOptions = notCheckedOptions.filter(o => !(o as HTMLInputElement).value.includes('-'))
    expect(versionNotCheckedOptions).toHaveLength(7)

    const checkedOptions = await screen.findAllByRole('radio', { hidden: false, checked: true })
    // eslint-disable-next-line max-len
    const versionCheckedOptions = checkedOptions.filter(o => !(o as HTMLInputElement).value.includes('-'))
    expect(versionCheckedOptions).toHaveLength(2)
    // eslint-disable-next-line max-len
    expect(screen.getByRole('radio', { name: '9.0.10f_b401 (Release - Recommended)' })).toBeChecked()

    await screen.findByText('Selected time will apply to each venue according to own time-zone')
    expect(screen.getByRole('button', { name: /Save/i })).toBeDisabled()
  })

  // eslint-disable-next-line max-len
  it('should render switch counts of the selected rows in dialog when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.SWITCH_RBAC_API)

    render(
      <Provider>
        <VenueFirmwareListLegacy />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /My-Venue/i })).toBeVisible()
    await userEvent.click(within(rows[1]).getByRole('checkbox')) ///My-Venue
    expect(within(rows[2]).getByRole('cell', { name: /v2/i })).toBeVisible()
    await userEvent.click(within(rows[2]).getByRole('checkbox')) //v2

    const changeButton = screen.getByRole('button', { name: /Change Update Schedule/i })
    await userEvent.click(changeButton)

    expect(screen.getByRole('heading', {
      name: /firmware available for icx 7150\/7550\/7650\/7850 series \(3 switches\)/i
    })).toBeVisible()
    expect(screen.getByRole('heading', {
      name: /firmware available for icx 8200 series \(4 switches\)/i
    })).toBeVisible()
  })
})
