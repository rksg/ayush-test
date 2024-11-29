import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { defaultNetworkPath }                                from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }                       from '@acx-ui/store'
import { render, screen, mockGraphqlQuery, mockServer, act } from '@acx-ui/test-utils'
import type { PathFilter }                                   from '@acx-ui/utils'
import { DateRange }                                         from '@acx-ui/utils'

import { api } from './services'

import { DidYouKnow } from './index'

const filters: PathFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  path: defaultNetworkPath
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
  }
]
const sample2 = [
  {
    key: 'busiestSsidByClients',
    values: [
      0.7853403141361257
    ],
    labels: [
      'DENSITY'
    ]
  },
  {
    key: 'busiestSsidByTraffic',
    values: [
      0.7156916786073376
    ],
    labels: [
      'DENSITY'
    ]
  }
]
const availableFacts = [
  'topApplicationsByClients',
  'airtimeUtilization',
  'busiestSsidByClients',
  'busiestSsidByTraffic'
]
describe('DidYouKnowWidget', () => {

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    jest.resetAllMocks()
  })

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: { network: { hierarchyNode: { facts: sample, availableFacts } } }
    })
    render(<Provider> <DidYouKnow filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render carousel with intial facts', async () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: { network: { hierarchyNode: { facts: sample, availableFacts } } }
    })
    render(
      <Provider>
        <DidYouKnow filters={filters}/>
      </Provider>)
    const regexPattern = /Top 3 applications in terms of users last week were/
    expect((await screen.findAllByText(regexPattern))?.[0]).toBeVisible()
  })
  it('should render empty filters', async () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: { network: { hierarchyNode: { facts: [], availableFacts: [] } } }
    })
    render(
      <Provider>
        <DidYouKnow filters={null}/>
      </Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    expect((await screen.findAllByText('No data to report'))?.[0]).toBeVisible()
  })
  it('should handle change in slides', async () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: { network: { hierarchyNode: { facts: sample, availableFacts } } }
    })
    render(
      <Provider>
        <DidYouKnow filters={filters}/>
      </Provider>)
    const regexPattern = /Top 3 applications in terms of users last week were/
    expect((await screen.findAllByText(regexPattern))?.[0]).toBeVisible()
    store.dispatch(api.util.resetApiState())
    jest.resetAllMocks()
    mockServer.resetHandlers()
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: { network: { hierarchyNode: { facts: sample2, availableFacts } } }
    })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(screen.getByText('4'))
    })
    expect((await screen.findAllByText(/Busiest WLAN in terms of users last/))?.[1]).toBeVisible()
  })
  it('should handle error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'Facts', {
      error: new Error('something went wrong!')
    })
    render(<Provider><DidYouKnow filters={filters}/></Provider>)
    expect((await screen.findAllByText('No data to report'))?.[0]).toBeVisible()
  })
  it('should render empty availableFacts', async () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: { network: { hierarchyNode: { facts: [], availableFacts: [] } } }
    })
    render( <Provider> <DidYouKnow filters={filters}/> </Provider>)
    expect((await screen.findAllByText('No data to report'))?.[0]).toBeVisible()
  })
  it('should render "No data to display" when data is empty', async () => {
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: { network: { hierarchyNode: { facts: [], availableFacts } } }
    })
    render( <Provider> <DidYouKnow filters={filters}/> </Provider>)
    expect((await screen.findAllByText('No data to report'))?.[0]).toBeVisible()
  })
})
