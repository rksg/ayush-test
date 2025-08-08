import userEvent from '@testing-library/user-event'

import { StepsForm }      from '@acx-ui/components'
import { render, screen } from '@acx-ui/test-utils'

import { EdgeHaSettingsForm } from './'

jest.mock('../../useEdgeActions', () => ({
  ...jest.requireActual('../../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('EdgeHaSettingsForm', () => {

  it('should correctly render', async () => {
    render(
      <StepsForm >
        <StepsForm.StepForm>
          <EdgeHaSettingsForm />
        </StepsForm.StepForm>
      </StepsForm>
    )

    const enableFallback = screen.getByRole('switch', { name: 'RUCKUS Edge Fallback' })
    expect(enableFallback).toBeVisible()
    expect(screen.getByRole('combobox', { name: 'Load Distribution' })).toBeInTheDocument()

    await userEvent.click(enableFallback)
    const dailyRadio = await screen.findByRole('radio', { name: 'Daily' })
    const weeklyRadio = await screen.findByRole('radio', { name: 'Weekly' })
    const intervalRadio = await screen.findByRole('radio', { name: 'By Interval' })
    expect(dailyRadio).toBeVisible()
    expect(weeklyRadio).toBeVisible()
    expect(intervalRadio).toBeVisible()

    await userEvent.click(dailyRadio)
    const dailyTime = await screen.findByRole('textbox')
    expect(dailyTime.id).toBe('fallbackSettings_schedule_time')
    expect(dailyTime).toBeVisible()

    await userEvent.click(weeklyRadio)
    const weeklyWeekday = (await screen.findAllByRole('combobox'))[0]
    const weeklyTime = await screen.findByRole('textbox')
    expect(weeklyWeekday.id).toBe('fallbackSettings_schedule_weekday')
    expect(weeklyWeekday).toBeInTheDocument()
    expect(weeklyTime.id).toBe('fallbackSettings_schedule_time')
    expect(weeklyTime).toBeVisible()

    await userEvent.click(intervalRadio)
    const intervalHours = await screen.findByRole('spinbutton')
    expect(intervalHours.id).toBe('fallbackSettings_schedule_intervalHours')
    expect(intervalHours).toBeVisible()
  })
})