import { recommendationUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery }         from '@acx-ui/test-utils'

import { mockedIntentCRRM } from './AIDrivenRRM/__tests__/fixtures'
import { kpis }             from './AIDrivenRRM/common'
import { api }              from './useIntentDetailsQuery'

describe('intentAI services', () => {
  describe('intent details', () => {
    it('should return correct value', async () => {
      mockGraphqlQuery(recommendationUrl, 'IntentDetails', {
        data: { intent: mockedIntentCRRM }
      })

      const { status, data, error } = await store.dispatch(
        api.endpoints.intentDetails.initiate({ id: mockedIntentCRRM.id, kpis })
      )
      expect(status).toBe('fulfilled')
      expect(error).toBeUndefined()
      expect(data).toStrictEqual(mockedIntentCRRM)
    })
  })
})
