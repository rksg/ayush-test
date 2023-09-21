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
  switchCurrentVersions,
  switchLatest
} from '../../__tests__/fixtures'

import { VenueFirmwareList } from '.'


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
        FirmwareUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(switchCurrentVersions))
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

  it.skip('should update selected rows', async () => {
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

    const updateButton = screen.getByRole('button', { name: /Update Now/i })
    fireEvent.click(updateButton)

    const updateVenueButton = await screen.findByText('Run Update')
    fireEvent.click(updateVenueButton)
  })

  it('should no default option in dialog when feature flag is off', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row2 = await screen.findByRole('row', { name: /v2/i })
    fireEvent.click(within(row2).getByRole('checkbox'))

    const updateButton = screen.getByRole('button', { name: /Update Now/i })
    fireEvent.click(updateButton)

    const article = screen.getByRole('article')
    expect(article.innerHTML).toBe('Choose which version to update the venue to:')

    const notCheckedOptions = await screen.findAllByRole('radio', { hidden: false, checked: false })
    expect(notCheckedOptions).toHaveLength(5)
    expect(screen.getByRole('button', { name: /Run Update/i })).toBeDisabled()
  })

  it('should selected default options in dialog when feature flag is on', async () => {
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

    const updateButton = screen.getByRole('button', { name: /Update Now/i })
    fireEvent.click(updateButton)

    const article = await screen.findAllByRole('article')
    expect(article).toHaveLength(2)
    expect(article[0].innerHTML).toBe('Firmware available for ICX-8200 Series (3 switches)')
    // eslint-disable-next-line max-len
    expect(article[1]?.innerHTML).toBe('Firmware available for ICX 7150/7550/7650/7850 Series Models (2 switches)')

    const notCheckedOptions = await screen.findAllByRole('radio', { hidden: false, checked: false })
    expect(notCheckedOptions).toHaveLength(5)

    const checkedOptions = await screen.findAllByRole('radio', { hidden: false, checked: true })
    expect(checkedOptions).toHaveLength(2)

    // eslint-disable-next-line max-len
    const notUpdateOptions = await screen.findAllByRole('radio', { name: 'Do not update firmware on these switches' })
    expect(notUpdateOptions).toHaveLength(2)
    expect(notUpdateOptions[0]).toBeChecked()
    expect(notUpdateOptions[1]).toBeChecked()

    expect(screen.getByRole('button', { name: /Run Update/i })).toBeDisabled()
  })
})
