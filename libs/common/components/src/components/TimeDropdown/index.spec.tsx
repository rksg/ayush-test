import { ReactElement } from 'react'

import { Form } from 'antd'

import { render, screen } from '@acx-ui/test-utils'

import '@testing-library/jest-dom/extend-expect'
import { getDisplayTime, TimeDropdown } from '.'

describe('TimeDropdown', () => {
  it('renders Daily dropdown correctly', async () => {
    render(
      <Form>
        <TimeDropdown type='daily' name='daily' />
      </Form>
    )

    expect(screen.getByText('Select hour')).toBeInTheDocument()
  })

  it('renders Weekly dropdown correctly', () => {
    render(
      <Form>
        <TimeDropdown type='weekly' name='weekly' />
      </Form>
    )

    expect(screen.getByText('Select day')).toBeInTheDocument()
    expect(screen.getByText('Select hour')).toBeInTheDocument()
  })

  it('renders Month dropdown correctly', () => {
    render(
      <Form>
        <TimeDropdown type='monthly' name='monthly' />
      </Form>
    )
    expect(screen.getByText('Select day')).toBeInTheDocument()
    expect(screen.getByText('Select hour')).toBeInTheDocument()
  })
})

describe ('getDisplayTime', () => {
  it('should return a function that formats time for "daily" type', () => {
    type DailyFunction = (hour: number) => React.ReactNode
    const displayTime = getDisplayTime('daily') as DailyFunction
    expect(displayTime).toBeInstanceOf(Function)

    const result = displayTime(12)
    expect(result).toBe('12:00 (UTC+00)')
  })

  it('should return a function that formats time for "weekly" type', () => {
    const displayWeeklyFunction = getDisplayTime('weekly')
    expect(displayWeeklyFunction).toBeInstanceOf(Function)

    const { container } = render(displayWeeklyFunction(1, 12) as ReactElement)
    expect(container.textContent).toContain('Monday at 12:00 (UTC+00)')
  })

  it('should return a function that formats time for "monthly" type', () => {
    const displayMonthlyFunction = getDisplayTime('monthly')
    expect(displayMonthlyFunction).toBeInstanceOf(Function)

    const { container } = render(displayMonthlyFunction(15, 12) as ReactElement)
    expect(container.textContent).toContain('15th at 12:00 (UTC+00)')
  })
})