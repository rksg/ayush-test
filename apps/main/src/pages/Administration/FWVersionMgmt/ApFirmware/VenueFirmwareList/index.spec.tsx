import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

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
  waitForElementToBeRemoved,
  waitFor
} from '@acx-ui/test-utils'


import {
  venue,
  preference,
  availableVersions,
  successResponse,
  availableABFList
} from '../../__tests__/fixtures'

import { VenueFirmwareList } from '.'


describe('Firmware Venues Table', () => {
  const params: { tenantId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getVenueVersionList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([...venue]))
      ),
      rest.get(
        FirmwareUrlsInfo.getAvailableFirmwareList.url.replace('?status=release', ''),
        (req, res, ctx) => {
          const searchParams = req.url.searchParams
          if (searchParams.get('status') !== 'release') return res(ctx.json([]))

          if (searchParams.get('abf') !== null) return res(ctx.json([ ...availableABFList ]))

          return res(ctx.json([...availableVersions]))
        }
      ),
      rest.get(
        FirmwareUrlsInfo.getUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json({ ...preference }))
      ),
      rest.patch(
        FirmwareUrlsInfo.updateNow.url,
        (req, res, ctx) => res(ctx.json({ ...successResponse }))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    expect(await screen.findByRole('row', { name: /My-Venue/ })).toBeVisible()
  })

  it('should update selected row', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /My-Venue/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    const row2 = await screen.findByRole('row', { name: /Peter-Venue/i })
    fireEvent.click(within(row2).getByRole('checkbox'))

    const updateButton = screen.getByRole('button', { name: /Update Now/i })
    fireEvent.click(updateButton)

    await screen.findByText('Active Device')
    const updateVenueButton = await screen.findByText('Run Update')
    fireEvent.click(updateVenueButton)
  })

  it.skip('should update multiple selected row', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /My-Venue/i })
    fireEvent.click(within(row).getByRole('checkbox'))

    const row2 = await screen.findByRole('row', { name: /Peter-Venue/i })
    fireEvent.click(within(row2).getByRole('checkbox'))

    const updateButton = screen.getByRole('button', { name: /Update Now/i })
    fireEvent.click(updateButton)

    await screen.findByText('Active Device')
    const updateVenueButton = await screen.findByText('Run Update')
    fireEvent.click(updateVenueButton)
  })

  it('should update selected row with advanced dialog', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const updateNowFn = jest.fn()
    mockServer.use(
      rest.patch(
        FirmwareUrlsInfo.updateNow.url,
        (req, res, ctx) => {
          updateNowFn(req.body)
          return res(ctx.json({ ...successResponse }))
        }
      )
    )

    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(row).getByRole('checkbox'))

    const row2 = await screen.findByRole('row', { name: /Ben-Venue-US/i })
    await userEvent.click(within(row2).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Update Now/i }))
    await userEvent.click(await screen.findByRole('checkbox', { name: /Legacy Device/i }))
    await userEvent.click(await screen.findByRole('button', { name: /Run Update/ }))

    await waitFor(() => {
      expect(updateNowFn).toHaveBeenCalled()
    })
  })

  it('should render Legacy AP Firmware column', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    const rowWithLegacyAp = await screen.findByRole('row', { name: /Ben-Venue-US/ })
    expect(within(rowWithLegacyAp).getByRole('cell', { name: '6.1.0.10.413' })).toBeVisible()

    const rowWithoutLegacyAp = await screen.findByRole('row', { name: /Legacy-Venue/ })
    expect(within(rowWithoutLegacyAp).queryByRole('cell', { name: '6.2.0.103.513' })).toBeNull()
  })

  it('should show a message in the Update Now dialog when AP Models is empty', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Update Now/i }))

    const dialog = await screen.findByRole('dialog', { name: 'Update Now' })
    expect(await within(dialog).findByText('No Access Point in selected venue(s)')).toBeVisible()
  })
})
