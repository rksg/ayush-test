import { NetworkPath } from '@acx-ui/utils'

import { StateType } from '../config'

export const crrmListResult = {
  crrmCount: 3,
  zoneCount: 3,
  optimizedZoneCount: 1,
  crrmScenarios: 13888,
  recommendations: [
    {
      id: '1',
      code: 'c-crrm-channel5g-auto',
      status: 'applied' as StateType,
      sliceValue: 'zone-1',
      kpi_number_of_interfering_links: {
        current: 0,
        previous: 3,
        projected: null
      }
    },
    {
      id: '2',
      code: 'c-crrm-channel24g-auto',
      status: 'reverted' as StateType,
      sliceValue: 'zone-2',
      kpi_number_of_interfering_links: {
        current: 5,
        previous: 5,
        projected: null
      }
    },
    {
      id: '3',
      code: 'c-crrm-channel6g-auto',
      status: 'new' as StateType,
      sliceValue: 'Deeps Place',
      kpi_number_of_interfering_links: {
        current: 2,
        previous: null,
        projected: 0
      }
    }
  ]
}

export const aiOpsListResult = {
  aiOpsCount: 2,
  recommendations: [
    {
      id: '2',
      code: 'c-txpower-same',
      updatedAt: '2023-06-16T06:06:02.839Z',
      sliceValue: 'zone-2'
    },
    {
      id: '3',
      code: 'c-bandbalancing-enable',
      updatedAt: '2023-07-06T06:05:21.004Z',
      sliceValue: 'Deeps Place'
    }
  ]
}

export const recommendationListResult = {
  recommendations: [
    {
      id: '1',
      code: 'c-crrm-channel5g-auto',
      status: 'applied',
      createdAt: '2023-06-13T07:05:08.638Z',
      updatedAt: '2023-06-16T06:05:02.839Z',
      sliceType: 'zone',
      sliceValue: 'zone-1',
      metadata: {},
      isMuted: false,
      mutedAt: null,
      mutedBy: '',
      path: [
        { type: 'system', name: 'vsz611' },
        { type: 'zone', name: 'EDU-MeshZone_S12348' }
      ] as NetworkPath,
      idPath: [
        { type: 'system', name: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c7' },
        { type: 'zone', name: 'EDU-MeshZone_S12348' }
      ] as NetworkPath,
      preferences: {
        fullOptimization: true
      }
    },
    {
      id: '1',
      code: 'c-crrm-channel5g-auto',
      status: 'revertscheduled',
      createdAt: '2023-06-13T07:05:08.638Z',
      updatedAt: '2023-06-16T06:05:02.839Z',
      sliceType: 'zone',
      sliceValue: 'zone-1',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z',
        error: {
          details: [{
            apName: 'AP',
            apMac: 'MAC',
            configKey: 'radio5g',
            message: 'unknown error'
          }]
        }
      },
      isMuted: false,
      mutedAt: null,
      mutedBy: '',
      path: [
        { type: 'system', name: 'vsz611' },
        { type: 'zone', name: 'EDU-MeshZone_S12348' }
      ] as NetworkPath
    },
    {
      id: '2',
      code: 'c-txpower-same',
      status: 'revertfailed',
      createdAt: '2023-06-13T07:05:08.638Z',
      updatedAt: '2023-06-16T06:06:02.839Z',
      sliceType: 'zone',
      sliceValue: 'zone-2',
      metadata: {
        error: {
          details: [{
            apName: 'AP',
            apMac: 'MAC',
            configKey: 'radio5g',
            message: 'unknown error'
          }]
        }
      },
      isMuted: false,
      mutedBy: '',
      mutedAt: null,
      path: [
        { type: 'system', name: 'vsz6' },
        { type: 'zone', name: 'EDU' }
      ] as NetworkPath
    },
    {
      id: '3',
      code: 'c-bandbalancing-enable',
      status: 'new',
      createdAt: '2023-06-12T07:05:14.900Z',
      updatedAt: '2023-07-06T06:05:21.004Z',
      sliceType: 'zone',
      sliceValue: 'Deeps Place',
      metadata: {},
      isMuted: true,
      mutedBy: 'a',
      mutedAt: '2023-08-31T13:30:42.671Z',
      path: [
        {
          type: 'system',
          name: 'vsz34'
        },
        {
          type: 'domain',
          name: '27-US-CA-D27-Peat-home'
        },
        {
          type: 'zone',
          name: 'Deeps Place'
        }
      ] as NetworkPath
    },
    {
      id: '5',
      code: 'c-crrm-channel24g-auto',
      status: 'new',
      createdAt: '2023-06-13T07:05:08.638Z',
      updatedAt: '2023-06-16T06:05:02.839Z',
      sliceType: 'zone',
      sliceValue: 'zone-1',
      metadata: {},
      isMuted: false,
      mutedAt: null,
      mutedBy: '',
      path: [
        { type: 'system', name: 'vsz612' },
        { type: 'zone', name: 'EDU-MeshZone_S12348' }
      ] as NetworkPath,
      idPath: [
        { type: 'system', name: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8' },
        { type: 'zone', name: 'EDU-MeshZone_S12348' }
      ] as NetworkPath,
      preferences: {
        fullOptimization: false
      }
    }
  ]
}
