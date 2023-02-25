import userEvent from '@testing-library/user-event'

import { screen } from '@acx-ui/test-utils'

import { renderForm }        from '../../__tests__/fixtures'
import { ScheduleFrequency } from '../../types'

import { TestType } from './TestType'

describe('TestType', () => {
  it('handles change to on-demand', async () => {
    renderForm(<TestType />, {
      initialValues: {
        schedule: {
          type: 'service_guard',
          timezone: 'America/New_York',
          frequency: ScheduleFrequency.Weekly,
          day: 1,
          hour: 2
        }
      }
    })

    await userEvent.click(screen.getByRole('combobox', { name: 'Test Type' }))
    await userEvent.click(await screen.findByText('On-Demand'))

    const fields = await screen.findAllByRole('textbox')
    expect(fields.find(field => field.id === 'schedule_frequency'))
      .toHaveValue('')
    expect(fields.find(field => field.id === 'schedule_day'))
      .toHaveValue('')
    expect(fields.find(field => field.id === 'schedule_hour'))
      .toHaveValue('')
  })

  it('handles change to scheduled', async () => {
    renderForm(<TestType />, {
      initialValues: {
        schedule: {
          type: 'service_guard',
          timezone: 'America/New_York',
          frequency: ScheduleFrequency.Weekly,
          day: 1,
          hour: 2
        }
      }
    })

    await userEvent.click(screen.getByRole('combobox', { name: 'Test Type' }))
    await userEvent.click(await screen.findByText('Monthly'))

    const fields = await screen.findAllByRole('textbox')
    expect(fields.find(field => field.id === 'schedule_frequency'))
      .toHaveValue(ScheduleFrequency.Monthly)
    expect(fields.find(field => field.id === 'schedule_day'))
      .toHaveValue('')
    expect(fields.find(field => field.id === 'schedule_hour'))
      .toHaveValue('2')
  })
})
