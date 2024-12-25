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
import { noDataDisplay } from '@acx-ui/utils'

import { preference } from '../../__tests__/fixtures'

import { mockedApModelFirmwares, mockedFirmwareVenuesPerApModel, mockedFirmwareVersionIdList } from './__tests__/fixtures'

import { getApFirmwareStatusDescription, VenueFirmwareListPerApModel } from '.'

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')
  // @ts-ignore
  // eslint-disable-next-line max-len
  const Select = ({ children, onChange }: React.PropsWithChildren<{ onChange?: (value: string) => void }>) => {
    return (
      <select role='combobox' onChange={e => onChange?.(e.target.value)}>
        {children}
      </select>
    )
  }

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) => {
    return <option {...otherProps}>{children}</option>
  }

  return { ...antd, Select }
})

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
      ),
      rest.post(
        FirmwareUrlsInfo.startFirmwareBatchOperation.url,
        (req, res, ctx) => res(ctx.json({ requestId: '12345', response: { batchId: 'BAT12345' } }))
      ),
      rest.post(
        FirmwareUrlsInfo.getVenueApModelFirmwareSchedulesList.url,
        (_, res, ctx) => res(ctx.json(mockedFirmwareVenuesPerApModel.data))
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

    const testingRecord = mockedFirmwareVenuesPerApModel.data[0]
    // eslint-disable-next-line max-len
    const testingRecordStatus = testingRecord.isApFirmwareUpToDate ? 'Up to date' : 'Update available'
    const targetRow = screen.getByRole('row', { name: new RegExp(testingRecord.name) })

    expect(within(targetRow).getByText(testingRecordStatus)).toBeVisible()
  })

  it('should execute Update Now action', async () => {
    const updateFn = jest.fn()

    mockServer.use(
      rest.put(
        FirmwareUrlsInfo.patchVenueApModelFirmwares.url,
        (req, res, ctx) => {
          updateFn(req.body)
          return res(ctx.json({}))
        }
      )
    )

    render(
      <Provider>
        <VenueFirmwareListPerApModel />
      </Provider>, {
        route: { params, path }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const testingRecord1 = mockedFirmwareVenuesPerApModel.data[0]
    const targetRow1 = screen.getByRole('row', { name: new RegExp(testingRecord1.name) })
    await userEvent.click(within(targetRow1).getByRole('checkbox'))

    const testingRecord2 = mockedFirmwareVenuesPerApModel.data[2]
    const targetRow2 = screen.getByRole('row', { name: new RegExp(testingRecord2.name) })
    await userEvent.click(within(targetRow2).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Update Now/i }))

    const dialog = await screen.findByRole('dialog')

    expect(within(dialog).getByText('Update firmware by AP model')).toBeVisible()

    expect(await within(dialog).findByText('See more devices')).toBeVisible()

    const updateFirmwareByApModelToggle = within(dialog).getByRole('switch')
    await userEvent.click(updateFirmwareByApModelToggle)

    // eslint-disable-next-line max-len
    expect(await within(dialog).findByRole('checkbox', { name: /Show APs with available firmware only/ })).toBeVisible()

    await userEvent.click(within(dialog).getByRole('button', { name: 'Update Firmware' }))

    await waitFor(() => expect(updateFn).toBeCalledTimes(2))

    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should execute Change Update Schedule action', async () => {
    // Mock the date to fix the dates of the datepicker
    Date.now = jest.fn().mockReturnValue(new Date('2024-04-16T00:00:00.000Z'))

    const changeScheduleFn = jest.fn()
    mockServer.use(
      rest.put(
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

    const testingRecord = mockedFirmwareVenuesPerApModel.data[0]
    const targetRow = screen.getByRole('row', { name: new RegExp(testingRecord.name) })

    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /Change Update Schedule/i }))

    const dialog = await screen.findByRole('dialog')

    expect(within(dialog).getByText('Change Update Schedule')).toBeVisible()

    // eslint-disable-next-line max-len
    expect(await within(dialog).findByRole('radio', { name: '7.0.0.104.1242 (Release - Recommended) - 02/27/2024' })).toBeVisible()

    // eslint-disable-next-line max-len
    const firstDoNotUpdateButton = screen.queryAllByRole('radio', { name: 'Do not update firmware on selected venues' })[0]
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
      schedule: {
        date: '2024-04-21',
        time: '00:00-02:00'
      },
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

  it('shoulde execute Skip Update action', async () => {
    const skipUpdateFn = jest.fn()

    mockServer.use(
      rest.delete(
        FirmwareUrlsInfo.skipVenueSchedulesPerApModel.url,
        (req, res, ctx) => {
          skipUpdateFn()
          return res(ctx.json({ requestId: '123456' }))
        }
      )
    )

    render(
      <Provider>
        <VenueFirmwareListPerApModel />
      </Provider>, {
        route: { params, path }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const testingRecord1 = mockedFirmwareVenuesPerApModel.data[0]
    const targetRow1 = screen.getByRole('row', { name: new RegExp(testingRecord1.name) })
    await userEvent.click(within(targetRow1).getByRole('checkbox'))

    const testingRecord2 = mockedFirmwareVenuesPerApModel.data[1]
    const targetRow2 = screen.getByRole('row', { name: new RegExp(testingRecord2.name) })
    await userEvent.click(within(targetRow2).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Skip Update/i }))

    const dialog = await screen.findByRole('dialog')

    expect(within(dialog).getByText('Skip This Update?')).toBeVisible()

    await userEvent.click(within(dialog).getByRole('button', { name: 'Skip' }))

    await waitFor(() => expect(skipUpdateFn).toHaveBeenCalledTimes(2))

    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should execute Downgrade action', async () => {
    const downgradeFn = jest.fn()

    mockServer.use(
      rest.put(
        FirmwareUrlsInfo.patchVenueApModelFirmwares.url,
        (req, res, ctx) => {
          downgradeFn(req.body)
          return res(ctx.json({}))
        }
      )
    )

    render(
      <Provider>
        <VenueFirmwareListPerApModel />
      </Provider>, {
        route: { params, path }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const testingRecord = mockedFirmwareVenuesPerApModel.data[1]
    const targetRow = screen.getByRole('row', { name: new RegExp(testingRecord.name) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Downgrade/i }))

    const dialog = await screen.findByRole('dialog')

    expect(within(dialog).getByText('Firmware Downgrade')).toBeVisible()

    await userEvent.click(within(dialog).getByRole('button', { name: /Continue/i }))

    await userEvent.selectOptions(
      await within(dialog).findByRole('combobox'),
      '6.2.4.103.244 (Release - Recommended) - 12/25/2023'
    )

    await userEvent.click(within(dialog).getByRole('button', { name: /Next/i }))
    await userEvent.click(within(dialog).getByRole('button', { name: /Downgrade Firmware/i }))

    await waitFor(() => expect(downgradeFn).toHaveBeenCalled())

    await userEvent.click(await within(dialog).findByRole('button', { name: /Close/i }))

    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  // eslint-disable-next-line max-len
  it('should display the correct AP firmware in the UpdateFirmwarePerApModelIndividualPanel', async () => {
    render(
      <Provider>
        <VenueFirmwareListPerApModel />
      </Provider>, {
        route: { params, path }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line max-len
    const targetVenueName1 = mockedFirmwareVenuesPerApModel.data.find(d => d.name === 'venueBBB-upToDate')?.name ?? ''
    const targetRow1 = screen.getByRole('row', { name: new RegExp(targetVenueName1) })
    await userEvent.click(within(targetRow1).getByRole('checkbox'))

    // eslint-disable-next-line max-len
    const targetVenueName2 = mockedFirmwareVenuesPerApModel.data.find(d => d.name === 'venueCCC-oneApOutdated')?.name ?? ''
    const targetRow2 = screen.getByRole('row', { name: new RegExp(targetVenueName2) })
    await userEvent.click(within(targetRow2).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Update Now/i }))

    const dialog = await screen.findByRole('dialog')

    const updateFirmwareByApModelToggle = within(dialog).getByRole('switch')
    await userEvent.click(updateFirmwareByApModelToggle)

    // eslint-disable-next-line max-len
    const availableFWCheckbox = await within(dialog).findByRole('checkbox', { name: /Show APs with available firmware only/ })
    await userEvent.click(availableFWCheckbox)

    // Check if R350 is up-to-date
    const targetElement = await within(dialog).findByText(/The AP is up-to-date/i)
    expect(within(targetElement).getByText(new RegExp('7.0.0.104.1242'))).toBeVisible()

    // Check if R550 can be updated
    await userEvent.selectOptions(
      await within(dialog).findByRole('combobox'),
      '7.0.0.104.1242 (Release - Recommended) - 02/27/2024'
    )

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  describe('renderApFirmwareStatus', () => {
    it('should return noDataDisplay when isApFirmwareUpToDate is undefined', () => {
      const data = { isApFirmwareUpToDate: undefined, currentApFirmwares: [] }
      const result = getApFirmwareStatusDescription(data)
      expect(result).toBe(noDataDisplay)
    })

    it('should return noDataDisplay when currentApFirmwares is empty', () => {
      const data = { isApFirmwareUpToDate: true, currentApFirmwares: [] }
      const result = getApFirmwareStatusDescription(data)
      expect(result).toBe(noDataDisplay)
    })

    it('should return "Up to date" when isApFirmwareUpToDate is true', () => {
      // eslint-disable-next-line max-len
      const data = { isApFirmwareUpToDate: true, currentApFirmwares: [{ apModel: 'R550', firmware: '7.0.0.104.1220' }] }
      const result = getApFirmwareStatusDescription(data)
      expect(result).toBe('Up to date')
    })

    it('should return "Update available" when isApFirmwareUpToDate is false', () => {
      // eslint-disable-next-line max-len
      const data = { isApFirmwareUpToDate: false, currentApFirmwares: [{ apModel: 'R550', firmware: '7.0.0.104.1220' }] }
      const result = getApFirmwareStatusDescription(data)
      expect(result).toBe('Update available')
    })
  })
})
