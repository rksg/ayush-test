import { rest } from 'msw'

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
  venue,
  preference,
  availableVersions
} from '../../__tests__/fixtures'

import { VenueFirmwareList } from '.'


describe('Firmware Venues Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getVenueVersionList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(venue))
      ),
      rest.get(
        FirmwareUrlsInfo.getAvailableFirmwareList.url,
        (req, res, ctx) => res(ctx.json(availableVersions))
      ),
      rest.get(
        FirmwareUrlsInfo.getUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json(preference))
      ),
      rest.get(
        FirmwareUrlsInfo.getFirmwareVersionIdList.url,
        (req, res, ctx) => res(ctx.json(['6.2.1.103.1710']))
      ),
      rest.post(
        FirmwareUrlsInfo.updateVenueSchedules.url,
        (req, res, ctx) => res(ctx.json({ requstId: 'request-id' }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it.skip('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/t/administration/fwVersionMgmt' }
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
        route: { params, path: '/:tenantId/t/administration/fwVersionMgmt' }
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

})
