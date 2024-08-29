import { Provider as wrapper, recommendationApi, recommendationUrl, store }    from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { createIntentContextProvider, useIntentContext } from './IntentContext'
import { IntentKPIConfig }                               from './useIntentDetailsQuery'

const specs: Parameters<typeof createIntentContextProvider>[1] = {
  'xyz-intent-code': {
    kpis: [{
      key: 'xx-yy-zz',
      deltaSign: '+'
    }] as IntentKPIConfig[],
    IntentAIDetails: () => {
      const { intent } = useIntentContext()
      return <div data-testid='IntentAIDetails'>
        <span>{intent.id}</span>
        <span>{intent.code}</span>
      </div>
    },
    IntentAIForm: () => {
      const { intent } = useIntentContext()
      return <div data-testid='IntentAIForm'>
        <span>{intent.id}</span>
        <span>{intent.code}</span>
      </div>
    }
  }
}

const components = {
  IntentAIForm: createIntentContextProvider('IntentAIForm', specs),
  IntentAIDetails: createIntentContextProvider('IntentAIDetails', specs)
}

const intent = {
  id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b7',
  code: 'xyz-intent-code'
}

const params = { recommendationId: intent.id, code: intent.code }

describe('IntentAIForm', () => {
  beforeEach(() => {
    store.dispatch(recommendationApi.util.resetApiState())

  })
  it('handle API respond with data for IntentAIForm & IntentAIDetails', async () => {
    mockGraphqlQuery(recommendationUrl, 'IntentDetails', { data: { intent } })

    for (const key of ['IntentAIForm', 'IntentAIDetails'] as const) {
      const Component = components[key]
      const { unmount } = render(<Component />, { wrapper, route: { params } })
      const target = await screen.findByTestId(key)
      expect(target).toBeVisible()
      expect(await within(target).findByText(intent.id)).toBeVisible()
      expect(await within(target).findByText(intent.code)).toBeVisible()
      unmount()
    }
  })

  it('handle no matching code', async () => {
    const params = { recommendationId: intent.id, code: 'not-existed' }
    const { container } = render(<components.IntentAIForm />, { wrapper, route: { params } })

    expect(container).toBeEmptyDOMElement()
  })

  it('handle 404', async () => {
    mockGraphqlQuery(recommendationUrl, 'IntentDetails', { data: { intent: null } })
    const { container } = render(<components.IntentAIForm />, { wrapper, route: { params } })

    const loader = await screen.findByRole('img', { name: 'loader' })
    await waitForElementToBeRemoved(loader)

    expect(container).toBeEmptyDOMElement()
  })
})
