import userEvent from '@testing-library/user-event'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { render, screen } from '@acx-ui/test-utils'

import { mockIntentContext } from '../../__tests__/fixtures'
import { mockedIntentCRRM }  from '../../AIDrivenRRM/__tests__/fixtures'

import { StatusTrail } from '.'

jest.mock('../../IntentContext')

describe('StatusTrail', () => {
  it('should render correctly with valid data', async () => {
    const intent = mockedIntentCRRM
    mockIntentContext({ intent, kpis: [] })
    render(<StatusTrail />)
    expect(await screen.findAllByText('New')).toHaveLength(1)
    expect(await screen.findAllByText('Active')).toHaveLength(14)
    expect(await screen.findAllByText('Apply In Progress')).toHaveLength(14)
    expect(await screen.findAllByText('Scheduled')).toHaveLength(15)
  })

  it('should show hover content correctly for new status', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const intent = mockedIntentCRRM
    mockIntentContext({ intent, kpis: [] })
    render(<StatusTrail />)
    const newStatusTrail = await screen.findByText('New')
    await userEvent.hover(newStatusTrail)
    expect(await screen.findByRole('tooltip', { hidden: true }))
      // eslint-disable-next-line max-len
      .toHaveTextContent('IntentAI has analyzed the data and generated a change recommendations, awaiting your approval. To review the details, specify Intent priority, and apply the recommendations, click "Optimize." Alternatively, use "1-Click Optimize" to instantly apply the changes with default priority.')
  })

  it('should show hover content correctly for scheduled status', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const intent = mockedIntentCRRM
    mockIntentContext({ intent, kpis: [] })
    render(<StatusTrail />)
    const scheduleStatusTrail = await screen.findAllByText('Scheduled')
    await userEvent.hover(scheduleStatusTrail[0])
    expect(await screen.findByRole('tooltip', { hidden: true }))
      // eslint-disable-next-line max-len
      .toHaveTextContent('The change recommendation has been automatically scheduled for 06/27/2023 06:00, by IntentAI.')
  })

  it('should show hover content correctly for active status', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const intent = mockedIntentCRRM
    mockIntentContext({ intent, kpis: [] })
    render(<StatusTrail />)
    const activeStatusTrail = await screen.findAllByText('Active')
    await userEvent.hover(activeStatusTrail[0])
    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('IntentAI is active on Venue 21_US_Beta_Samsung.')
  })

  it('should show hover content correctly for apply in progress status', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const intent = mockedIntentCRRM
    mockIntentContext({ intent, kpis: [] })
    render(<StatusTrail />)
    const applyInProgressStatusTrail = await screen.findAllByText('Apply In Progress')
    await userEvent.hover(applyInProgressStatusTrail[0])
    expect(await screen.findByRole('tooltip', { hidden: true }))
      // eslint-disable-next-line max-len
      .toHaveTextContent('IntentAI recommended changes are getting applied to Venue 21_US_Beta_Samsung.')
  })
})
