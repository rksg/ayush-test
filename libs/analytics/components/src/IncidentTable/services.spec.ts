import '@testing-library/jest-dom'
import { gql } from 'graphql-request'

import {
  fakeIncident,
  IncidentCode,
  transformIncidentQueryResult
} from '@acx-ui/analytics/utils'
import { dataApiURL, store }    from '@acx-ui/store'
import { mockGraphqlQuery }     from '@acx-ui/test-utils'
import type { AnalyticsFilter } from '@acx-ui/utils'
import {
  DateRange,
  NodeType,
  NetworkPath
} from '@acx-ui/utils'

import { api, createToggleMuteMutation, transformData } from './services'

describe('IncidentTable: services', () => {
  const props: AnalyticsFilter = {
    startDate: '2022-08-15T00:00:00+08:00',
    endDate: '2022-08-16T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }

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

  const incidentValues = {
    severity: 0.3813119146230035,
    startTime: '2022-07-21T01:15:00.000Z',
    endTime: '2022-07-21T01:18:00.000Z',
    code: 'auth-failure' as IncidentCode,
    sliceType: 'zone' as NodeType,
    sliceValue: 'Venue-3-US',
    id: '268a443a-e079-4633-9491-536543066e7d',
    path: [
      {
        type: 'zone',
        name: 'Venue-3-US'
      }
    ] as NetworkPath,
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

  const sampleIncident = fakeIncident(incidentValues)

  const sampleIncidentWithTableFields = {
    ...transformIncidentQueryResult(sampleIncident),
    description: '802.11 Authentication failures are unusually high in Venue: Venue-3-US',
    scope: 'Venue-3-US',
    type: 'Venue',
    duration: 180000,
    category: 'Connection',
    subCategory: '802.11 Authentication',
    clientImpact: '100%',
    impactedClients: '2',
    severityLabel: 'P4'
  }

  const transformedResult = [
    {
      ...sampleIncidentWithTableFields,
      relatedIncidents: [incidentValues],
      children: [sampleIncidentWithTableFields]
    }
  ]

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

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

  describe('transformData', () => {
    it('test data transformation', () => {
      expect(transformData(sampleIncident)).toMatchObject(sampleIncidentWithTableFields)
    })
  })

  describe('createToggleMuteMutation', () => {
    const incidents = [
      {
        id: '1',
        code: 'auth-failure',
        priority: 'P1',
        mute: true
      },
      {
        id: '2',
        code: 'auth-failure',
        priority: 'P2',
        mute: false
      }
    ]
    it('should return the correct mutation', () => {
      expect(createToggleMuteMutation(incidents)).toEqual({
        document:
          gql`
    mutation MutateIncident(
      
      $incident0_id: String!,
      $incident0_mute: Boolean!,
      $incident0_code: String!,
      $incident0_priority: String!
    
      $incident1_id: String!,
      $incident1_mute: Boolean!,
      $incident1_code: String!,
      $incident1_priority: String!
    
    ) {
      
      incident0: toggleMute(
        id: $incident0_id,
        mute: $incident0_mute,
        code: $incident0_code,
        priority: $incident0_priority
      ) {
        success
        errorMsg
        errorCode
      }
    
      incident1: toggleMute(
        id: $incident1_id,
        mute: $incident1_mute,
        code: $incident1_code,
        priority: $incident1_priority
      ) {
        success
        errorMsg
        errorCode
      }
    
    }
  `,
        variables: {
          incident0_id: incidents[0].id,
          incident0_code: incidents[0].code,
          incident0_priority: incidents[0].priority,
          incident0_mute: incidents[0].mute,
          incident1_id: incidents[1].id,
          incident1_code: incidents[1].code,
          incident1_priority: incidents[1].priority,
          incident1_mute: incidents[1].mute
        }
      })
    })
  })
})
