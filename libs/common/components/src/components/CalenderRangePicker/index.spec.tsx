import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import moment             from 'moment'

import { DateRange } from '@acx-ui/analytics/utils'

import { CalenderRangePicker } from '.'
jest.mock('@acx-ui/icons', () => ({
  ArrowDown: () => <div>ArrowDown</div>
}))

describe('CalenderRangePicker', () => {
  it('should render default CalenderRangePicker', () => {
    const { asFragment } = render(<CalenderRangePicker showRanges/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render CalenderRangePicker when click on date select',async () => {
    render(<CalenderRangePicker 
      rangeOptions= {[DateRange.today, DateRange.last7Days]}
      showTimePicker
      enableDates={[moment().subtract(7, 'days').seconds(0),
        moment().seconds(0)]}/>)
    const user = userEvent.setup()

    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })
  it('should close CalenderRangePicker when click on apply',async () => {
    render(<CalenderRangePicker 
      rangeOptions= {[DateRange.today, DateRange.last7Days]}
      showTimePicker
      selectedRange=
        {{ start: moment().subtract(7, 'days').seconds(0), 
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
    render(<CalenderRangePicker 
      rangeOptions= {[DateRange.today, DateRange.last7Days]}
      selectedRange=
        {{ start: moment().subtract(7, 'days').seconds(0), 
          end: moment().seconds(0) }}/>)
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const cancelButton = await screen.findByText('Cancel')
    await user.click(cancelButton)
    expect(await screen.findByText('Cancel')).toBeVisible()
  })
  it('should select date when click on date selection',async () => {
    render(<CalenderRangePicker 
      selectedRange=
        {{ start: moment().subtract(40, 'days').seconds(0), 
          end: moment().seconds(0) }}/>)
    const user = userEvent.setup()
    const calenderSelect = await screen.findByPlaceholderText('Start date')
    await user.click(calenderSelect)
    const dateSelect = await screen.findAllByTitle(moment('06/07/2022').format('YYYY-MM-DD'))
    await user.click(dateSelect[0])
    expect( screen.getByRole('display-date-range'))
      .toHaveTextContent('06/07/2022')
  })
  it('should select time when click on time selection',async () => {
    render(<CalenderRangePicker 
      showTimePicker
      rangeOptions= {[DateRange.today, DateRange.last7Days]}
      selectedRange=
        {{ start: moment().subtract(7, 'days').seconds(0), 
          end: moment().seconds(0) }}
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
  })
})
