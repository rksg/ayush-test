import { useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { Provider, intentAIUrl }                 from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import { mockIntentContext }                                                                    from '../../__tests__/fixtures'
import { mockedCRRMGraphs, mockedCRRMGraphsApplied, mockedIntentCRRM, mockedIntentCRRMApplied } from '../__tests__/fixtures'

import { useIntentAICRRMQuery } from './services'

jest.mock('../../IntentContext')

describe('useIntentAICRRMQuery', () => {
  afterEach(() => jest.resetAllMocks())
  it('should return correct data', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockIntentContext({ intent: mockedIntentCRRMApplied, isHotTierData: true })
    mockGraphqlQuery(intentAIUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
    const params = {
      root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
      sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52',
      code: mockedIntentCRRM.code
    }
    const { result } = renderHook(useIntentAICRRMQuery, { route: { params }, wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchSnapshot()
    expect(result.current.csv).toMatchSnapshot()
  })
  it('should return correct data for applied status', async () => {
    mockIntentContext({ intent: mockedIntentCRRMApplied, isHotTierData: true })
    mockGraphqlQuery(intentAIUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphsApplied }
    })
    const params = {
      root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
      sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52',
      code: mockedIntentCRRMApplied.code
    }
    const { result } = renderHook(useIntentAICRRMQuery, { route: { params }, wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchSnapshot()
    expect(result.current.csv).toMatchSnapshot()
  })
  it('should return correct when isHotTierData is false', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const coldTierDataMock = {
      ...mockedIntentCRRM,
      dataCheck: {
        isHotTierData: false,
        isDataRetained: true
      }
    }
    mockIntentContext({ intent: coldTierDataMock })
    mockGraphqlQuery(intentAIUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphsApplied }
    })
    const params = {
      root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
      sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52',
      code: mockedIntentCRRMApplied.code
    }
    const { result } = renderHook(useIntentAICRRMQuery, { route: { params }, wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(false))
    expect(result.current.data).toMatchSnapshot()
    expect(result.current.csv).toMatchSnapshot()
  })
})
