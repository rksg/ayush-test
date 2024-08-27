import { Provider, intentAIUrl }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockedIntentCRRM } from './AIDrivenRRM/__tests__/fixtures'
import { IntentAIForm }     from './IntentAIForm'

jest.mock('./AIDrivenRRM/CCrrmChannel24gAuto', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-crrm-channel24g-auto-IntentAIForm'/>
}))
jest.mock('./AIDrivenRRM/CCrrmChannel5gAuto', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-crrm-channel5g-auto-IntentAIForm'/>
}))
jest.mock('./AIDrivenRRM/CCrrmChannel6gAuto', () => ({
  kpis: [],
  IntentAIForm: () => <div data-testid='c-crrm-channel6g-auto-IntentAIForm'/>
}))

describe('IntentAIForm', () => {
  it('should render for AIDrivenRRM', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
      data: { intent: mockedIntentCRRM }
    })
    const codes = ['c-crrm-channel24g-auto', 'c-crrm-channel5g-auto', 'c-crrm-channel6g-auto']

    for (const code of codes) {
      const { unmount } = render(<IntentAIForm />, {
        route: {
          params: {
            code,
            root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
            sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52'
          }
        },
        wrapper: Provider
      })
      expect(await screen.findByTestId(`${code}-IntentAIForm`)).toBeVisible()
      unmount()
    }
  })
})
