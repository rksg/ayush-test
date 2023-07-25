import '@testing-library/jest-dom'

import { AnalyticsFilter, TrendTypeEnum }   from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { api, IncidentsBySeverityData } from '../services'

import { IncidentBySeverityBarChart, getPillData } from '.'

const sample = { P1: 1, P2: 2, P3: 3, P4: 4 }

describe('IncidentBySeverityBarChart', () => {
  const filters: AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }
  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      data: { network: { hierarchyNode: { ...sample } } }
    })
    render(
      <Provider>
        <IncidentBySeverityBarChart filters={filters} />
      </Provider>
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      data: { network: { hierarchyNode: { ...sample } } }
    })
    const { asFragment } = render(
      <Provider>
        <IncidentBySeverityBarChart filters={filters} />
      </Provider>
    )
    await screen.findByText('P1')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
  it('should render error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      error: new Error('something went wrong!')
    })
    render(
      <Provider>
        <IncidentBySeverityBarChart filters={filters} />
      </Provider>
    )
    await screen.findByText('Something went wrong.')
    jest.resetAllMocks()
  })
  it('should return correct pill trend', () => {
    const data = [
      {
        curr: { P1: 1, P2: 2, P3: 3, P4: 4 },
        prev: { P1: 1, P2: 2, P3: 3, P4: 4 },
        result: { total: 10, delta: '0', trend: TrendTypeEnum.None }
      },
      {
        curr: { P1: 1, P2: 2, P3: 3, P4: 4 },
        prev: { P1: 1, P2: 1, P3: 1, P4: 1 },
        result: { total: 10, delta: '+6', trend: TrendTypeEnum.Negative }
      },
      {
        curr: { P1: 1, P2: 2, P3: 3, P4: 4 },
        prev: { P1: 10, P2: 2, P3: 3, P4: 4 },
        result: { total: 10, delta: '-9', trend: TrendTypeEnum.Positive }
      }
    ]
    data.forEach(({ curr, prev, result }) => {
      expect(getPillData(curr as IncidentsBySeverityData, prev as IncidentsBySeverityData)).toEqual(
        result
      )
    })
  })
})
