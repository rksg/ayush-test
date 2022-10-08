import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }      from '@acx-ui/analytics/services'
import { fakeIncident1 }   from '@acx-ui/analytics/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved,
  mockDOMWidth
} from '@acx-ui/test-utils'

import { TimeSeriesChartTypes } from './config'
import { Api }                  from './services'

import { TimeSeries } from '.'

describe('Timeseries component', () => {
  mockDOMWidth()

  const charts = [
    TimeSeriesChartTypes.FailureChart,
    TimeSeriesChartTypes.AttemptAndFailureChart
  ]
  const queryResponse = {
    network: {
      hierarchyNode: {
        failureChart: {
          time: [
            '2022-07-18T09:15:00.000Z',
            '2022-07-19T09:30:00.000Z'
          ],
          eap: [1, 1]
        },
        attemptAndFailureChart: {
          time: [
            '2022-07-20T09:15:00.000Z',
            '2022-07-20T09:30:00.000Z'
          ],
          failureCount: [1, 2],
          totalFailureCount: [1, 2],
          attemptCount: [1, 2]
        },
        relatedIncidents: [{
          id: '07965e24-84ba-48a5-8200-f310f8197f40',
          severity: 0.5,
          code: 'radius',
          startTime: '2022-07-19T12:15:00.000Z',
          endTime: '2022-07-19T13:15:00.000Z'
        }]
      }
    }
  }

  it('should render charts', async () => {
    store.dispatch(Api.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'IncidentTimeSeries', {
      data: queryResponse
    })
    const { asFragment } = render(<BrowserRouter>
      <Provider>
        <TimeSeries
          incident={fakeIncident1}
          charts={charts}
          minGranularity='PT180S'
        />
      </Provider>
    </BrowserRouter>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]')).toHaveLength(2)
  })
})
