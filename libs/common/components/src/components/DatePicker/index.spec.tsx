import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import moment             from 'moment-timezone'
import { IntlProvider }   from 'react-intl'

import { DateRange, dateTimeFormats, getJwtTokenPayload, AccountTier } from '@acx-ui/utils'

import { DatePicker, RangePicker } from '.'

const mockGetJwtTokenPayload = getJwtTokenPayload as jest.Mock

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: jest.fn()
}))

describe('DatePicker', () => {
  it('should open when click on date select', async () => {
    render(
      <IntlProvider locale='en'>
        <DatePicker />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Select date')
    await user.click(calenderSelect)
    expect(await screen.findByText('Su')).toBeDefined()
  })
})

describe('RangePicker', () => {
  beforeEach(() => {
    mockGetJwtTokenPayload.mockReturnValue({ acx_account_tier: AccountTier.PLATINUM })
  })
  afterEach(() => {
    mockGetJwtTokenPayload.mockClear()
  })
  it('should open when click on date select', async () => {
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.last24Hours}
          selectedRange={{
            startDate: moment().subtract(1, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
          onDateApply={() => {}}
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          showTimePicker
        />
      </IntlProvider>

    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    expect(await screen.findAllByText('Su')).toHaveLength(2)
  })
  it('should close when click on apply', async () => {
    const { container } = render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.last7Days}
          onDateApply={() => {}}
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          showTimePicker
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
        />
      </IntlProvider>

    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const applyButton = await screen.findByText('Apply')
    await user.click(applyButton)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.getElementsByClassName('ant-picker-dropdown-hidden').length).toBe(1)
  })
  it('should close when click outside', async () => {
    const { container } = render(
      <IntlProvider locale='en'>
        <RangePicker
          onDateApply={() => {}}
          selectionType={DateRange.last7Days}
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          showTimePicker
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    expect(await screen.findAllByText('Su')).toHaveLength(2)
    await user.click(document.body)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.getElementsByClassName('ant-picker-dropdown-hidden').length).toBe(1)
  })
  it('should close when click on cancel', async () => {
    const { container } = render(
      <IntlProvider locale='en'>
        <RangePicker
          onDateApply={() => {}}
          selectionType={DateRange.last7Days}
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const cancelButton = await screen.findByText('Cancel')
    await user.click(cancelButton)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.getElementsByClassName('ant-picker-dropdown-hidden').length).toBe(1)
  })
  it('should close when click on ranges', async () => {
    Object.defineProperty(HTMLElement.prototype, 'innerText', {
      get () {
        return this.textContent
      }
    })
    const { container } = render(
      <IntlProvider locale='en'>
        <RangePicker
          onDateApply={() => {}}
          selectionType={DateRange.last7Days}
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    await user.click(await screen.findByText('Last 24 Hours'))
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.getElementsByClassName('ant-picker-dropdown-hidden').length).toBe(1)
  })
  it('should select date when click on date selection', async () => {
    const onDateChange = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
          onDateChange={onDateChange}
          onDateApply={() => {}}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const yesterday = moment().subtract(1, 'day')
    const dateSelect = await screen.findAllByTitle(yesterday.format('YYYY-MM-DD'))
    await user.click(dateSelect[0])
    const today = moment().format(dateTimeFormats.dateFormat)
    const yestFormat = yesterday.format(dateTimeFormats.dateFormat)
    expect(screen.getByRole('display-date-range')).toHaveTextContent(`${yestFormat} - ${today}`)
    expect(onDateChange).toBeCalledTimes(1)
  })
  it('should select time when click on time selection', async () => {
    const onDateChange = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.last7Days}
          showTimePicker
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          onDateChange={onDateChange}
          onDateApply={() => {}}
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const timeSelect = await screen.findAllByRole('time-picker')
    await user.click(timeSelect[0])
    const hourSelect = await screen.findAllByText('20')
    await user.click(hourSelect[hourSelect.length - 1])
    expect(screen.getByRole('display-date-range')).toHaveTextContent('20:')
    expect(onDateChange).toBeCalledTimes(1)
  })
  it('should select end time when click on end time selection', async () => {
    const onDateChange = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          showTimePicker
          selectionType={DateRange.last7Days}
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          onDateChange={onDateChange}
          onDateApply={() => {}}
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
        />
      </IntlProvider>

    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const timeSelect = await screen.findAllByRole('time-picker')
    await user.click(timeSelect[2])
    const hourSelect = await screen.findAllByText('20')
    await user.click(hourSelect[hourSelect.length - 1])
    expect(screen.getByRole('display-date-range')).toHaveTextContent('20:')
    expect(onDateChange).toBeCalledTimes(1)
  })
  it('should reset endTime to startTime when select startTime greater than endTime', async () => {
    const onDateChange = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          showTimePicker
          rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
          onDateChange={onDateChange}
          selectionType={DateRange.custom}
          onDateApply={() => {}}
          selectedRange={{
            startDate: moment('03/01/2022').seconds(0),
            endDate: moment('03/01/2022').seconds(0)
          }}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const timeSelect = await screen.findAllByRole('time-picker')
    await user.click(timeSelect[0])
    const hourSelect = await screen.findAllByText('20')
    await user.click(hourSelect[hourSelect.length - 1])
    expect(screen.getByRole('display-date-range')).toHaveTextContent('20:')
    expect(onDateChange).toBeCalledTimes(1)
  })
  it('should display selection for null values', async () => {
    const onDateChange = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{ startDate: null, endDate: null }}
          onDateChange={onDateChange}
          onDateApply={() => {}}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    expect(screen.getByRole('display-date-range')).toHaveTextContent('-')
  })
  it('should display only start date when end date is not selected', async () => {
    const onDateChange = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: null
          }}
          onDateChange={onDateChange}
          onDateApply={() => {}}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const dateSelect = await screen.findAllByTitle(moment().format('YYYY-MM-DD'))
    await user.click(dateSelect[0])
    expect(
      screen.getByRole('display-date-range')
    ).toHaveTextContent(moment().format(dateTimeFormats.dateFormat))
  })
  it('should display only end date when start date is not selected', async () => {
    const onDateChange = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{
            startDate: null,
            endDate: moment().subtract(7, 'days').seconds(0)
          }}
          onDateChange={onDateChange}
          onDateApply={() => {}}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('End date')
    await user.click(calenderSelect)
    const dateSelect = await screen.findAllByTitle(moment().format('YYYY-MM-DD'))
    await user.click(dateSelect[0])
    expect(
      screen.getByRole('display-date-range')
    ).toHaveTextContent(moment().format(dateTimeFormats.dateFormat))
  })
  it('should disable apply when startdate and end date are same', async () => {
    const onDateChange = jest.fn()
    const apply = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{
            startDate: moment('03/01/2022').hours(12),
            endDate: moment('03/01/2022').hours(12)
          }}
          onDateChange={onDateChange}
          onDateApply={apply}
          showTimePicker
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const timeSelect = await screen.findAllByRole('time-picker')
    await user.click(timeSelect[2])
    const hourSelect = await screen.findAllByText('11')
    await user.click(hourSelect[hourSelect.length - 1])
    expect(screen.getByRole('display-date-range')).not.toHaveTextContent('11:')
    const applyButton = await screen.findByText('Apply')
    await user.click(applyButton)
    expect(apply).toBeCalledTimes(0)
  })
  it('should restrict date for gold tier license', async () => {
    mockGetJwtTokenPayload.mockReturnValue({ acx_account_tier: AccountTier.GOLD })
    const onDateChange = jest.fn()
    const apply = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{
            startDate: moment().subtract(3, 'months').seconds(0),
            endDate: moment().seconds(0)
          }}
          onDateChange={onDateChange}
          onDateApply={apply}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const dateSelect = await screen.findAllByTitle(
      moment().subtract(2, 'months').format('YYYY-MM-DD')
    )
    await user.click(dateSelect[0])
    const applyButton = await screen.findByText('Apply')
    await user.click(applyButton)
    expect(onDateChange).toHaveBeenCalledTimes(0)
    expect(apply).toHaveBeenCalledTimes(1)
  })
})
