import { dataApiURL }                                                  from '@acx-ui/analytics/services'
import { Incident }                                                    from '@acx-ui/analytics/utils'
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
  const incident = {
    apCount: -1,
    isMuted: false,
    mutedBy: null,
    slaThreshold: null,
    clientCount: 27,
    path: [
      {
        type: 'system',
        name: 'Edu2-vSZ-52'
      },
      {
        type: 'zone',
        name: 'Edu2-611-Mesh'
      },
      {
        type: 'apGroup',
        name: '255_Edu2-611-group'
      },
      {
        type: 'ap',
        name: '70:CA:97:01:A0:C0'
      }
    ],
    endTime: '2022-07-22T02:42:00.000Z',
    vlanCount: -1,
    sliceType: 'ap',
    code: 'eap-failure',
    startTime: '2022-07-17T05:15:00.000Z',
    metadata: {
      dominant: {},
      rootCauseChecks: {
        checks: [
          {
            AP_MODEL: false,
            FW_VERSION: true,
            CLIENT_OS_MFG: false,
            CCD_REASON_DISASSOC_STA_HAS_LEFT: true
          }
        ],
        params: {
          FW_VERSION: '6.1.1.0.917'
        }
      }
    },
    id: 'df5339ba-da3b-4110-a291-7f8993a274f3',
    impactedApCount: -1,
    switchCount: -1,
    currentSlaThreshold: null,
    severity: 0.674055825227442,
    connectedPowerDeviceCount: -1,
    mutedAt: null,
    impactedClientCount: 5,
    sliceValue: 'RuckusAP'
  } as Incident
  const props ={
    incident: incident,
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
        relatedIncidents: {
          id: '07965e24-84ba-48a5-8200-f310f8197f40',
          severity: 0.5,
          code: 'radius',
          startTime: '2022-07-19T12:15:00.000Z',
          endTime: '2022-07-19T13:15:00.000Z'
        },
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
    const { asFragment } = render(
      <Provider>
        <TimeSeries {...props} />
      </Provider>
    )
    
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(asFragment()).toMatchSnapshot()
  })
})
