import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { firmwareApi }      from '@acx-ui/rc/services'
import { FirmwareUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }  from '@acx-ui/store'
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
    store.dispatch(firmwareApi.util.resetApiState())

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

    const dialog = await screen.findByRole('dialog')

    expect(within(dialog).getByText('Update firmware by AP model')).toBeVisible()

    expect(await within(dialog).findByText('See more devices')).toBeVisible()

    const updateFirmwareByApModelToggle = within(dialog).getByRole('switch')
    await userEvent.click(updateFirmwareByApModelToggle)

    // eslint-disable-next-line max-len
    expect(await within(dialog).findByRole('checkbox', { name: /Show APs with available firmware only/ })).toBeVisible()

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should execute Change Update Schedule action', async () => {
    // Mock the date to fix the dates of the datepicker
    Date.now = jest.fn().mockReturnValue(new Date('2024-04-16T00:00:00.000Z'))

    const changeScheduleFn = jest.fn()
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.updateVenueSchedulesPerApModel.url,
        (req, res, ctx) => {
          changeScheduleFn(req.body)
          return res(ctx.json({}))
        }
      )
    )

    render(
      <Provider>
        <VenueFirmwareListPerApModel />
      </Provider>, { route: { params, path } }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const testingRecord = mockedFirmwareVenuesPerApModel[0]
    const targetRow = screen.getByRole('row', { name: new RegExp(testingRecord.name) })

    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /Change Update Schedule/i }))

    const dialog = await screen.findByRole('dialog')

    expect(within(dialog).getByText('Change Update Schedule')).toBeVisible()

    // eslint-disable-next-line max-len
    expect(await within(dialog).findByRole('radio', { name: '7.0.0.104.1242 (Release - Recommended) - 02/27/2024' })).toBeVisible()

    // eslint-disable-next-line max-len
    const firstDoNotUpdateButton = screen.queryAllByRole('radio', { name: 'Do not update firmware on selected venue(s)' })[0]
    await userEvent.click(firstDoNotUpdateButton)
    // Verify the selected options are kept when jumping within the steps
    await userEvent.click(within(dialog).getByRole('button', { name: /Next/ }))
    await userEvent.click(within(dialog).getByRole('button', { name: /Back/ }))
    await userEvent.click(within(dialog).getByRole('button', { name: /Next/ }))

    // Select a date fromt the datepicker and a time range
    await userEvent.click(await within(dialog).findByRole('textbox'))
    await screen.findByRole('button', { name: /Apr/ })
    const datepickerTable = screen.queryAllByRole('table')[1]
    await userEvent.click(await within(datepickerTable).findByRole('cell', { name: /21/ }))
    await userEvent.click(await within(dialog).findByRole('radio', { name: /12 AM - 02 AM/ }))

    const saveButton = within(dialog).getByRole('button', { name: /Save/ })

    await waitFor(() => expect(saveButton).not.toHaveAttribute('disabled'))

    await userEvent.click(saveButton)

    await waitFor(() => expect(changeScheduleFn).toHaveBeenCalledWith({
      date: '2024-04-21',
      time: '00:00-02:00',
      targetFirmwares: [
        {
          apModel: 'R720',
          firmware: '6.2.4.103.244'
        },
        {
          apModel: 'R500',
          firmware: '6.2.0.103.554'

        }
      ]
    }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })
})
