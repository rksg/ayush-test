import userEvent from '@testing-library/user-event'

import { useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { intentAIApi, intentAIUrl, Provider as wrapper, store } from '@acx-ui/store'
import { mockGraphqlQuery, render, screen }                     from '@acx-ui/test-utils'

import { mockIntentContext }                             from '../../__tests__/fixtures'
import { mockedIntentCRRM, mockedIntentCRRMStatusTrail } from '../../AIDrivenRRM/__tests__/fixtures'

import { StatusTrail } from '.'

jest.mock('../../IntentContext')

describe('StatusTrail', () => {
  const intent = mockedIntentCRRM
  const params = { root: intent.root, sliceId: intent.sliceId, code: intent.code }
  beforeEach(() => {
    store.dispatch(intentAIApi.util.resetApiState())
    mockIntentContext({ intent, kpis: [] })
    const { statusTrail } = mockedIntentCRRMStatusTrail
    mockGraphqlQuery(intentAIUrl, 'IntentStatusTrail', { data: { intent: { statusTrail } } })
  })

  it('should render correctly with valid data', async () => {
    render(<StatusTrail />, { wrapper, route: { params } })
    expect(await screen.findAllByText('New')).toHaveLength(1)
    expect(await screen.findAllByText('Active')).toHaveLength(14)
    expect(await screen.findAllByText('Apply In Progress')).toHaveLength(14)
    expect(await screen.findAllByText('Scheduled')).toHaveLength(15)
  })

  it('should render correctly with unknown status', async () => {
    const statusTrail = [{
      status: 'unknown',
      createdAt: '2023-06-25T06:05:13.243Z'
    }]
    mockGraphqlQuery(intentAIUrl, 'IntentStatusTrail', { data: { intent: { statusTrail } } })

    render(<StatusTrail />, { wrapper, route: { params } })
    expect(await screen.findAllByText('Unknown')).toHaveLength(1)
  })

  it('should show hover content correctly for new status', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<StatusTrail />, { wrapper, route: { params } })
    const newStatusTrail = await screen.findByText('New')
    await userEvent.hover(newStatusTrail)
    expect(await screen.findByRole('tooltip', { hidden: true }))
      // eslint-disable-next-line max-len
      .toHaveTextContent('IntentAI has analyzed the data and generated a change recommendations, awaiting your approval. To review the details, specify Intent priority, and apply the recommendations, click "Optimize." Alternatively, use "1-Click Optimize" to instantly apply the changes with default priority.')
  })

  it('should show hover content correctly for scheduled status', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<StatusTrail />, { wrapper, route: { params } })
    const scheduleStatusTrail = await screen.findAllByText('Scheduled')
    await userEvent.hover(scheduleStatusTrail[0])
    expect(await screen.findByRole('tooltip', { hidden: true }))
      // eslint-disable-next-line max-len
      .toHaveTextContent('The change recommendation has been automatically scheduled for 06/27/2023 06:00, by IntentAI.')
  })

  it('should show hover content correctly for active status', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<StatusTrail />, { wrapper, route: { params } })
    const activeStatusTrail = await screen.findAllByText('Active')
    await userEvent.hover(activeStatusTrail[0])
    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('IntentAI is active on Venue 21_US_Beta_Samsung.')
  })

  it('should show hover content correctly for apply in progress status', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<StatusTrail />, { wrapper, route: { params } })
    const applyInProgressStatusTrail = await screen.findAllByText('Apply In Progress')
    await userEvent.hover(applyInProgressStatusTrail[0])
    expect(await screen.findByRole('tooltip', { hidden: true }))
      // eslint-disable-next-line max-len
      .toHaveTextContent('IntentAI recommended changes are getting applied to Venue 21_US_Beta_Samsung.')
  })
})
