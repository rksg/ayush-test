import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import moment             from 'moment'
import { IntlProvider }   from 'react-intl'

import { DateRange } from '@acx-ui/utils'

import { RangePicker } from '.'

jest.mock('@acx-ui/icons', () => ({
  CaretDownSolid: () => <div>CaretDownSolid</div>,
  ClockOutlined: () => <div>ClockOutlined</div>
}))

describe('CalenderRangePicker', () => {
  it('should render default CalenderRangePicker', () => {
    const { asFragment } = render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          onDateApply={() => {}}
          selectedRange={{
            startDate: moment('01/01/2022').subtract(1, 'days').seconds(0),
            endDate: moment('01/01/2022').seconds(0)
          }}
        />
      </IntlProvider>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('should open CalenderRangePicker when click on date select', async () => {
    const { container } = render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.last24Hours}
          selectedRange={{
            startDate: moment().subtract(1, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
          onDateApply={() => {}}
          rangeOptions={[DateRange.today, DateRange.last7Days]}
          showTimePicker
          enableDates={[moment().subtract(7, 'days').seconds(0), moment().seconds(0)]}
        />
      </IntlProvider>

    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container).not.toHaveClass('ant-picker-dropdown-hidden')
  })
  it('should close CalenderRangePicker when click on apply', async () => {
    const { container } = render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.last7Days}
          onDateApply={() => {}}
          rangeOptions={[DateRange.today, DateRange.last7Days]}
          showTimePicker
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
          enableDates={[moment().subtract(7, 'days').seconds(0), moment().seconds(0)]}
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
  it('should close CalenderRangePicker when click outside', async () => {
    const { container } = render(
      <IntlProvider locale='en'>
        <RangePicker
          onDateApply={() => {}}
          selectionType={DateRange.last7Days}
          rangeOptions={[DateRange.today, DateRange.last7Days]}
          showTimePicker
          selectedRange={{
            startDate: moment().subtract(7, 'days').seconds(0),
            endDate: moment().seconds(0)
          }}
          enableDates={[moment().subtract(7, 'days').seconds(0), moment().seconds(0)]}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container).not.toHaveClass('ant-picker-dropdown-hidden')
    await user.click(document.body)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.getElementsByClassName('ant-picker-dropdown-hidden').length).toBe(1)
  })
  it('should close CalenderRangePicker when click on cancel', async () => {
    const { container } = render(
      <IntlProvider locale='en'>
        <RangePicker
          onDateApply={() => {}}
          selectionType={DateRange.last7Days}
          rangeOptions={[DateRange.today, DateRange.last7Days]}
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
  it('should close CalenderRangePicker when click on ranges', async () => {
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
          rangeOptions={[DateRange.today, DateRange.last7Days]}
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
    await user.click(await screen.findByText('Today'))
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
            startDate: moment('01/01/2022').subtract(7, 'days').seconds(0),
            endDate: moment('03/01/2022').seconds(0)
          }}
          onDateChange={onDateChange}
          onDateApply={() => {}}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const dateSelect = await screen.findAllByTitle(moment('01/01/2022').format('YYYY-MM-DD'))
    await user.click(dateSelect[0])
    expect(screen.getByRole('display-date-range')).toHaveTextContent('Dec 31 2021 - Feb 28 2022')
    expect(onDateChange).toBeCalledTimes(1)
  })
  it('should select time when click on time selection', async () => {
    const onDateChange = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.last7Days}
          showTimePicker
          rangeOptions={[DateRange.today, DateRange.last7Days]}
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
          rangeOptions={[DateRange.today, DateRange.last7Days]}
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
          rangeOptions={[DateRange.today, DateRange.last7Days]}
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
            startDate: moment('01/01/2022').subtract(7, 'days').seconds(0),
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
    const dateSelect = await screen.findAllByTitle(moment('01/01/2022').format('YYYY-MM-DD'))
    await user.click(dateSelect[0])
    expect(screen.getByRole('display-date-range')).toHaveTextContent('Dec 31 2021 -')
  })
  it('should display only end date when start date is not selected', async () => {
    const onDateChange = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{
            startDate: null,
            endDate: moment('01/01/2022').subtract(7, 'days').seconds(0)
          }}
          onDateChange={onDateChange}
          onDateApply={() => {}}
        />
      </IntlProvider>
    )
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('End date')
    await user.click(calenderSelect)
    const dateSelect = await screen.findAllByTitle(moment('01/01/2022').format('YYYY-MM-DD'))
    await user.click(dateSelect[0])
    expect(screen.getByRole('display-date-range')).toHaveTextContent('- Dec 31 2021')
  })
  it('should disable future time selection when startdate and end date are same', async () => {
    const onDateChange = jest.fn()
    render(
      <IntlProvider locale='en'>
        <RangePicker
          selectionType={DateRange.custom}
          selectedRange={{
            startDate: moment('03/01/2022').hours(12),
            endDate: moment('03/01/2022').hours(12)
          }}
          onDateChange={onDateChange}
          onDateApply={() => {}}
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
  })
})
