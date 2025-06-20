import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
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
  within,
  waitForElementToBeRemoved,
  waitFor
} from '@acx-ui/test-utils'


import {
  venue,
  preference,
  availableVersions,
  successResponse,
  availableABFList,
  mockedFirmwareVersionIdList,
  mockedApModelFamilies
} from '../../__tests__/fixtures'

import { VenueFirmwareList } from '.'


describe('Firmware Venues Table', () => {
  const params: { tenantId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }
  const path = '/:tenantId/administration/fwVersionMgmt'

  beforeEach(() => {
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getVenueVersionList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([ ...venue ]))
      ),
      rest.get(
        FirmwareUrlsInfo.getAvailableFirmwareList.url.replace('?status=release', ''),
        (req, res, ctx) => {
          const searchParams = req.url.searchParams
          // eslint-disable-next-line max-len
          if (searchParams.get('status') !== 'release') return res(ctx.json([ ...mockedFirmwareVersionIdList ]))

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
      ),
      rest.post(
        FirmwareUrlsInfo.getApModelFamilies.url,
        (req, res, ctx) => res(ctx.json(mockedApModelFamilies))
      )
    )
  })

  afterEach(() => {
    jest.mocked(useIsSplitOn).mockRestore()
    Modal.destroyAll()
  })

  it('should render table', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByRole('row', { name: /Latest-Venue/ })).toBeVisible()
  })

  it('should update selected row', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('row')
    expect(within(rows[4]).getByRole('cell', { name: /My-Venue/ })).toBeVisible()
    await userEvent.click(within(rows[4]).getByRole('checkbox')) //My-Venue

    const updateButton = screen.getByRole('button', { name: /Update Now/i })
    await userEvent.click(updateButton)

    const confirmDialog = await screen.findByRole('dialog')
    const updateVenueButton = within(confirmDialog).getByText('Update Firmware')
    await userEvent.click(updateVenueButton)
    await waitFor(() => expect(confirmDialog).not.toBeVisible())
  })

  it('should update multiple selected rows', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('row')
    expect(within(rows[4]).getByRole('cell', { name: /My-Venue/ })).toBeVisible()
    await userEvent.click(within(rows[4]).getByRole('checkbox')) //My-Venue
    expect(within(rows[5]).getByRole('cell', { name: /Peter-Venue/ })).toBeVisible()
    await userEvent.click(within(rows[5]).getByRole('checkbox')) //Peter-Venue

    const updateButton = screen.getByRole('button', { name: /Update Now/i })
    await userEvent.click(updateButton)

    const updateNowDialog = await screen.findByRole('dialog')
    await userEvent.click(within(updateNowDialog).getByText('Update Firmware'))
    await waitFor(() => expect(updateNowDialog).not.toBeVisible())
  })

  it('should render Legacy AP Firmware column', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: 'Ben-Venue-US' })).toBeVisible() //Ben-Venue-US
    expect(within(rows[1]).getByRole('cell', { name: '6.1.0.10.413' })).toBeVisible() //Ben-Venue-US
    expect(within(rows[2]).queryByRole('cell', { name: 'Legacy-Venue' })).toBeNull() //Legacy-Venue
    expect(within(rows[2]).queryByRole('cell', { name: '6.2.0.103.513' })).toBeNull() //Legacy-Venue
  })

  it('should show a message in the Update Now dialog when AP Models is empty', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('row')
    expect(within(rows[4]).getByRole('cell', { name: /My-Venue/i })).toBeVisible()
    await userEvent.click(within(rows[4]).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Update Now/i }))

    const dialog = await screen.findByRole('dialog', { name: 'Update Now' })

    // Verify that the message displayed is accurate when the active ABF has no AP models
    expect(await within(dialog).findByText('No affected AP for this upgrade')).toBeVisible()

    // Verify that the ABF can be upgraded when it is greater than the current venue ABF even if its current version equals to the latest version
    expect(within(dialog).getByRole('radio', { name: /6\.2\.3\.103\.200/i })).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Update Now' })).toBeNull())
  })

  it('should show the correct AP Models/Families when the corresponding FF is on', async () => {
    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const rows = await screen.findAllByRole('row')
    expect(within(rows[4]).getByRole('cell', { name: /My-Venue/i })).toBeVisible()
    await userEvent.click(within(rows[4]).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Update Now/i }))
    const updateNowDialog = await screen.findByRole('dialog')

    // Verify that the active ABF's AP models displayed are accurate
    // eslint-disable-next-line max-len
    expect(await within(updateNowDialog).findByText(/available firmware for Wi-Fi 6 AP \(R550\)/i)).toBeVisible()

    await userEvent.click(within(updateNowDialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Update Now' })).toBeNull())
  })
})
