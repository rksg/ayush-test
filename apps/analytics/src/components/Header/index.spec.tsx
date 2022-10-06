import { dataApiURL }                       from '@acx-ui/analytics/services'
import { Provider, store }                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { header1, header2 } from './__tests__/fixtures'
import { api }              from './services'

import Header, { Header as DumbHeader } from './index'

jest.mock('../../components/NetworkFilter', () => () => <div>network filter</div>)

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  useAnalyticsFilter: () => ({
    filters: {
      path: [{ type: 'network', name: 'Network' }],
      filter: { networkNodes: [[{ type: 'zone', name: 'Venue' }]] }
    },
    getNetworkFilter: jest
      .fn()
      .mockReturnValueOnce({ path: [{ type: 'network', name: 'Network' }] })
  })
}))
describe('Analytics dumb header', () => {
  const props = {
    title: 'title',
    replaceTitle: true,
    shouldQuerySwitch: true,
    data: {
      name: 'name',
      subTitle: [
        { key: 'apCount', value: [1] },
        { key: 'version', value: ['1', '2'] }
      ]
    }
  }
  it('should render correctly', async () => {
    render(<DumbHeader {...props}/>)
    expect(await screen.findByText('name')).toBeVisible()
    expect(await screen.findByText('APs: 1')).toBeVisible()
    expect(await screen.findByText('Firmware: 1 (2)')).toBeVisible()
    expect(await screen.findByText('network filter')).toBeVisible()
    expect(await screen.findByPlaceholderText('Start date')).toBeVisible()
    expect(await screen.findByPlaceholderText('End date')).toBeVisible()
  })
})
describe('Analytics connected header', () => {
  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      data: header1.queryResult
    })
    render(<Provider> <Header title={''} shouldQuerySwitch/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render header', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      data: header2.queryResult
    })
    render(<Provider><Header title={'Title'} shouldQuerySwitch/></Provider>)
    await screen.findByText('Venue')
    expect(screen.getByTitle('Venue')).toHaveTextContent('Type:')
  })
})
