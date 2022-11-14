import { NodeType, PathNode } from '@acx-ui/utils'

export const incidentTests = [
  {
    severity: 0.12098536225957168,
    startTime: '2022-08-03T05:45:00.000Z',
    endTime: '2022-08-03T05:54:00.000Z',
    code: 'radius-failure' as 'radius-failure',
    sliceType: 'ap' as NodeType,
    sliceValue: 'r710_!216',
    id: '88f7d231-34c7-4c54-85fe-99ffa4891902',
    path: [
      {
        type: 'zone',
        name: 'Vaibhav-venue'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '60:D0:2C:22:6B:90'
      }
    ] as PathNode[],
    metadata: {},
    clientCount: 3,
    impactedClientCount: 2,
    isMuted: false,
    mutedBy: null,
    mutedAt: null
  },
  {
    severity: 0.15997624339040492,
    startTime: '2022-07-21T08:12:00.000Z',
    endTime: '2022-07-21T08:21:00.000Z',
    code: 'auth-failure' as 'auth-failure',
    sliceType: 'ap' as NodeType,
    sliceValue: 'Unknown',
    id: '24e8e00b-2564-4ce9-8933-c153273dfe2d',
    path: [
      {
        type: 'zone',
        name: 'Venue-3-US'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '70:CA:97:3A:3A:40'
      }
    ] as PathNode[],
    metadata: {},
    clientCount: 4,
    impactedClientCount: 2,
    isMuted: true,
    mutedBy: null,
    mutedAt: null,
    relatedIncidents: [
      {
        severity: 0.4,
        startTime: '2022-08-03T05:45:00.000Z',
        endTime: '2022-08-03T05:54:00.000Z',
        code: 'radius-failure' as 'radius-failure',
        sliceType: 'ap' as NodeType,
        sliceValue: 'r710_!216',
        id: 'fe8ebfa5-a730-4c4d-94db-325964ea8b2b',
        path: [
          {
            type: 'zone',
            name: 'Vaibhav-venue'
          },
          {
            type: 'apGroup',
            name: 'No group (inherit from Venue)'
          },
          {
            type: 'ap',
            name: '60:D0:2C:22:6B:90'
          }
        ] as PathNode[],
        metadata: {},
        clientCount: 3,
        impactedClientCount: 2,
        isMuted: true,
        mutedBy: null,
        mutedAt: null
      },
      {
        severity: 0.6,
        startTime: '2022-08-03T05:45:00.000Z',
        endTime: '2022-08-03T05:54:00.000Z',
        code: 'radius-failure' as 'radius-failure',
        sliceType: 'ap' as NodeType,
        sliceValue: 'r710_!216',
        id: '692ed85d-68a2-402f-a0e0-1faffdd80e56',
        path: [
          {
            type: 'zone',
            name: 'Vaibhav-venue'
          },
          {
            type: 'apGroup',
            name: 'No group (inherit from Venue)'
          },
          {
            type: 'ap',
            name: '60:D0:2C:22:6B:90'
          }
        ] as PathNode[],
        metadata: {},
        clientCount: 3,
        impactedClientCount: 2,
        mutedBy: null,
        mutedAt: null,
        isMuted: false
      }
    ]
  },
  {
    severity: 0.12098536225957168,
    startTime: '2022-08-03T05:45:00.000Z',
    endTime: '2022-08-03T05:54:00.000Z',
    code: 'radius-failure' as 'radius-failure',
    sliceType: 'ap' as NodeType,
    sliceValue: 'r710_!21690',
    id: 'c5917024-fd4f-4e11-b65d-610f0251242b123',
    path: [
      {
        type: 'zone',
        name: 'Vaibhav-venue'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '60:D0:2C:22:6B:90'
      }
    ] as PathNode[],
    metadata: {
      dominant: {
        ssid: 'test'
      },
      rootCauseChecks: {
        checks: [
          {
            CCD_REASON_AAA_AUTH_FAIL: true
          }
        ],
        params: {}
      }
    },
    clientCount: 3,
    impactedClientCount: 2,
    isMuted: false,
    mutedBy: null,
    mutedAt: null,
    relatedIncidents: [
      {
        severity: 0.4,
        startTime: '2022-08-03T05:45:00.000Z',
        endTime: '2022-08-03T05:54:00.000Z',
        code: 'radius-failure' as 'radius-failure',
        sliceType: 'ap' as NodeType,
        sliceValue: 'r710_!216',
        id: 'e03eda9b-7107-46b2-bce5-c5a5ef95f4d6',
        path: [
          {
            type: 'zone',
            name: 'Vaibhav-venue'
          },
          {
            type: 'apGroup',
            name: 'No group (inherit from Venue)'
          },
          {
            type: 'ap',
            name: '60:D0:2C:22:6B:90'
          }
        ] as PathNode[],
        metadata: {},
        clientCount: 3,
        impactedClientCount: 2,
        isMuted: true,
        mutedBy: null,
        mutedAt: null
      },
      {
        severity: 0.6,
        startTime: '2022-08-03T05:45:00.000Z',
        endTime: '2022-08-03T05:54:00.000Z',
        code: 'radius-failure' as 'radius-failure',
        sliceType: 'ap' as NodeType,
        sliceValue: 'r710_!216',
        id: '719b9455-baec-4d38-93a2-11c42fdb6950',
        path: [
          {
            type: 'zone',
            name: 'Vaibhav-venue'
          },
          {
            type: 'apGroup',
            name: 'No group (inherit from Venue)'
          },
          {
            type: 'ap',
            name: '60:D0:2C:22:6B:90'
          }
        ] as PathNode[],
        metadata: {},
        clientCount: 3,
        impactedClientCount: 2,
        mutedBy: null,
        mutedAt: null,
        isMuted: false
      }
    ]
  }
]