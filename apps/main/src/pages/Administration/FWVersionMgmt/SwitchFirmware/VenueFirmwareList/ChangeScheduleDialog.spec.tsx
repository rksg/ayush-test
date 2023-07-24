import { rest } from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  FirmwareUrlsInfo
} from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  within,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'


import {
  switchVenue,
  preference,
  switchRelease,
  switchCurrentVersions
} from '../../__tests__/fixtures'

import { VenueFirmwareList } from '.'

describe('Firmware Venues Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
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
        (req, res, ctx) => res(ctx.json(switchCurrentVersions))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchAvailableFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchRelease))
      ),
      rest.get(
        FirmwareUrlsInfo.getUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json(preference))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('My-Venue')
    expect(asFragment().querySelector('div[class="ant-space-item"]')).not.toBeNull()
  })

  it('should change schedule selected row', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /My-Venue/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    const changeButton = screen.getByRole('button', { name: /Change Update Schedule/i })
    fireEvent.click(changeButton)

    await screen.findByText('Selected time will apply to each venue according to own time-zone')
    const changeVenueButton = await screen.findByText('Save')
    fireEvent.click(changeVenueButton)
  })

  // eslint-disable-next-line max-len
  it('should not render the next schedule version of the selected row in dialog when feature flag is off', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row2 = await screen.findByRole('row', { name: /v2/i })
    fireEvent.click(within(row2).getByRole('checkbox'))

    const changeButton = screen.getByRole('button', { name: /Change Update Schedule/i })
    fireEvent.click(changeButton)

    const article = screen.getByRole('article')
    expect(article.innerHTML).toBe('Choose which version to update the venue to:')

    const notCheckedOptions = await screen.findAllByRole('radio', { hidden: false, checked: false })
    expect(notCheckedOptions).toHaveLength(3)

    await screen.findByText('Selected time will apply to each venue according to own time-zone')
    expect(screen.getByRole('button', { name: /Save/i })).toBeDisabled()
  })

  // eslint-disable-next-line max-len
  it('should render the next schedule version of the selected row in dialog when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row2 = await screen.findByRole('row', { name: /v2/i })
    fireEvent.click(within(row2).getByRole('checkbox'))

    const changeButton = screen.getByRole('button', { name: /Change Update Schedule/i })
    fireEvent.click(changeButton)

    const notCheckedOptions = await screen.findAllByRole('radio', { hidden: false, checked: false })
    expect(notCheckedOptions).toHaveLength(5)

    const checkedOptions = await screen.findAllByRole('radio', { hidden: false, checked: true })
    expect(checkedOptions).toHaveLength(2)
    // eslint-disable-next-line max-len
    expect(screen.getByRole('radio', { name: '9.0.10f_b401 (Release - Recommended)' })).toBeChecked()

    await screen.findByText('Selected time will apply to each venue according to own time-zone')
    expect(screen.getByRole('button', { name: /Save/i })).toBeDisabled()
  })

  // eslint-disable-next-line max-len
  it('should render switch counts of the selected rows in dialog when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /My-Venue/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    const row2 = await screen.findByRole('row', { name: /v2/i })
    fireEvent.click(within(row2).getByRole('checkbox'))

    const changeButton = screen.getByRole('button', { name: /Change Update Schedule/i })
    fireEvent.click(changeButton)

    const article = await screen.findAllByRole('article')
    expect(article).toHaveLength(2)
    expect(article[0].innerHTML).toBe('Firmware available for ICX-8200 Series (4 switches)')
    // eslint-disable-next-line max-len
    expect(article[1]?.innerHTML).toBe('Firmware available for ICX 7150/7550/7650/7850 Series Models (3 switches)')
  })
})
