import userEvent from '@testing-library/user-event'

import { screen, within } from '@acx-ui/test-utils'

import { renderForm }        from '../../__tests__/fixtures'
import {
  ScheduleFrequency,
  TestTypeWithSchedule,
  TestType as TestTypeEnum
} from '../../types'

import { Schedule } from './Schedule'
import { TestType } from './TestType'

type MockSelectProps = React.PropsWithChildren<{
  onChange: (typeWithSchedule: TestTypeWithSchedule) => void
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, onChange, ...props }: MockSelectProps) => (
    <select
      onChange={(e) => onChange(e.target.value as TestTypeWithSchedule)}
      {...props}
    >
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})
jest.mock('./Schedule', () => ({ Schedule: { reset: jest.fn() } }))

describe('TestType', () => {
  it('handles change to on-demand', async () => {
    renderForm(<TestType />)

    const dropdown = await screen.findByRole('combobox')
    await userEvent.selectOptions(
      dropdown,
      within(dropdown).getByRole('option', { name: 'On-Demand' })
    )

    const fields = await screen.findAllByRole('textbox')
    expect(fields.find(field => field.id === 'type'))
      .toHaveValue(TestTypeEnum.OnDemand)
    expect(Schedule.reset)
      .toHaveBeenCalledWith(expect.anything(), TestTypeEnum.OnDemand)
  })

  it('handles change to scheduled', async () => {
    renderForm(<TestType />)

    const dropdown = await screen.findByRole('combobox')
    await userEvent.selectOptions(
      dropdown,
      within(dropdown).getByRole('option', { name: 'Weekly' })
    )

    const fields = await screen.findAllByRole('textbox')
    expect(fields.find(field => field.id === 'type'))
      .toHaveValue(TestTypeEnum.Scheduled)
    expect(Schedule.reset)
      .toHaveBeenCalledWith(expect.anything(), ScheduleFrequency.Weekly)
  })
})
