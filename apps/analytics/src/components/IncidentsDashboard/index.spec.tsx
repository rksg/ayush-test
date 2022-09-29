import '@testing-library/jest-dom'
import { dataApiURL }      from '@acx-ui/analytics/services'
import { IncidentFilter }  from '@acx-ui/analytics/utils'
import { Provider, store } from '@acx-ui/store'
import {
  cleanup,
  mockDOMWidth,
  mockGraphqlQuery,
  render,
  screen
} from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import { expectedIncidentDashboardData } from './__tests__/fixtures'
import { api }                           from './services'

import IncidentsDashboardWidget from './index'

const filters : IncidentFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours,
  filter: {}
}

describe('IncidentDashboard', () => {
  mockDOMWidth()

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  afterEach(() => cleanup())

  it('renders incident and category data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsDashboardWidget', {
      data: { network: { hierarchyNode: expectedIncidentDashboardData } }
    })
    const { asFragment } = render(<Provider>
      <IncidentsDashboardWidget filters={filters} />
    </Provider>)
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
    await screen.findByText('2 clients impacted')
    const fragment = asFragment()
    // eslint-disable-next-line testing-library/no-node-access
    fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')
    expect(fragment).toMatchSnapshot()
  })
})