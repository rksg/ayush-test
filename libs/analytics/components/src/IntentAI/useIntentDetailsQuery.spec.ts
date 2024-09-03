import { intentAIUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery }   from '@acx-ui/test-utils'

import { mockedIntentCRRM }              from './AIDrivenRRM/__tests__/fixtures'
import { kpis }                          from './AIDrivenRRM/common'
import { api, getGraphKPIs, getKpiData } from './useIntentDetailsQuery'

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
          kpis
        })
      )
      expect(status).toBe('fulfilled')
      expect(error).toBeUndefined()
      expect(data).toStrictEqual(mockedIntentCRRM)
    })
  })
  describe('getKpiData', () => {
    it('should return correct data', () => {
      expect(getKpiData(mockedIntentCRRM, kpis[0])).toEqual({ compareData: 2, data: 0 })
    })
    it('should handle null', () => {
      expect(getKpiData({
        ...mockedIntentCRRM,
        kpi_number_of_interfering_links: { data: null, compareData: null }
      }, kpis[0])).toEqual({ compareData: null, data: null })
    })
  })
  describe('getGraphKPIs', () => {
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
    })
    it('should handle null', () => {
      const [ result ] = getGraphKPIs({
        ...mockedIntentCRRM,
        kpi_number_of_interfering_links: { data: null, compareData: null }
      }, kpis)
      expect(result.value).toEqual('--')
      expect(result.delta).toEqual(undefined)
    })
  })
})
