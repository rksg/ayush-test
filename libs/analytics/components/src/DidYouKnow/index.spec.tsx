import '@testing-library/jest-dom'

import { dataApiURL }                       from '@acx-ui/store'
import { Provider, store }                  from '@acx-ui/store'
import { render, screen, mockGraphqlQuery } from '@acx-ui/test-utils'
import type { AnalyticsFilter }             from '@acx-ui/utils'
import { DateRange }                        from '@acx-ui/utils'

import { api } from './services'

import { DidYouKnow } from './index'

const filters: AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}

const sample = [
  {
    key: 'topApplicationsByClients',
    values: [],
    labels: [
      'dns',
      'google_api',
      'google_gen'
    ]
  },
  {
    key: 'airtimeUtilization',
    values: [
      0.5162881637357261,
      0.10058939456970593,
      0.05814770489530424,
      -0.11135340978880626,
      0.0013129085638569071,
      -0.026368198420163663
    ],
    labels: []
  }]

describe('DidYouKnowWidget', () => {

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: { network: { hierarchyNode: { facts: sample } } }
    })
    render(<Provider> <DidYouKnow filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: { network: { hierarchyNode: { facts: sample } } }
    })
    const { asFragment } =render(
      <Provider>
        <DidYouKnow filters={filters}/>
      </Provider>)
    await screen.findByText('Did you know?')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('.carousel-card')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'Facts', {
      error: new Error('something went wrong!')
    })
    render(<Provider><DidYouKnow filters={filters}/></Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
  it('should render "No data to display" when data is empty', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: { network: { hierarchyNode: { facts: [] } } }
    })
    render( <Provider> <DidYouKnow filters={filters}/> </Provider>)
    expect(await screen.findByText('No data to report')).toBeVisible()
    jest.resetAllMocks()
  })
})
