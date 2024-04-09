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

export const crrmUnknownListResult = {
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
      id: 'unknown',
      code: 'unknown',
      status: 'verificationError' as StateType,
      sliceValue: 'Deeps Place',
      kpi_number_of_interfering_links: {
        current: null,
        previous: null,
        projected: null
      },
      metadata: {
        audit: [{
          code: 'global',
          stage: 'filter',
          failure: {
            mesh: false
          }
        }]
      }
    },
    {
      id: 'unknown',
      code: 'unknown',
      status: 'insufficientLicenses' as StateType,
      sliceValue: 'zone-3',
      kpi_number_of_interfering_links: {
        current: null,
        previous: null,
        projected: null
      },
      metadata: {
        audit: [{
          code: 'global',
          stage: 'filter',
          failure: {
            'not-fully-licensed': false
          }
        }]
      }
    },
    {
      id: 'unknown',
      code: 'unknown',
      status: 'verificationError' as StateType,
      sliceValue: 'zone-4',
      kpi_number_of_interfering_links: {
        current: null,
        previous: null,
        projected: null
      },
      metadata: {
        audit: [
          {
            code: 'c-crrm-channel24g-auto',
            stage: 'trigger',
            failure: {
              'global-zone-checker': false
            }
          },
          {
            code: 'c-crrm-channel5g-auto',
            stage: 'trigger',
            failure: {
              'global-zone-checker': false
            }
          },
          {
            code: 'c-crrm-channel6g-auto',
            stage: 'trigger',
            failure: {
              'global-zone-checker': false
            }
          }
        ]
      }
    }
  ]
}

