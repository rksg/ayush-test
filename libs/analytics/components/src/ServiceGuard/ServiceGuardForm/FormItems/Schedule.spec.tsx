import { screen, within } from '@acx-ui/test-utils'

import { renderForm, renderFormHook }  from '../../__tests__/fixtures'
import { TestType, ScheduleFrequency } from '../../types'

import { Schedule } from './Schedule'

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showSearch, // remove and left unassigned to prevent warning
    ...props
  }: React.PropsWithChildren<{ showSearch: boolean, onChange?: (value: string) => void }>) => {
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

describe('Schedule', () => {
  it('does not render anything if type is on-demand', async () => {
    renderForm(<Schedule />, {
      initialValues: { typeWithSchedule: TestType.OnDemand }
    })

    expect(screen.queryByRole('option')).toBeNull()
  })

  it('renders hidden fields', async () => {
    renderForm(<Schedule />, {
      initialValues: {
        typeWithSchedule: ScheduleFrequency.Daily,
        schedule: {
          type: 'service_guard',
          timezone: 'America/New_York',
          frequency: ScheduleFrequency.Daily,
          day: null,
          hour: null
        }
      }
    })

    const fields = await screen.findAllByRole('textbox')
    expect(fields.find(field => field.id === 'schedule_type'))
      .toHaveValue('service_guard')
    expect(fields.find(field => field.id === 'schedule_timezone'))
      .toHaveValue('America/New_York')
    expect(fields.find(field => field.id === 'schedule_frequency'))
      .toHaveValue('daily')
  })

  it('renders time selection for daily', async () => {
    renderForm(<Schedule />, {
      initialValues: { typeWithSchedule: ScheduleFrequency.Daily }
    })

    const timeSelection = screen.getByRole('combobox')
    const timeOptions = within(timeSelection).getAllByRole('option', {
      name: (_, el) => (el as HTMLInputElement).value !== ''
    })
    expect(timeOptions).toHaveLength(96)
    expect(timeOptions[0].textContent).toEqual('00:00 (UTC+00)')
    expect(timeOptions[timeOptions.length - 1].textContent).toEqual('23:45 (UTC+00)')
  })

  it('renders day and time selection for weekly', async () => {
    renderForm(<Schedule />, {
      initialValues: { typeWithSchedule: ScheduleFrequency.Weekly }
    })

    const comboboxes = screen.getAllByRole('combobox')

    const daySelection = comboboxes[0]
    const dayOptions = within(daySelection).getAllByRole('option', {
      name: (_, el) => (el as HTMLInputElement).value !== ''
    })
    expect(dayOptions).toHaveLength(7)
    expect(dayOptions[0].textContent).toEqual('Monday')
    expect(dayOptions[dayOptions.length - 1].textContent).toEqual('Sunday')

    const timeSelection = comboboxes[1]
    const timeOptions = within(timeSelection).getAllByRole('option', {
      name: (_, el) => (el as HTMLInputElement).value !== ''
    })
    expect(timeOptions).toHaveLength(96)
  })

  it('renders day and time selection for monthly', async () => {
    renderForm(<Schedule />, {
      initialValues: { typeWithSchedule: ScheduleFrequency.Monthly }
    })

    const comboboxes = screen.getAllByRole('combobox')

    const daySelection = comboboxes[0]
    const dayOptions = within(daySelection).getAllByRole('option', {
      name: (_, el) => (el as HTMLInputElement).value !== ''
    })
    expect(dayOptions).toHaveLength(31)
    expect(dayOptions[0].textContent).toEqual('1st')
    expect(dayOptions[dayOptions.length - 1].textContent).toEqual('31st')

    const timeSelection = comboboxes[1]
    const timeOptions = within(timeSelection).getAllByRole('option', {
      name: (_, el) => (el as HTMLInputElement).value !== ''
    })
    expect(timeOptions).toHaveLength(96)
  })

  describe('reset', () => {
    const name = Schedule.fieldName

    it('resets all fields', () => {
      const { form } = renderFormHook()
      form.setFieldValue([name, 'frequency'], ScheduleFrequency.Monthly)
      form.setFieldValue([name, 'day'], 7)
      form.setFieldValue([name, 'hour'], 11)
      Schedule.reset(form, TestType.OnDemand)
      expect(form.getFieldValue([name, 'frequency'])).toEqual(null)
      expect(form.getFieldValue([name, 'day'])).toEqual(null)
      expect(form.getFieldValue([name, 'hour'])).toEqual(null)
    })

    it('set frequency and resets day', () => {
      const { form } = renderFormHook()
      form.setFieldValue([name, 'frequency'], ScheduleFrequency.Monthly)
      form.setFieldValue([name, 'day'], 7)
      form.setFieldValue([name, 'hour'], 11)
      Schedule.reset(form, ScheduleFrequency.Weekly)
      expect(form.getFieldValue([name, 'frequency'])).toEqual(ScheduleFrequency.Weekly)
      expect(form.getFieldValue([name, 'day'])).toEqual(null)
      expect(form.getFieldValue([name, 'hour'])).toEqual(11)
    })
  })
})

describe('Schedule.FieldSummary', () => {
  it('does not render anything if type is on-demand', async () => {
    renderForm(<Schedule.FieldSummary />, {
      initialValues: { typeWithSchedule: TestType.OnDemand }
    })

    expect(screen.queryByText('Schedule')).toBeNull()
  })

  it('renders time for daily', async () => {
    renderForm(<Schedule.FieldSummary />, {
      initialValues: {
        typeWithSchedule: ScheduleFrequency.Daily,
        schedule: {
          type: 'service_guard',
          timezone: 'America/New_York',
          frequency: ScheduleFrequency.Daily,
          day: null,
          hour: 10
        }
      }
    })

    expect(screen.queryByText('10:00 (UTC+00)')).toBeVisible()
  })

  it('renders day and time for weekly', async () => {
    renderForm(<Schedule.FieldSummary />, {
      initialValues: {
        typeWithSchedule: ScheduleFrequency.Weekly,
        schedule: {
          type: 'service_guard',
          timezone: 'America/New_York',
          frequency: ScheduleFrequency.Weekly,
          day: 3,
          hour: 23.25
        }
      }
    })

    expect(screen.queryByText('Wednesday at 23:15 (UTC+00)')).toBeVisible()
  })

  it('renders day and time for monthly', async () => {
    renderForm(<Schedule.FieldSummary />, {
      initialValues: {
        typeWithSchedule: ScheduleFrequency.Monthly,
        schedule: {
          type: 'service_guard',
          timezone: 'America/New_York',
          frequency: ScheduleFrequency.Monthly,
          day: 8,
          hour: 15.75
        }
      }
    })

    expect(screen.queryByText('8th at 15:45 (UTC+00)')).toBeVisible()
  })
})
