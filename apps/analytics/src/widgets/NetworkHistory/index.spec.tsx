import { render, screen } from '@testing-library/react'

import { dataApiURL }                      from '@acx-ui/analytics/services'
import { Provider, store }                 from '@acx-ui/store'
import { mockGraphqlQuery, mockAutoSizer } from '@acx-ui/test-utils'

import { api, NetworkHistoryData } from './services'

import NetworkHistoryWidget, { getSeriesData } from './index'

const sample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ],
  newClientCount: [1, 2, 3, 4, 5],
  impactedClientCount: [6, 7, 8, 9, 10],
  connectedClientCount: [11, 12, 13, 14, 15]
}

describe('NetworkHistoryWidget', () => {
  mockAutoSizer()

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHistoryWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    render( <Provider> <NetworkHistoryWidget/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkHistoryWidget', {
      data: { network: { hierarchyNode: { timeSeries: sample } } }
    })
    const { asFragment } =render( <Provider> <NetworkHistoryWidget/></Provider>)
    await screen.findByText('Network History')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'NetworkHistoryWidget', {
      error: new Error('something went wrong!')
    })
    render( <Provider> <NetworkHistoryWidget/> </Provider>)
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
})

describe('getSeriesData', ()=>{
  it('should return correct format', ()=>{
    expect(getSeriesData(sample as NetworkHistoryData))
      .toEqual([
        {
          name: 'New Clients',
          data: sample.time.map((t,index)=>[t, 1+index])
        },
        {
          name: 'Impacted Clients',
          data: sample.time.map((t,index)=>[t, 6+index])
        },
        {
          name: 'Connected Clients',
          data: sample.time.map((t,index)=>[t, 11+index])
        }
      ])
  })
  it('should return empty array if no data', ()=>{
    expect(getSeriesData(null))
      .toEqual([])
  })
})
