import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import moment             from 'moment'

import { DateRange } from '@acx-ui/analytics/utils'

import { DatePicker } from '.'
jest.mock('@acx-ui/icons', () => ({
  ArrowDown: () => <div>ArrowDown</div>
}))

describe('CalenderRangePicker', () => {
  it('should render default CalenderRangePicker', () => {
    const { asFragment } = render(
      <DatePicker 
        rangeOptions
        onDateApply={()=>{}}
        selectedRange={{ start: moment('01/01/2022').subtract(1, 'days').seconds(0),
          end: moment('01/01/2022').seconds(0) }}/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render CalenderRangePicker when click on date select',async () => {
    render(
      <DatePicker
        selectedRange={{ start: moment().subtract(1, 'days').seconds(0),
          end: moment().seconds(0) }}
        onDateApply={()=>{}}
        rangeOptions={[DateRange.today, DateRange.last7Days]}
        showTimePicker
        enableDates={[moment().subtract(7, 'days').seconds(0),
          moment().seconds(0)]}/>)
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })
  it('should close CalenderRangePicker when click on apply',async () => {
    render(
      <DatePicker
        onDateApply={()=>{}}
        rangeOptions={[DateRange.today, DateRange.last7Days]}
        showTimePicker
        selectedRange={{ start: moment().subtract(7, 'days').seconds(0),
          end: moment().seconds(0) }}
        enableDates={[moment().subtract(7, 'days').seconds(0),
          moment().seconds(0)]}/>)
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const applyButton = await screen.findByText('Apply')
    await user.click(applyButton)
    expect(await screen.findByText('Apply')).toBeVisible()
  })
  it('should close CalenderRangePicker when click on cancel',async () => {
    render(
      <DatePicker
        onDateApply={()=>{}}
        rangeOptions={[DateRange.today, DateRange.last7Days]}
        selectedRange={{ start: moment().subtract(7, 'days').seconds(0),
          end: moment().seconds(0) }}/>)
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const cancelButton = await screen.findByText('Cancel')
    await user.click(cancelButton)
    expect(await screen.findByText('Cancel')).toBeVisible()
  })
  it('should select date when click on date selection',async () => {
    const onDateChange = jest.fn()
    render(
      <DatePicker
        selectedRange={{ start: moment('01/01/2022').subtract(7, 'days').seconds(0),
          end: moment('03/01/2022').seconds(0) }}
        onDateChange={onDateChange}
        onDateApply={()=>{}}
      />)
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const dateSelect = await screen.findAllByTitle(moment('01/01/2022').format('YYYY-MM-DD'))
    await user.click(dateSelect[0])
    expect( screen.getByRole('display-date-range'))
      .toHaveTextContent('01/01/2022')
    expect(onDateChange).toBeCalledTimes(1)
  })
  it('should select time when click on time selection',async () => {
    const onDateChange = jest.fn()
    render(<DatePicker
      showTimePicker
      rangeOptions={[DateRange.today, DateRange.last7Days]}
      onDateChange={onDateChange}
      selectedRange={{ start: moment().subtract(7, 'days').seconds(0),
        end: moment().seconds(0) }}
      onDateApply={()=>{}}

    />)
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const timeSelect = await screen.findAllByRole('time-picker')
    await user.click(timeSelect[0])
    const hourSelect = await screen.findAllByText('20')
    await user.click(hourSelect[hourSelect.length-1])
    expect( screen.getByRole('display-date-range'))
      .toHaveTextContent('20:')
    expect(onDateChange).toBeCalledTimes(1)
  })
})
