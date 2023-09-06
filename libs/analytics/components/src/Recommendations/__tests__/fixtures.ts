import { NetworkPath } from '@acx-ui/utils'

import { StateType } from '../config'

export const crrmListResult = {
  recommendations: [
    {
      id: '1',
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
    }
  ]
}
