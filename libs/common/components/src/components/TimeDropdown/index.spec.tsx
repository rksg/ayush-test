import { ReactElement } from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { render, screen } from '@acx-ui/test-utils'

import '@testing-library/jest-dom/extend-expect'
import { DayTimeDropdown, DayTimeDropdownTypes, getDisplayTime, TimeDropdown, DayAndTimeDropdownTypes } from '.'



const { click } = userEvent

describe('TimeDropdown', () => {
  it('renders Daily dropdown without disabled time correctly', async () => {
    render(
      <Form>
        <TimeDropdown name='daily' spanLength={24} />
      </Form>
    )

    expect(screen.getByText('Select hour')).toBeInTheDocument()
  })

  it('renders Daily dropdown with disabled strictly before correctly', async () => {
    render(
      <Form>
        <TimeDropdown name='daily'
          spanLength={24}
          disabledDateTime={
            { disabledStrictlyBefore: 10 }
          }
        />
      </Form>
    )
    expect(screen.getByText('Select hour')).toBeInTheDocument()
    await click(screen.getByText('Select hour'))
    expect(screen.getByText('10:15 (UTC+00)')).toBeInTheDocument()
    expect(screen.queryByText('09:30 (UTC+00)')).not.toBeInTheDocument()
  })

  it('renders Daily dropdown with disabled strictly after correctly', async () => {
    render(
      <Form>
        <TimeDropdown name='daily'
          spanLength={24}
          disabledDateTime={
            { disabledStrictlyAfter: 1.75 }
          }
        />
      </Form>
    )
    expect(screen.getByText('Select hour')).toBeInTheDocument()
    await click(screen.getByText('Select hour'))
    expect(screen.getByText('01:30 (UTC+00)')).toBeInTheDocument()
    expect(screen.queryByText('02:00 (UTC+00)')).not.toBeInTheDocument()
  })

  it('renders Daily dropdown with disabled correctly', async () => {
    render(
      <Form>
        <TimeDropdown name='daily'
          spanLength={24}
          disabledDateTime={
            { disabledStrictlyBefore: 1,
              disabledStrictlyAfter: 1.75 }
          }
        />
      </Form>
    )
    expect(screen.getByText('Select hour')).toBeInTheDocument()
    await click(screen.getByText('Select hour'))
    expect(screen.getByText('01:15 (UTC+00)')).toBeInTheDocument()
    expect(screen.getByText('01:30 (UTC+00)')).toBeInTheDocument()
    expect(screen.queryByText('00:45 (UTC+00)')).not.toBeInTheDocument()
    expect(screen.queryByText('02:00 (UTC+00)')).not.toBeInTheDocument()
  })

  it('renders Weekly dropdown correctly', () => {
    render(
      <Form>
        <DayTimeDropdown type={DayTimeDropdownTypes.Weekly}
          name='weekly'
          spanLength={11}
        />
      </Form>
    )

    expect(screen.getByText('Select day')).toBeInTheDocument()
    expect(screen.getByText('Select hour')).toBeInTheDocument()
  })

  it('renders Month dropdown correctly', () => {
    render(
      <Form>
        <DayTimeDropdown type={DayTimeDropdownTypes.Monthly}
          name='monthly'
          spanLength={11}
        />
      </Form>
    )
    expect(screen.getByText('Select day')).toBeInTheDocument()
    expect(screen.getByText('Select hour')).toBeInTheDocument()
  })
})

describe ('getDisplayTime', () => {
  it('should return a function that formats time for "daily" type', () => {
    type DailyFunction = (hour: number) => React.ReactNode
    const displayTime = getDisplayTime(DayAndTimeDropdownTypes.Daily) as DailyFunction
    expect(displayTime).toBeInstanceOf(Function)

    const result = displayTime(12)
    expect(result).toBe('12:00 (UTC+00)')
  })

  it('should return a function that formats time for "weekly" type', () => {
    const displayWeeklyFunction = getDisplayTime(DayAndTimeDropdownTypes.Weekly)
    expect(displayWeeklyFunction).toBeInstanceOf(Function)

    const { container } = render(displayWeeklyFunction(1, 12) as ReactElement)
    expect(container.textContent).toContain('Monday at 12:00 (UTC+00)')
  })

  it('should return a function that formats time for "monthly" type', () => {
    const displayMonthlyFunction = getDisplayTime(DayAndTimeDropdownTypes.Monthly)
    expect(displayMonthlyFunction).toBeInstanceOf(Function)

    const { container } = render(displayMonthlyFunction(15, 12) as ReactElement)
    expect(container.textContent).toContain('15th at 12:00 (UTC+00)')
  })
})
