import { ReactElement } from 'react'

import { Form } from 'antd'

import { render, screen } from '@acx-ui/test-utils'

import '@testing-library/jest-dom/extend-expect'
import { DayTimeDropdown, DayTimeDropdownTypes, getDisplayTime, TimeDropdown, DayAndTimeDropdownTypes } from '.'

type MockSelectProps = React.PropsWithChildren<{
  showSearch: boolean
  onChange?: (value: string) => void
}>

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showSearch, // remove and left unassigned to prevent warning
    ...props
  }: MockSelectProps) => {
    return (<select {...props} onChange={(e) => props.onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  Select.OptGroup = 'optgroup'
  return { ...components, Select }
})

describe('TimeDropdown', () => {
  it('renders Daily dropdown without disabled time correctly', async () => {
    render(
      <Form>
        <TimeDropdown name='daily' spanLength={24} />
      </Form>
    )

    expect(screen.getByPlaceholderText('Select hour')).toBeInTheDocument()
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
    expect(screen.getByPlaceholderText('Select hour')).toBeInTheDocument()
    expect(screen.queryByText('00:00 (UTC+00)')).toBeDisabled()
    expect(screen.queryByText('09:45 (UTC+00)')).toBeDisabled()
    expect(screen.queryByText('10:00 (UTC+00)')).not.toBeDisabled()
    expect(screen.queryByText('23:45 (UTC+00)')).not.toBeDisabled()
  })


  it('renders Daily dropdown with disabled strictly after correctly', async () => {
    render(
      <Form>
        <TimeDropdown name='daily'
          spanLength={24}
          disabledDateTime={
            { disabledStrictlyAfter: 7.75 }
          }
        />
      </Form>
    )
    expect(screen.getByPlaceholderText('Select hour')).toBeInTheDocument()
    expect(screen.queryByText('08:00 (UTC+00)')).toBeDisabled()
    expect(screen.queryByText('23:45 (UTC+00)')).toBeDisabled()
    expect(screen.queryByText('00:00 (UTC+00)')).not.toBeDisabled()
    expect(screen.queryByText('07:45 (UTC+00)')).not.toBeDisabled()
  })

  it('renders Daily dropdown with disabled correctly', async () => {
    render(
      <Form>
        <TimeDropdown name='daily'
          spanLength={24}
          disabledDateTime={
            { disabledStrictlyBefore: 5.75,
              disabledStrictlyAfter: 11.25 }
          }
        />
      </Form>
    )
    expect(screen.getByPlaceholderText('Select hour')).toBeInTheDocument()
    expect(screen.queryByText('00:00 (UTC+00)')).toBeDisabled()
    expect(screen.queryByText('05:30 (UTC+00)')).toBeDisabled()
    expect(screen.queryByText('11:30 (UTC+00)')).toBeDisabled()
    expect(screen.queryByText('23:45 (UTC+00)')).toBeDisabled()

    expect(screen.queryByText('05:45 (UTC+00)')).not.toBeDisabled()
    expect(screen.queryByText('11:15 (UTC+00)')).not.toBeDisabled()
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

    expect(screen.getByPlaceholderText('Select day')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Select hour')).toBeInTheDocument()
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
    expect(screen.getByPlaceholderText('Select day')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Select hour')).toBeInTheDocument()
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
