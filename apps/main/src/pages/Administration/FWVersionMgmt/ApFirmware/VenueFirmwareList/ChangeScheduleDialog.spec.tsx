import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

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
  waitFor,
  within
} from '@acx-ui/test-utils'


import {
  venue,
  preference,
  availableVersions,
  availableABFList
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

  it('should save the updated schedule', async () => {
    Date.now = jest.fn().mockReturnValue(new Date('2023-06-10T07:20:00.000Z'))

    const updateFn = jest.fn()

    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.updateVenueSchedules.url,
        (req, res, ctx) => {
          updateFn(req.body)
          res(ctx.json({ requstId: 'request-id' }))
        }
      ),
      rest.post(
        FirmwareUrlsInfo.updateVenueSchedules.oldUrl!,
        (req, res, ctx) => {
          updateFn(req.body)
          res(ctx.json({ requstId: 'request-id' }))
        }
      )
    )

    render(
      <Provider>
        <VenueFirmwareList />
      </Provider>, {
        route: { params, path: '/:tenantId/t/administration/fwVersionMgmt' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(row).getByRole('checkbox'))

    const changeButton = await screen.findByRole('button', { name: /Change Update Schedule/i })
    await userEvent.click(changeButton)

    const firstActiveABF = availableABFList.find(abfVersion => abfVersion.abf === 'active')
    const defaultVersionRegExp = new RegExp(firstActiveABF!.id)
    expect(await screen.findByRole('radio', { name: defaultVersionRegExp })).toBeVisible()

    const saveButton = await screen.findByRole('button',{ name: 'Save' })
    expect(saveButton).toBeDisabled()

    await userEvent.click(screen.getByPlaceholderText('Select date'))
    await userEvent.click(await screen.findByRole('cell', { name: /16/ }))
    await userEvent.click(await screen.findByRole('radio', { name: new RegExp('12 AM - 02 AM') }))
    expect(saveButton).not.toBeDisabled()

    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(updateFn).toHaveBeenCalledWith(expect.objectContaining({
        date: '2023-06-16',
        time: '00:00-02:00'
      }))
    })
  })

})
