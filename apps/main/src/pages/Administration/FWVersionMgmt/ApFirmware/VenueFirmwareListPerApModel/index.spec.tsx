import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { FirmwareUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }         from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within,
  waitForElementToBeRemoved,
  waitFor
} from '@acx-ui/test-utils'


import { preference } from '../../__tests__/fixtures'

import { mockedApModelFirmwares, mockedFirmwareVenuesPerApModel, mockedFirmwareVersionIdList } from './__tests__/fixtures'

import { VenueFirmwareListPerApModel } from '.'


describe('Firmware Venues Table Per AP Model', () => {
  const params = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  const path = '/:tenantId/administration/fwVersionMgmt'

  beforeEach(() => {
    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json(preference))
      ),
      rest.get(
        FirmwareUrlsInfo.getFirmwareVersionIdList.url,
        (req, res, ctx) => res(ctx.json(mockedFirmwareVersionIdList))
      ),
      rest.get(
        FirmwareUrlsInfo.getAllApModelFirmwareList.url,
        (req, res, ctx) => res(ctx.json(mockedApModelFirmwares))
      ),
      rest.post(
        FirmwareUrlsInfo.getVenueApModelFirmwareList.url,
        (req, res, ctx) => res(ctx.json(mockedFirmwareVenuesPerApModel))
      )
    )
  })

  afterEach(() => {
    Modal.destroyAll()
  })

  it('should render table', async () => {
    render(
      <Provider>
        <VenueFirmwareListPerApModel />
      </Provider>, {
        route: { params, path }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const testingRecord = mockedFirmwareVenuesPerApModel[0]
    const testingRecordStatus = testingRecord.isFirmwareUpToDate ? 'Up to date' : 'Update available'
    const targetRow = screen.getByRole('row', { name: new RegExp(testingRecord.name) })

    expect(within(targetRow).getByText(testingRecordStatus)).toBeVisible()
  })

  it('should execute Update Now action', async () => {
    render(
      <Provider>
        <VenueFirmwareListPerApModel />
      </Provider>, {
        route: { params, path }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const testingRecord = mockedFirmwareVenuesPerApModel[0]
    const targetRow = screen.getByRole('row', { name: new RegExp(testingRecord.name) })

    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /Update Now/i }))

    const confirmDialog = await screen.findByRole('dialog')

    expect(within(confirmDialog).getByText('Update firmware by AP model')).toBeVisible()

    expect(await within(confirmDialog).findByText('See more devices')).toBeVisible()

    const updateFirmwareByApModelToggle = within(confirmDialog).getByRole('switch')
    await userEvent.click(updateFirmwareByApModelToggle)


    // eslint-disable-next-line max-len
    expect(await within(confirmDialog).findByRole('checkbox', { name: /Show APs with available firmware only/ })).toBeVisible()

    await userEvent.click(within(confirmDialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(confirmDialog).not.toBeVisible())
  })
})
