import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { Provider, store }     from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { header1 }          from '../../components/Header/__tests__/fixtures'
import { networkHierarchy } from '../../components/NetworkFilter/__tests__/fixtures'

import HealthPage from '.'


describe('HealthPage', () => {
  beforeEach(() => {
    store.dispatch(dataApi.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', { data: header1.queryResult })
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: networkHierarchy } }
    })
  })

  it('can see Health', async () => {
    render(<Provider><HealthPage /></Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(screen.getByText('Health')).toBeVisible()
  })
})
