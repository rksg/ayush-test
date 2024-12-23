import { intentAIUrl, Provider as wrapper } from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedIntentCRRM, mockedIntentCRRMStatusTrail } from '../../AIDrivenRRM/__tests__/fixtures'

import { StatusTrail } from '.'

jest.mock('../../IntentContext')

describe('StatusTrail', () => {
  it('should render correctly with valid data', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentStatusTrail',
      { data: { intent: mockedIntentCRRMStatusTrail } })

    const intent = mockedIntentCRRM
    const params = { root: intent.root, sliceId: intent.sliceId, code: intent.code }
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
    const intent = {
      ...mockedIntentCRRM,
      statusTrail
    } as unknown as typeof mockedIntentCRRM
    mockGraphqlQuery(intentAIUrl, 'IntentStatusTrail', { data: { intent: { statusTrail } } })

    const params = { root: intent.root, sliceId: intent.sliceId, code: intent.code }
    render(<StatusTrail />, { wrapper, route: { params } })
    expect(await screen.findAllByText('Unknown')).toHaveLength(1)
  })
})
