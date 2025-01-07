import { useIsSplitOn }                                                        from '@acx-ui/feature-toggle'
import { Provider as wrapper, intentAIUrl, store, intentAIApi }                from '@acx-ui/store'
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
  root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
  tenantId: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
  sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52',
  code: 'xyz-intent-code',
  status: 'active',
  metadata: {
    dataEndTime: '2023-06-26T00:00:25.772Z'
  },
  dataCheck: {
    isDataRetained: true,
    isHotTierData: true
  }
}

const params = { root: intent.root, sliceId: intent.sliceId, code: intent.code }

describe('IntentAIForm', () => {
  beforeEach(() => {
    store.dispatch(intentAIApi.util.resetApiState())
    jest.spyOn(Date, 'now').mockReturnValue(+new Date('2023-07-15T14:15:00.000Z'))
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })
  it('handle API respond with data for IntentAIForm & IntentAIDetails', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent } })

    for (const key of ['IntentAIForm', 'IntentAIDetails'] as const) {
      const Component = components[key]
      const { unmount } = render(<Component />, { wrapper, route: { params } })
      const target = await screen.findByTestId(key)
      expect(target).toBeVisible()
      expect(await within(target).findByText(intent.code)).toBeVisible()
      unmount()
    }
  })

  it('handle API respond with data for IntentAIForm & IntentAIDetails with ff off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent } })

    for (const key of ['IntentAIForm', 'IntentAIDetails'] as const) {
      const Component = components[key]
      const { unmount } = render(<Component />, { wrapper, route: { params } })
      const target = await screen.findByTestId(key)
      expect(target).toBeVisible()
      expect(await within(target).findByText(intent.code)).toBeVisible()
      unmount()
    }
  })

  it('handle no matching code', async () => {
    const params = { root: intent.tenantId, sliceId: intent.sliceId, code: 'not-existed' }
    const { container } = render(<components.IntentAIForm />, { wrapper, route: { params } })

    expect(container).toBeEmptyDOMElement()
  })

  it('handle 404', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentDetails', { data: { intent: null } })
    const { container } = render(<components.IntentAIForm />, { wrapper, route: { params } })

    const loader = await screen.findByRole('img', { name: 'loader' })
    await waitForElementToBeRemoved(loader)

    expect(container).toBeEmptyDOMElement()
  })
})
