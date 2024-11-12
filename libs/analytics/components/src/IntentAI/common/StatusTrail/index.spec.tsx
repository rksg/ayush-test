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

  it('should render correctly with unknown status', async () => {
    const intent = {
      ...mockedIntentCRRM,
      statusTrail: [{
        status: 'unknown',
        createdAt: '2023-06-25T06:05:13.243Z'
      }]
    } as unknown as typeof mockedIntentCRRM
    mockIntentContext({ intent, kpis: [] })
    render(<StatusTrail />)
    expect(await screen.findAllByText('Unknown')).toHaveLength(1)
  })
})
