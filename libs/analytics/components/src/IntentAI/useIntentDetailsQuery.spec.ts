import { intentAIUrl, store }           from '@acx-ui/store'
import { mockGraphqlQuery, renderHook } from '@acx-ui/test-utils'

import { mockedIntentCRRM } from './AIDrivenRRM/__tests__/fixtures'
import { kpis }             from './AIDrivenRRM/common'
import { Statuses }         from './states'
import {
  api,
  getGraphKPIs,
  getKPIData,
  IntentDetail,
  intentState,
  useIntentParams
} from './useIntentDetailsQuery'

describe('intentAI services', () => {
  describe('intent details', () => {
    it('should return correct value', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
        data: { intent: mockedIntentCRRM }
      })

      const { status, data, error } = await store.dispatch(
        api.endpoints.intentDetails.initiate({
          root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
          sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52',
          code: mockedIntentCRRM.code,
          kpis,
          isStatusTrailTooltipEnabled: true
        })
      )
      expect(status).toBe('fulfilled')
      expect(error).toBeUndefined()
      expect(data).toStrictEqual(mockedIntentCRRM)
    })
  })
})

describe('getKPIData', () => {
  it('should return correct data', () => {
    expect(getKPIData(mockedIntentCRRM, kpis[0])).toEqual({
      compareData: { result: 2, timestamp: '2023-06-26T00:00:25.772Z' },
      data: { result: 0, timestamp: null }
    })
  })
  it('should handle null', () => {
    expect(getKPIData({
      ...mockedIntentCRRM,
      kpi_number_of_interfering_links: { data: null, compareData: null }
    }, kpis[0])).toEqual({ compareData: null, data: null })
  })
})

describe('getGraphKPIs', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(+new Date('2023-07-15T14:15:00.000Z'))
  })
  it('should return correct data', () => {
    const [ result ] = getGraphKPIs({
      ...mockedIntentCRRM,
      kpi_number_of_interfering_links: {
        data: { timestamp: null, result: 2 },
        compareData: { timestamp: null, result: 5 }
      }
    }, kpis)
    expect(result.value).toEqual('2')
    expect(result.delta).toEqual({ trend: 'positive', value: '-60%' })
    expect(result.footer).toEqual('')
  })
  it('should handle null', () => {
    const [ result ] = getGraphKPIs({
      ...mockedIntentCRRM,
      kpi_number_of_interfering_links: { data: null, compareData: null }
    }, kpis)
    expect(result.value).toEqual('--')
    expect(result.delta).toEqual(undefined)
    expect(result.footer).toEqual('')
  })
  it('handle kpi with data, without compareData', () => {
    const [ result ] = getGraphKPIs({
      ...mockedIntentCRRM,
      kpi_number_of_interfering_links: {
        data: { timestamp: null, result: 2 },
        compareData: null
      }
    }, kpis)
    expect(result.value).toEqual('2')
    expect(result.delta).toEqual(undefined)
    expect(result.footer).toEqual('')
  })
  it('handle na/paused', () => {
    const [ result ] = getGraphKPIs({
      ...mockedIntentCRRM,
      status: Statuses.paused,
      kpi_number_of_interfering_links: {
        data: { timestamp: null, result: 2 },
        compareData: { timestamp: null, result: 5 }
      }
    }, kpis)
    expect(result.value).toEqual('--')
    expect(result.delta).toBeUndefined()
    expect(result.footer).toEqual('')
  })
  it('handle beyond data retention', () => {
    jest.mocked(Date.now).mockRestore()
    const [ result ] = getGraphKPIs({
      ...mockedIntentCRRM,
      status: Statuses.active,
      kpi_number_of_interfering_links: {
        data: { timestamp: null, result: 2 },
        compareData: { timestamp: null, result: 5 }
      }
    }, kpis)
    expect(result.value).toEqual('--')
    expect(result.delta).toEqual(undefined)
    expect(result.footer).toEqual('Beyond data retention period')
  })
})

describe('useIntentParams', () => {
  it('handle RAI route', () => {
    const params = { root: 'root', sliceId: 'sliceId', code: 'code' }
    const { result } = renderHook(useIntentParams, { route: { params } })
    expect(result.current).toEqual(params)
  })
  it('handle R1 route', () => {
    const params = { tenantId: 'tenantId', sliceId: 'sliceId', code: 'code' }
    const { result } = renderHook(useIntentParams, { route: { params } })
    expect(result.current).toEqual({ root: 'tenantId', sliceId: 'sliceId', code: 'code' })
  })
})

describe('intentState', () => {
  it('returns correct state', () => {
    const expectedSets = {
      [Statuses.na]: 'no-data',
      [Statuses.paused]: 'no-data',
      [Statuses.new]: 'inactive',
      [Statuses.scheduled]: 'inactive',
      [Statuses.active]: 'active',
      [Statuses.applyScheduled]: 'active',
      [Statuses.applyScheduleInProgress]: 'active',
      [Statuses.revertScheduled]: 'active',
      [Statuses.revertScheduleInProgress]: 'active'
    }
    for (const [ status, expected ] of Object.entries(expectedSets)) {
      const intent = { status } as unknown as IntentDetail
      expect(intentState(intent)).toEqual(expected)
    }
  })
})