export const crrmNoLicenseListResult = {
  crrmCount: 3,
  zoneCount: 3,
  optimizedZoneCount: 1,
  crrmScenarios: 13888,
  recommendations: [
    {
      id: 'unknown',
      code: 'unknown',
      status: 'insufficientLicenses' as StateType,
      sliceValue: 'zone-1',
      kpi_number_of_interfering_links: {
        current: null,
        previous: null,
        projected: null
      },
      metadata: {
        audit: [{
          code: 'global',
          stage: 'filter',
          failure: {
            'not-fully-licensed': false
          }
        }]
      }
    },
    {
      id: 'unknown',
      code: 'unknown',
      status: 'insufficientLicenses' as StateType,
      sliceValue: 'zone-2',
      kpi_number_of_interfering_links: {
        current: null,
        previous: null,
        projected: null
      },
      metadata: {
        audit: [{
          code: 'global',
          stage: 'filter',
          failure: {
            'not-fully-licensed': false
          }
        }]
      }
    },
    {
      id: 'unknown',
      code: 'unknown',
      status: 'insufficientLicenses' as StateType,
      sliceValue: 'zone-3',
      kpi_number_of_interfering_links: {
        current: null,
        previous: null,
        projected: null
      },
      metadata: {
        audit: [{
          code: 'global',
          stage: 'filter',
          failure: {
            'not-fully-licensed': false
          }
        }]
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
      sliceValue: 'zone-2',
      status: 'new'
    },
    {
      id: '3',
      code: 'c-bandbalancing-enable',
      updatedAt: '2023-07-06T06:05:21.004Z',
      sliceValue: 'Deeps Place',
      status: 'new'
    }
  ]
}

export const aiOpsNonNewListResult = {
  aiOpsCount: 2,
  recommendations: [
    {
      id: '2',
      code: 'c-txpower-same',
      updatedAt: '2023-06-16T06:06:02.839Z',
      sliceValue: 'zone-2',
      status: 'applied'
    },
    {
      id: '3',
      code: 'c-bandbalancing-enable',
      updatedAt: '2023-07-06T06:05:21.004Z',
      sliceValue: 'Deeps Place',
      status: 'reverted'
    }
  ]
}

export const insufficientLicenses = {
  id: 'unknown',
  code: 'unknown',
  status: 'insufficientLicenses',
  createdAt: '2023-11-09T07:05:14.900Z',
  updatedAt: '2023-11-12T06:05:21.004Z',
  sliceType: 'zone',
  sliceValue: '01-Alethea-WiCheck Test',
  metadata: {
    audit: [{
      code: 'global',
      stage: 'filter',
      failure: {
        'not-fully-licensed': false
      }
    }]
  },
  isMuted: false,
  mutedBy: '',
  mutedAt: null,
  path: [
    {
      type: 'system',
      name: 'vsz34'
    },
    {
      type: 'domain',
      name: '01-US-CA-D1-Test-Home'
    },
    {
      type: 'zone',
      name: '01-Alethea-WiCheck Test'
    }
  ] as NetworkPath,
  preferences: null
}

export const verificationError = {
  id: 'unknown',
  code: 'unknown',
  status: 'verificationError',
  createdAt: '2023-11-09T07:05:14.900Z',
  updatedAt: '2023-11-13T06:05:21.004Z',
  sliceType: 'zone',
  sliceValue: '22-US-CA-Z22-Aaron-Home',
  metadata: {
    audit: [{
      code: 'global',
      stage: 'filter',
      failure: {
        mesh: false
      }
    }]
  },
  isMuted: false,
  mutedBy: '',
  mutedAt: null,
  path: [
    {
      type: 'system',
      name: 'vsz34'
    },
    {
      type: 'domain',
      name: '22-US-CA-D22-Aaron-Home'
    },
    {
      type: 'zone',
      name: '22-US-CA-Z22-Aaron-Home'
    }
  ] as NetworkPath,
  preferences: null
}

export const verified = {
  id: 'unknown',
  code: 'unknown',
  status: 'verified',
  createdAt: '2023-11-09T07:05:14.900Z',
  updatedAt: '2023-11-14T06:05:21.004Z',
  sliceType: 'zone',
  sliceValue: '01-US-CA-D1-Ruckus-HQ-QA-interop',
  metadata: {
    audit: [
      {
        code: 'c-crrm-channel24g-auto',
        stage: 'kpi',
        failure: {
          'cloud-rrm-ccir': {
            'above-medium-ccir-24g': false
          }
        }
      },
      {
        code: 'c-crrm-channel5g-auto',
        stage: 'kpi',
        failure: {
          'cloud-rrm-ccir': {
            'above-medium-ccir-5g': false
          }
        }
      },
      {
        code: 'c-crrm-channel6g-auto',
        stage: 'kpi',
        failure: {
          'cloud-rrm-ccir': {
            'above-medium-ccir-6g': false
          }
        }
      }
    ]
  },
  isMuted: false,
  mutedBy: '',
  mutedAt: null,
  path: [
    {
      type: 'system',
      name: 'vsz34'
    },
    {
      type: 'domain',
      name: '01-US-CA-D1-Test-Home'
    },
    {
      type: 'zone',
      name: '01-US-CA-D1-Ruckus-HQ-QA-interop'
    }
  ] as NetworkPath,
  preferences: null
}

export const unqualifiedZone = {
  id: 'unknown',
  code: 'unknown',
  status: 'unqualifiedZone',
  createdAt: '2023-11-09T07:05:14.900Z',
  updatedAt: '2023-11-14T06:05:21.004Z',
  sliceType: 'zone',
  sliceValue: '23A-IND-BNG-D23-Keshav-Home',
  metadata: { audit: [ { code: 'global', stage: 'filter', failure: { mesh: false } } ] },
  isMuted: false,
  mutedBy: '',
  mutedAt: null,
  path: [
    {
      type: 'system',
      name: 'vsz34'
    },
    {
      type: 'domain',
      name: '23-IND-BNG-D23-Keshav-Home'
    },
    {
      type: 'zone',
      name: '23-IND-BNG-D23-Keshav-Home'
    }
  ] as NetworkPath,
  preferences: null
}

export const unknownAudit = {
  id: 'unknown',
  code: 'unknown',
  status: 'unknown',
  createdAt: '2023-11-09T07:05:14.900Z',
  updatedAt: '2023-11-14T06:05:21.004Z',
  sliceType: 'zone',
  sliceValue: '22-US-CA-Z22-Aaron-Home',
  metadata: { audit: [{ code: 'global', stage: 'filter', failure: { somethingUnknown: false } }] },
  isMuted: false,
  mutedBy: '',
  mutedAt: null,
  path: [
    {
      type: 'system',
      name: 'vsz-h-bdc-home-network-05'
    },
    {
      type: 'zone',
      name: '22-US-CA-Z22-Aaron-Home'
    }
  ] as NetworkPath,
  preferences: null
}

export const noAps = {
  id: 'unknown',
  code: 'unknown',
  status: 'noAps',
  createdAt: '2023-11-09T07:05:14.900Z',
  updatedAt: '2023-11-14T06:05:21.004Z',
  sliceType: 'zone',
  sliceValue: '25-US-CA-D25-SandeepKour-home',
  metadata: { audit: [ { code: 'global', stage: 'filter', failure: { 'no-aps': false } } ] },
  isMuted: false,
  mutedBy: '',
  mutedAt: null,
  path: [
    {
      type: 'system',
      name: 'vsz34'
    },
    {
      type: 'domain',
      name: '25-US-CA-D25-SandeepKour-home'
    },
    {
      type: 'zone',
      name: '25-US-CA-D25-SandeepKour-home'
    }
  ] as NetworkPath,
  preferences: null
}

export const recommendationListResult = {
  recommendations: [
    {
      id: '11',
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
      statusTrail: [
        { status: 'new' },
        { status: 'applyscheduled' },
        { status: 'applyscheduleinprogress' },
        { status: 'applied' }
      ],
      preferences: { crrmFullOptimization: true },
      trigger: 'daily'
    },
    {
      id: '12',
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
      ] as NetworkPath,
      statusTrail: [
        { status: 'new' },
        { status: 'applyscheduled' },
        { status: 'applyscheduleinprogress' },
        { status: 'applied' },
        { status: 'revertscheduled' }
      ],
      preferences: null,
      trigger: 'daily'
    },
    {
      id: '13',
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
      ] as NetworkPath,
      preferences: null,
      trigger: 'once'
    },
    {
      id: '14',
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
      ] as NetworkPath,
      statusTrail: [
        { status: 'new' }
      ],
      preferences: null,
      trigger: 'once'
    },
    insufficientLicenses,
    verificationError,
    verified,
    unqualifiedZone,
    noAps,
    unknownAudit,
    {
      id: '15',
      code: 'c-crrm-channel24g-auto',
      status: 'new',
      createdAt: '2023-06-13T07:05:08.638Z',
      updatedAt: '2023-06-16T06:05:02.839Z',
      sliceType: 'zone',
      sliceValue: 'zone-1',
      metadata: { algorithmData: { isCrrmFullOptimization: false } },
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
      preferences: { crrmFullOptimization: true },
      trigger: 'daily'
    }
  ]
}
