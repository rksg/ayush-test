import { BrowserRouter } from 'react-router-dom'

import { dataApiURL }                                                  from '@acx-ui/analytics/services'
import { fakeIncident1 }                                               from '@acx-ui/analytics/utils'
import { Provider, store }                                             from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { Api } from './services'

import { TimeSeries } from '.'

describe('Timeseries component', () => {
  const charts = [
    'incidentCharts',
    'relatedIncidents',
    'clientCountCharts',
    'attemptAndFailureCharts'
  ]
  const props = {
    incident: fakeIncident1,
    charts: charts
  }
  const expectedResult = {
    network: {
      hierarchyNode: {
        incidentChart: {
          time: [
            '2022-07-18T09:15:00.000Z',
            '2022-07-19T09:30:00.000Z'
          ],
          radius: [1, 1]
        },
        relatedIncidents: [{
          id: '07965e24-84ba-48a5-8200-f310f8197f40',
          severity: 0.5,
          code: 'radius',
          startTime: '2022-07-19T12:15:00.000Z',
          endTime: '2022-07-19T13:15:00.000Z'
        }],
        clientCountCharts: {
          time: [
            '2022-07-19T09:15:00.000Z',
            '2022-07-19T09:30:00.000Z',
            '2022-07-19T09:45:00.000Z',
            '2022-07-19T10:00:00.000Z',
            '2022-07-19T10:15:00.000Z'
          ],
          newClientCount: [1, 2, 3, 4, 5],
          impactedClientCount: [6, 7, 8, 9, 10],
          connectedClientCount: [11, 12, 13, 14, 15]
        },
        attemptAndFailureCharts: {
          time: [
            '2022-07-20T09:15:00.000Z',
            '2022-07-20T09:30:00.000Z'
          ],
          failureCount: [1, 2],
          totalFailureCount: [1, 2],
          attemptCount: [1, 2]
        }
      }
    }
  }

  it('should match snapshot', async () => {
    store.dispatch(Api.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: expectedResult
    })
    render(<BrowserRouter>
      <Provider>
        <TimeSeries {...props} />
      </Provider>
    </BrowserRouter>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getByText(/eap failures/i).textContent).toEqual('EAP Failures')
    expect(screen.getByText(/clients/i).textContent).toEqual('Clients')
  })
})
