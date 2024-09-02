import { intentAIUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery }   from '@acx-ui/test-utils'

import { mockedIntentCRRM } from './AIDrivenRRM/__tests__/fixtures'
import { kpis }             from './AIDrivenRRM/common'
import { api }              from './useIntentDetailsQuery'

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
})
