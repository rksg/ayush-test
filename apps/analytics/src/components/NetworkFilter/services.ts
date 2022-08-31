import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'
import {
  AnalyticsFilter,
  defaultNetworkPath,
  incidentCodes,
  NetworkPath,
  PathNode
} from '@acx-ui/analytics/utils'

type NetworkData = PathNode & { path: NetworkPath }
export type ApOrSwitch = {
  path: NetworkPath,
  name: string,
  mac: string,
  incidentSeverity: number
}
export type ApsOrSwitches = { aps?: ApOrSwitch[], switches?: ApOrSwitch[] }
export type Child = NetworkData & ApsOrSwitches
interface Response {
  network: {
    hierarchyNode: { children: Child[] }
  }
}
const testData = 
{
  network: {
    hierarchyNode: {
      type: 'network',
      name: 'Network',
      path: [
        {
          type: 'network',
          name: 'Network'
        }
      ],
      children: [
        {
          type: 'zone',
          name: 'My-Venue',
          path: [
            {
              type: 'network',
              name: 'Network'
            },
            {
              type: 'zone',
              name: 'My-Venue'
            }
          ],
          aps: [
            {
              name: 'Stability-R730',
              mac: '1C:3A:60:28:A9:30',
              incidentSeverity: 1
            },
            {
              name: 'Stability-T310N',
              mac: '34:FA:9F:25:92:C0',
              incidentSeverity: 0
            },
            {
              name: 'Stability-R550',
              mac: '70:CA:97:01:98:50',
              incidentSeverity: 0.85
            },
            {
              name: 'Stability-T310C',
              mac: '70:CA:97:2B:2A:20',
              incidentSeverity: 0.7
            },
            {
              name: 'Stability-R650',
              mac: '70:CA:97:3A:E0:00',
              incidentSeverity: 0.5
            },
            {
              name: 'Stability-H350',
              mac: 'B4:79:C8:3E:BF:90',
              incidentSeverity: 0
            },
            {
              name: 'Stability-T610',
              mac: 'EC:8C:A2:13:CA:E0',
              incidentSeverity: 0
            }
          ],
          switches: []
        },
        {
          type: 'switchGroup',
          name: 'Test-Venue',
          path: [
            {
              type: 'network',
              name: 'Network'
            },
            {
              type: 'switchGroup',
              name: 'Test-Venue'
            }
          ],
          switches: [
            {
              name: 'Test-R730',
              mac: '1C:3A:60:28:A9:30',
              incidentSeverity: 1
            },
            {
              name: 'Test-T310N',
              mac: '34:FA:9F:25:92:C0',
              incidentSeverity: 1
            },
            {
              name: 'Test-R550',
              mac: '70:CA:97:01:98:50',
              incidentSeverity: 0
            },
            {
              name: 'Test-T310C',
              mac: '70:CA:97:2B:2A:20',
              incidentSeverity: 0
            },
            {
              name: 'Test-R650',
              mac: '70:CA:97:3A:E0:00',
              incidentSeverity: 0
            },
            {
              name: 'Test-H350',
              mac: 'B4:79:C8:3E:BF:90',
              incidentSeverity: 1
            },
            {
              name: 'Test-T610',
              mac: 'EC:8C:A2:13:CA:E0',
              incidentSeverity: 0
            }
          ],
          aps: []
        },
        {
          type: 'zone',
          name: 'Test-Venue-2',
          path: [
            {
              type: 'network',
              name: 'Network'
            },
            {
              type: 'zone',
              name: 'Test-Venue-2'
            }
          ],
          aps: [
            {
              name: 'Test-2-R730',
              mac: '1C:3A:60:28:A9:30',
              incidentSeverity: 0.85
            },
            {
              name: 'Test-2-T310N',
              mac: '34:FA:9F:25:92:C0',
              incidentSeverity: 0
            },
            {
              name: 'Test-2-R550',
              mac: '70:CA:97:01:98:50',
              incidentSeverity: 0
            },
            {
              name: 'Test-2-T310C',
              mac: '70:CA:97:2B:2A:20',
              incidentSeverity: 0.5
            },
            {
              name: 'Test-2-R650',
              mac: '70:CA:97:3A:E0:00',
              incidentSeverity: 0
            },
            {
              name: 'Test-2-H350',
              mac: 'B4:79:C8:3E:BF:90',
              incidentSeverity: 0
            },
            {
              name: 'Test-2-T610',
              mac: 'EC:8C:A2:13:CA:E0',
              incidentSeverity: 0.85
            }
          ],
          switches: []
        },
        {
          type: 'zone',
          name: 'Test-Venue-3',
          path: [
            {
              type: 'network',
              name: 'Network'
            },
            {
              type: 'zone',
              name: 'Test-Venue-3'
            }
          ],
          aps: [
            {
              name: 'Test-3-R730',
              mac: '1C:3A:60:28:A9:30',
              incidentSeverity: 0
            },
            {
              name: 'Test-3-T310N',
              mac: '34:FA:9F:25:92:C0',
              incidentSeverity: 0
            },
            {
              name: 'Test-3-R550',
              mac: '70:CA:97:01:98:50',
              incidentSeverity: 0
            },
            {
              name: 'Test-3-T310C',
              mac: '70:CA:97:2B:2A:20',
              incidentSeverity: 0
            },
            {
              name: 'Test-3-R650',
              mac: '70:CA:97:3A:E0:00',
              incidentSeverity: 0
            },
            {
              name: 'Test-3-H350',
              mac: 'B4:79:C8:3E:BF:90',
              incidentSeverity: 0
            },
            {
              name: 'Test-3-T610',
              mac: 'EC:8C:A2:13:CA:E0',
              incidentSeverity: 0
            }
          ],
          switches: []
        }
      ]
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkFilter: build.query<
      Child[],
      Omit<AnalyticsFilter, 'path'>
    >({
      query: payload => ({
        document: gql`
          query NetworkHierarchy(
            $path: [HierarchyNodeInput], $start: DateTime, $end: DateTime, $code: [String]
          ) {
            network(start: $start, end: $end, code: $code) {
              hierarchyNode(path: $path, querySwitch: true) {
                type
                name
                path {
                  type
                  name
                }
                children {
                  type
                  name
                  path {
                    type
                    name
                  }
                  aps {
                    name
                    mac
                    incidentSeverity
                  }
                  switches {
                    name
                    mac
                    incidentSeverity
                  }
                }
              }
            }
          }
        `,
        variables: {
          path: defaultNetworkPath,
          start: payload.startDate,
          end: payload.endDate,
          code: incidentCodes
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'ANALYTICS_NETWORK_FILTER' }],
      transformResponse: (response: Response) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        testData.network.hierarchyNode.children as any
    })
  })
})

export const { useNetworkFilterQuery } = api
