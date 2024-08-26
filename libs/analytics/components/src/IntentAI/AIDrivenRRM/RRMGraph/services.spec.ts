import { Provider, recommendationUrl }           from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import { mockedCRRMGraphs, mockedCRRMGraphsApplied, mockedIntentCRRM, mockedIntentCRRMApplied } from '../__tests__/fixtures'

import { useIntentAICRRMQuery } from './services'

describe('useIntentAICRRMQuery', () => {
  afterEach(() => jest.resetAllMocks())
  it('should return correct data', async () => {
    mockGraphqlQuery(recommendationUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
    const params = {
      recommendationId: mockedIntentCRRM.id,
      code: mockedIntentCRRM.code
    }
    const { result } = renderHook(useIntentAICRRMQuery, { route: { params }, wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchSnapshot()
    expect(result.current.csv).toMatchSnapshot()
  })
  it('should return correct data for applied status', async () => {
    mockGraphqlQuery(recommendationUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphsApplied }
    })
    const params = {
      recommendationId: mockedIntentCRRMApplied.id,
      code: mockedIntentCRRMApplied.code
    }
    const { result } = renderHook(useIntentAICRRMQuery, { route: { params }, wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchSnapshot()
    expect(result.current.csv).toMatchSnapshot()
  })
})
