import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { firmwareApi }        from '@acx-ui/rc/services'
import { FirmwareUrlsInfo }   from '@acx-ui/rc/utils'
import { Provider, store }    from '@acx-ui/store'
import { mockServer, render } from '@acx-ui/test-utils'



import { mockedApModelFirmwares, mockedFirmwareVenuesPerApModel } from '../__tests__/fixtures'

import { ChangeSchedulePerApModelDialog } from '.'


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


const onCancelFn = jest.fn()
const afterSubmitFn = jest.fn()
describe('Change Scheudule Dialog Per AP Model', () => {
  beforeEach(() => {
    store.dispatch(firmwareApi.util.resetApiState())
    afterSubmitFn.mockClear()
    afterSubmitFn.mockClear()

    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getAllApModelFirmwareList.url,
        (_, res, ctx) => res(ctx.json(mockedApModelFirmwares))
      ),
      rest.post(
        FirmwareUrlsInfo.startFirmwareBatchOperation.url,
        (_, res, ctx) => res(ctx.json({ requestId: '12345', response: { batchId: 'BAT12345' } }))
      )
    )
  })

  afterEach(() => {
    Modal.destroyAll()
  })

  it('should render successfully', async () => {
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

    const mockVenuesFirmwares = mockedFirmwareVenuesPerApModel.data

    render(
      <Provider>
        <ChangeSchedulePerApModelDialog
          onCancel={onCancelFn}
          afterSubmit={afterSubmitFn}
          selectedVenuesFirmwares={mockVenuesFirmwares} />
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(screen.getByText('Change Update Schedule')).toBeVisible()
    await screen.findAllByText('Do not update firmware on selected venues')
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('radio', { name: '7.0.0.104.1242 (Release - Recommended) - 02/27/2024' })).toBeVisible()

    // eslint-disable-next-line max-len
    const firstDoNotUpdateButton = screen.queryAllByRole('radio', { name: 'Do not update firmware on selected venues' })[0]
    await userEvent.click(firstDoNotUpdateButton)

    // Verify the selected options are kept when jumping within the steps
    await userEvent.click(screen.getByRole('button', { name: /Next/ }))
    await userEvent.click(screen.getByRole('button', { name: /Back/ }))
    await userEvent.click(screen.getByRole('button', { name: /Next/ }))

    // Select a date fromt the datepicker and a time range
    await userEvent.click(await screen.findByRole('textbox'))
    await screen.findByRole('button', { name: /Apr/ })

    const datepickerTable = await screen.findByRole('table')
    await userEvent.click(await within(datepickerTable).findByRole('cell', { name: /21/ }))
    await userEvent.click(await screen.findByRole('radio', { name: /12 AM - 02 AM/ }))

    const saveButton = screen.getByRole('button', { name: /Save/ })
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

    await waitFor(() => expect(afterSubmitFn).toBeCalledTimes(1))
    // close dialog
    expect(onCancelFn).toBeCalledTimes(1)

  })
})
