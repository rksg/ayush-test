import { render, screen } from '@acx-ui/test-utils'

import { IntentDetails, transformDetailsResponse } from '../../IntentAIForm/services'
import { useIntentContext }                        from '../../IntentContext'

import { mockedIntentCRRM } from './__tests__/fixtures'
import { StatusTrail }      from './StatusTrail'

jest.mock('../../IntentContext')

describe('StatusTrail', () => {
  it('should render correctly with valid data', async () => {
    const intent = transformDetailsResponse(mockedIntentCRRM)
    jest.mocked(useIntentContext).mockReturnValue({ intent, kpis: [] })
    render(<StatusTrail />)
    expect(await screen.findAllByText('New')).toHaveLength(1)
    expect(await screen.findAllByText('Applied')).toHaveLength(14)
    expect(await screen.findAllByText('Apply In Progress')).toHaveLength(14)
    expect(await screen.findAllByText('Scheduled')).toHaveLength(15)
  })

  it('should render correctly with unknown status', async () => {
    const intent = transformDetailsResponse({
      ...mockedIntentCRRM,
      statusTrail: [
        {
          status: 'unknown',
          createdAt: '2023-06-25T06:05:13.243Z'
        }
      ]
    } as unknown as IntentDetails)
    jest.mocked(useIntentContext).mockReturnValue({ intent, kpis: [] })
    render(<StatusTrail />)
    expect(await screen.findAllByText('Unknown')).toHaveLength(1)
  })
})
