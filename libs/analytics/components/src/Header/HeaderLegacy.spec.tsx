import { BrowserRouter } from 'react-router-dom'

import { defaultNetworkPath }               from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { header1, header4 } from './__tests__/fixtures'
import { api }              from './services'

import { HeaderLegacy } from '.'

jest.mock('../NetworkFilter', () => ({
  NetworkFilter: () => <div>network filter</div>
}))
jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  useAnalyticsFilter: () => ({
    filters: {
      filter: { networkNodes: [[{ type: 'zone', name: 'v1' }]] }
    }
  })
}))
describe('Analytics legacy header', () => {
  beforeEach(() => store.dispatch(api.util.resetApiState()))
  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: {
        children: [{
          id: 'v1',
          type: 'zone',
          name: 'Venue 1',
          path: [...defaultNetworkPath, { type: 'zone', name: 'venue' }],
          aps: [{ name: 'ap', mac: 'ap-mac' }],
          switches: []
        }, {
          id: 'id2',
          type: 'switchGroup',
          name: 'Venue 2',
          path: [...defaultNetworkPath, { type: 'switchGroup', name: 'venue' }],
          aps: [],
          switches: [{ name: 'switch', mac: 'switch-mac' }]
        }
        ],
        name: 'Network',
        type: 'network',
        path: defaultNetworkPath
      } } }
    })
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      data: header1.queryResult
    })
    render(<BrowserRouter><Provider>
      <HeaderLegacy title={''} shouldQuerySwitch/>
    </Provider></BrowserRouter>)
    expect(screen.getAllByRole('img', { name: 'loader' })).toHaveLength(2)
  })
  it('renders venue name', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: {
        children: [{
          id: 'v1',
          type: 'zone',
          name: 'Venue 1',
          path: [...defaultNetworkPath, { type: 'zone', name: 'venue' }],
          aps: [{ name: 'ap', mac: 'ap-mac' }],
          switches: []
        }, {
          id: 'id2',
          type: 'switchGroup',
          name: 'Venue 2',
          path: [...defaultNetworkPath, { type: 'switchGroup', name: 'venue' }],
          aps: [],
          switches: [{ name: 'switch', mac: 'switch-mac' }]
        }
        ],
        name: 'Network',
        type: 'network',
        path: defaultNetworkPath
      } } }
    })
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      data: {
        network: {
          node: {
            apCount: 50
          }
        }
      }
    })
    render(<BrowserRouter><Provider>
      <HeaderLegacy title={'Title'} shouldQuerySwitch/>
    </Provider></BrowserRouter>)
    expect(await screen.findByText('Venue 1')).toBeVisible()
  })
  it('should render header', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHierarchy', {
      data: { network: { hierarchyNode: {
        children: [{
          id: 'v1',
          type: 'zone',
          name: 'Venue 1',
          path: [...defaultNetworkPath, { type: 'zone', name: 'venue' }],
          aps: [{ name: 'ap', mac: 'ap-mac' }],
          switches: []
        }, {
          id: 'id2',
          type: 'switchGroup',
          name: 'Venue 2',
          path: [...defaultNetworkPath, { type: 'switchGroup', name: 'venue' }],
          aps: [],
          switches: [{ name: 'switch', mac: 'switch-mac' }]
        }
        ],
        name: 'Network',
        type: 'network',
        path: defaultNetworkPath
      } } }
    })
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      data: header4.queryResult
    })
    render(<BrowserRouter><Provider>
      <HeaderLegacy title={'Title'} shouldQuerySwitch/>
    </Provider></BrowserRouter>)
    expect(await screen.findByTitle('Venue')).toHaveTextContent('Type:')
    expect(await screen.findByText('Clients: 100')).toBeVisible()
    expect(await screen.findByText('IP Address: ip2 (3)')).toBeVisible()
    expect(await screen.findByText('network filter')).toBeVisible()
    expect(await screen.findByPlaceholderText('Start date')).toBeVisible()
  })
})
