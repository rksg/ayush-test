import '@testing-library/jest-dom'
import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { NetworkPath }         from '@acx-ui/analytics/utils'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'
import { DateRange }           from '@acx-ui/utils'

import { api } from './services'

describe('IncidentTable: services', () => {
  const store = configureStore({
    reducer: {
      [dataApi.reducerPath]: dataApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataApi.middleware])
  })

  const props = {
    startDate: '2022-08-15T00:00:00+08:00',
    endDate: '2022-08-16T00:00:00+08:00',
    range: DateRange.last24Hours,
    path: [{ type: 'network', name: 'Network' }] as NetworkPath
  } as const

  const expectedResult = {
    network: {
      hierarchyNode: {
        incidents: [
          {
            severity: 0.3813119146230035,
            startTime: '2022-07-21T01:15:00.000Z',
            endTime: '2022-07-21T01:18:00.000Z',
            code: 'auth-failure',
            sliceType: 'zone',
            sliceValue: 'Venue-3-US',
            id: '268a443a-e079-4633-9491-536543066e7d',
            path: [
              {
                type: 'zone',
                name: 'Venue-3-US'
              }
            ],
            metadata: {
              dominant: {
                ssid: 'qa-eric-acx-R760-psk'
              },
              rootCauseChecks: {
                checks: [
                  {
                    CCD_REASON_NOT_AUTHED: true
                  }
                ],
                params: {}
              }
            },
            clientCount: 2,
            impactedClientCount: 2,
            isMuted: false,
            mutedBy: null,
            mutedAt: null,
            apCount: 0,
            impactedApCount: 0,
            switchCount: 0,
            vlanCount: 0,
            connectedPowerDeviceCount: 0,
            slaThreshold: null,
            currentSlaThreshold: null,
            relatedIncidents: [
              {
                severity: 0.3813119146230035,
                startTime: '2022-07-21T01:15:00.000Z',
                endTime: '2022-07-21T01:18:00.000Z',
                code: 'auth-failure',
                sliceType: 'zone',
                sliceValue: 'Venue-3-US',
                id: '268a443a-e079-4633-9491-536543066e7d',
                path: [
                  {
                    type: 'zone',
                    name: 'Venue-3-US'
                  }
                ],
                metadata: {
                  dominant: {
                    ssid: 'qa-eric-acx-R760-psk'
                  },
                  rootCauseChecks: {
                    checks: [
                      {
                        CCD_REASON_NOT_AUTHED: true
                      }
                    ],
                    params: {}
                  }
                },
                clientCount: 2,
                impactedClientCount: 2,
                isMuted: false,
                mutedBy: null,
                mutedAt: null,
                apCount: 0,
                impactedApCount: 0,
                switchCount: 0,
                vlanCount: 0,
                connectedPowerDeviceCount: 0,
                slaThreshold: null,
                currentSlaThreshold: null
              }
            ]
          }
        ]
      }
    }
  }
  

  const transformedResult = [{
    severity: 0.3813119146230035,
    startTime: '2022-07-21T01:15:00.000Z',
    endTime: '2022-07-21T01:18:00.000Z',
    code: 'auth-failure',
    sliceType: 'zone',
    sliceValue: 'Venue-3-US',
    id: '268a443a-e079-4633-9491-536543066e7d',
    path: [
      {
        type: 'zone',
        name: 'Venue-3-US'
      }
    ],
    metadata: {
      dominant: {
        ssid: 'qa-eric-acx-R760-psk'
      },
      rootCauseChecks: {
        checks: [
          {
            CCD_REASON_NOT_AUTHED: true
          }
        ],
        params: {}
      }
    },
    clientCount: 2,
    impactedClientCount: 2,
    isMuted: false,
    mutedBy: null,
    mutedAt: null,
    apCount: 0,
    impactedApCount: 0,
    switchCount: 0,
    vlanCount: 0,
    connectedPowerDeviceCount: 0,
    slaThreshold: null,
    currentSlaThreshold: null,
    relatedIncidents: [
      {
        severity: 0.3813119146230035,
        startTime: '2022-07-21T01:15:00.000Z',
        endTime: '2022-07-21T01:18:00.000Z',
        code: 'auth-failure',
        sliceType: 'zone',
        sliceValue: 'Venue-3-US',
        id: '268a443a-e079-4633-9491-536543066e7d',
        path: [
          {
            type: 'zone',
            name: 'Venue-3-US'
          }
        ],
        metadata: {
          dominant: {
            ssid: 'qa-eric-acx-R760-psk'
          },
          rootCauseChecks: {
            checks: [
              {
                CCD_REASON_NOT_AUTHED: true
              }
            ],
            params: {}
          }
        },
        clientCount: 2,
        impactedClientCount: 2,
        isMuted: false,
        mutedBy: null,
        mutedAt: null,
        apCount: 0,
        impactedApCount: 0,
        switchCount: 0,
        vlanCount: 0,
        connectedPowerDeviceCount: 0,
        slaThreshold: null,
        currentSlaThreshold: null
      }
    ],
    children: [
      {
        severity: 0.3813119146230035,
        startTime: '2022-07-21T01:15:00.000Z',
        endTime: '2022-07-21T01:18:00.000Z',
        code: 'auth-failure',
        sliceType: 'zone',
        sliceValue: 'Venue-3-US',
        id: '268a443a-e079-4633-9491-536543066e7d',
        path: [
          {
            type: 'zone',
            name: 'Venue-3-US'
          }
        ],
        metadata: {
          dominant: {
            ssid: 'qa-eric-acx-R760-psk'
          },
          rootCauseChecks: {
            checks: [
              {
                CCD_REASON_NOT_AUTHED: true
              }
            ],
            params: {}
          }
        },
        clientCount: 2,
        impactedClientCount: 2,
        isMuted: false,
        mutedBy: null,
        mutedAt: null,
        apCount: 0,
        impactedApCount: 0,
        switchCount: 0,
        vlanCount: 0,
        connectedPowerDeviceCount: 0,
        slaThreshold: null,
        currentSlaThreshold: null
      }
    ] 
  }]

  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should return empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: {
        network: {
          hierarchyNode: {
            incidents: []
          }
        }
      }
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentsList.initiate(props)
    )
    
    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual([])
  })

  it('should return populated data', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: expectedResult
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentsList.initiate(props)
    )
    
    expect(status).toBe('fulfilled')
    expect(error).toBe(undefined)
    expect(data).toStrictEqual(transformedResult)
  })

  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.incidentsList.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})