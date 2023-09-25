import { render, screen, fireEvent } from '@testing-library/react'
import { IntlProvider }              from 'react-intl'

import { Provider }  from '@acx-ui/store'
import { DateRange } from '@acx-ui/utils'

import {
  TimeRangeDropDownProvider,
  useDateRange,
  TimeRangeDropDown ,
  defaultTimeRangeDropDownContextValue
} from '.'

describe('TimeRangeDropDown', () => {
  it('TimeRangeDropDownProvider provides default value', async () => {
    const TestComponent = () => {
      const { timeRangeDropDownRange } = useDateRange()
      return <div>{timeRangeDropDownRange}</div>
    }
    render(
      <TimeRangeDropDownProvider>
        <TestComponent />
      </TimeRangeDropDownProvider>
      ,{ wrapper: Provider })
    expect(screen.getByText(DateRange.last24Hours)).toBeInTheDocument()
  })

  it('TimeRangeDropDown displays and updates range', async () => {
    render(
      <IntlProvider locale='en'>
        <TimeRangeDropDownProvider>
          <TimeRangeDropDown />
        </TimeRangeDropDownProvider>
      </IntlProvider>,
      { wrapper: Provider }
    )
    expect(screen.getByText(DateRange.last24Hours)).toBeInTheDocument()
    fireEvent.click(screen.getByText(DateRange.last24Hours))
    fireEvent.click(screen.getByText(DateRange.last7Days))
    expect(screen.getAllByText(DateRange.last7Days)[0]).toBeInTheDocument()
  })

  it('TimeRangeDropDownContext updates value', async () => {
    const TestComponent = () => {
      const { timeRangeDropDownRange, setTimeRangeDropDownRange } = useDateRange()
      return (
        <div>
          <div>{timeRangeDropDownRange}</div>
          <button onClick={() => setTimeRangeDropDownRange(DateRange.last7Days)}>
            Update Range
          </button>
        </div>
      )
    }
    render(
      <TimeRangeDropDownProvider>
        <TestComponent />
      </TimeRangeDropDownProvider>,
      { wrapper: Provider }
    )
    expect(screen.getByText(DateRange.last24Hours)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Update Range'))
    expect(screen.getByText(DateRange.last7Days)).toBeInTheDocument()
  })
  it('should have a no-op setTimeRangeDropDownRange function', () => {
    expect(() => defaultTimeRangeDropDownContextValue
      .setTimeRangeDropDownRange(DateRange.last7Days)).not.toThrow()
    expect(defaultTimeRangeDropDownContextValue.timeRangeDropDownRange).toBe(DateRange.last24Hours)
  })
})
