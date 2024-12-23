import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import { defaultNetworkPath }                                from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }                       from '@acx-ui/store'
import { render, screen, mockGraphqlQuery, waitFor, within } from '@acx-ui/test-utils'
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
    mockGraphqlQuery(dataApiURL, 'AvailableFacts', {
      data: { network: { hierarchyNode: { availableFacts } } }
    })
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: { network: { hierarchyNode: { facts: sample } } }
    })
    render(<DidYouKnow filters={filters}/>, { wrapper: Provider })
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render carousel with intial facts', async () => {
    mockGraphqlQuery(dataApiURL, 'AvailableFacts', {
      data: { network: { hierarchyNode: { availableFacts: availableFacts.slice(0, 2) } } }
    })
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: { network: { hierarchyNode: { facts: sample } } }
    })
    render(<DidYouKnow filters={filters}/>, { wrapper: Provider })
    const regexPattern = /Top 3 applications in terms of users last week were/
    expect((await screen.findAllByText(regexPattern))?.[0]).toBeVisible()
  })
  it('should handle change in slides', async () => {
    let set: number = 0
    mockGraphqlQuery(dataApiURL, 'AvailableFacts', {
      data: { network: { hierarchyNode: { availableFacts } } }
    })
    mockGraphqlQuery(dataApiURL, 'Facts', (req, res, ctx) => {
      set = _.isEqual(req.body?.variables!.requestedList, availableFacts.slice(0, 2)) ? 1 : 2
      const facts = set === 1 ? sample : sample2
      return res(ctx.data({ network: { hierarchyNode: { facts } } }))
    })

    const { container } = render(<DidYouKnow filters={filters}/>, { wrapper: Provider })
    const checkSet = async () => waitFor(async () => {
      if (!set) throw new Error('set is undefined')
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const slice = container.querySelector('.slick-slide.slick-active.slick-current')
      if (!slice) throw new Error('slide not rendered')
      const pattern = set === 1
        ? /Top 3 applications in terms of users last week were/
        : /Busiest WLAN in terms of users last/
      expect(await within(slice as HTMLElement).findByText(pattern)).toBeVisible()
      set = 0
    })

    await checkSet()
    await userEvent.click(await screen.findByRole('button', { name: '2' }), { delay: 500 })
    await checkSet()
  })
  it('should render empty availableFacts', async () => {
    mockGraphqlQuery(dataApiURL, 'AvailableFacts', {
      data: { network: { hierarchyNode: { availableFacts: [] } } }
    })
    render(<DidYouKnow filters={filters}/>, { wrapper: Provider })
    expect((await screen.findAllByText('No data to report'))?.[0]).toBeVisible()
  })
  it('should render "No data to display" when data is empty', async () => {
    mockGraphqlQuery(dataApiURL, 'AvailableFacts', {
      data: { network: { hierarchyNode: { availableFacts } } }
    })
    mockGraphqlQuery(dataApiURL, 'Facts', {
      data: { network: { hierarchyNode: { facts: [], availableFacts } } }
    })
    render(<DidYouKnow filters={filters}/>, { wrapper: Provider })
    expect((await screen.findAllByText('No data to report'))?.[0]).toBeVisible()
  })
})
