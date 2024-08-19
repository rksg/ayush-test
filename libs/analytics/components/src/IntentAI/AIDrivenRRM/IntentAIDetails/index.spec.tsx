import { recommendationUrl, Provider }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { transformDetailsResponse } from '../../IntentAIForm/services'
import { useIntentContext }         from '../../IntentContext'

import { mockedCRRMGraphs, mockedIntentCRRM } from './__tests__/fixtures'

import { IntentAIDetails } from '.'

jest.mock('../../IntentContext')
jest.mock('./Overview', () => ({ Overview: () => <div data-testid='Overview' /> }))
jest.mock('./CrrmValuesExtra', () =>
  ({ CrrmValuesExtra: () => <div data-testid='CrrmValuesExtra' /> }))
jest.mock('./StatusTrail', () => ({ StatusTrail: () => <div data-testid='StatusTrail' /> }))

describe('IntentAIDetails', () => {
  beforeEach(() => {
    const intent = transformDetailsResponse(mockedIntentCRRM)
    jest.mocked(useIntentContext).mockReturnValue({ intent, kpis: [] })
    mockGraphqlQuery(recommendationUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
  })
  it('renders correctly', async () => {
    const params = {
      code: mockedIntentCRRM.code,
      recommendationId: mockedIntentCRRM.id
    }
    render(<IntentAIDetails />, { route: { params }, wrapper: Provider })
    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(await screen.findByTestId('Overview')).toBeVisible()
    expect(await screen.findByTestId('CrrmValuesExtra')).toBeVisible()
    expect(await screen.findByTestId('StatusTrail')).toBeVisible()
  })
})
