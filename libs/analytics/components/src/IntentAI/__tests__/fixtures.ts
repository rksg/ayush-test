import { NetworkPath } from '@acx-ui/utils'

import { IntentListItem } from '../services'

//Refer to libs/analytics/components/src/Recommendations/__tests__/fixtures.ts
export const notEnoughLicenses = {
  id: '19',
  code: 'c-bgscan24g-enable',
  status: 'na',
  status_reason: 'not-enough-license',
  displayStatus: 'na-not-enough-license',
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
  ] as NetworkPath
}

export const notEnoughData = {
  id: '20',
  code: 'c-bgscan24g-enable',
  status: 'na',
  status_reason: 'not-enough-data',
  displayStatus: 'na-not-enough-data',
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
  ] as NetworkPath
}

export const verified = {
  id: '21',
  code: 'c-bgscan24g-enable',
  status: 'na',
  status_reason: 'verified',
  displayStatus: 'na-verified',
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
  ] as NetworkPath
}

export const conflictConfig = {
  id: '22',
  code: 'c-bgscan24g-enable',
  status: 'na',
  status_reason: 'conflicting-configuration',
  displayStatus: 'na-conflicting-configuration',
  createdAt: '2023-11-09T07:05:14.900Z',
  updatedAt: '2023-11-14T06:05:21.004Z',
  sliceType: 'zone',
  sliceValue: '23A-IND-BNG-D23-Keshav-Home',
  metadata: { audit: [ { code: 'global', stage: 'filter', failure: { mesh: false } } ] },
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
  ] as NetworkPath
}

export const unknownReason = {
  id: '23',
  code: 'c-bgscan24g-enable',
  status: 'na',
  status_reason: 'unknown-reason',
  displayStatus: 'na-unknown-reason',
  createdAt: '2023-11-09T07:05:14.900Z',
  updatedAt: '2023-11-14T06:05:21.004Z',
  sliceType: 'zone',
  sliceValue: '22-US-CA-Z22-Aaron-Home',
  metadata: { audit: [{ code: 'global', stage: 'filter', failure: { somethingUnknown: false } }] },
  path: [
    {
      type: 'system',
      name: 'vsz-h-bdc-home-network-05'
    },
    {
      type: 'zone',
      name: '22-US-CA-Z22-Aaron-Home'
    }
  ] as NetworkPath
}

export const noAps = {
  id: '24',
  code: 'c-bgscan24g-enable',
  status: 'na',
  status_reason: 'no-aps',
  displayStatus: 'na-no-aps',
  createdAt: '2023-11-09T07:05:14.900Z',
  updatedAt: '2023-11-14T06:05:21.004Z',
  sliceType: 'zone',
  sliceValue: '25-US-CA-D25-SandeepKour-home',
  metadata: { audit: [ { code: 'global', stage: 'filter', failure: { 'no-aps': false } } ] },
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
  ] as NetworkPath
}

export const mockCrrmRow = {
  id: '15',
  code: 'c-crrm-channel24g-auto',
  status: 'new',
  status_reason: '',
  displayStatus: 'new',
  createdAt: '2023-06-13T07:05:08.638Z',
  updatedAt: '2023-06-16T06:05:02.839Z',
  sliceType: 'zone',
  sliceValue: 'zone-1',
  metadata: { algorithmData: { isCrrmFullOptimization: false } },
  path: [
    { type: 'system', name: 'vsz612' },
    { type: 'zone', name: 'EDU-MeshZone_S12348' }
  ] as NetworkPath,
  idPath: [
    { type: 'system', name: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8' },
    { type: 'zone', name: 'EDU-MeshZone_S12348' }
  ] as NetworkPath
}

export const intentListResult = {
  intents: [
    {
      id: '11',
      code: 'c-crrm-channel5g-auto',
      status: 'applied',
      status_reason: '',
      displayStatus: 'applied',
      createdAt: '2023-06-13T07:05:08.638Z',
      updatedAt: '2023-06-16T06:05:02.839Z',
      sliceType: 'zone',
      sliceValue: 'zone-1',
      metadata: {},
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
      trigger: 'daily'
    },
    {
      id: '12',
      code: 'c-crrm-channel5g-auto',
      status: 'revertscheduled',
      status_reason: '',
      displayStatus: 'revertscheduled',
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
      trigger: 'daily'
    },
    {
      id: '13',
      code: 'c-txpower-same',
      status: 'revertfailed',
      status_reason: '',
      displayStatus: 'revertfailed',
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
      path: [
        { type: 'system', name: 'vsz6' },
        { type: 'zone', name: 'EDU' }
      ] as NetworkPath,
      trigger: 'once'
    },
    {
      id: '14',
      code: 'c-bandbalancing-enable',
      status: 'new',
      status_reason: '',
      displayStatus: 'new',
      createdAt: '2023-06-12T07:05:14.900Z',
      updatedAt: '2023-07-06T06:05:21.004Z',
      sliceType: 'zone',
      sliceValue: 'Deeps Place',
      metadata: {},
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
      trigger: 'once'
    },
    mockCrrmRow,
    {
      id: '16',
      code: 'c-probeflex-24g',
      status: 'new',
      status_reason: '',
      displayStatus: 'new',
      createdAt: '2023-06-13T07:05:08.638Z',
      updatedAt: '2023-06-16T06:05:02.839Z',
      sliceType: 'zone',
      sliceValue: 'zone-1',
      metadata: {},
      path: [
        { type: 'system', name: 'vsz612' },
        { type: 'zone', name: 'EDU-MeshZone_S12348' }
      ] as NetworkPath
    },
    {
      id: '17',
      code: 'c-probeflex-5g',
      status: 'new',
      status_reason: '',
      displayStatus: 'new',
      createdAt: '2023-06-13T07:05:08.638Z',
      updatedAt: '2023-06-16T06:05:02.839Z',
      sliceType: 'zone',
      sliceValue: 'zone-2',
      metadata: {},
      path: [
        { type: 'system', name: 'vsz612' },
        { type: 'zone', name: 'EDU-MeshZone_S12349' }
      ] as NetworkPath
    },
    {
      id: '18',
      code: 'c-probeflex-6g',
      status: 'new',
      status_reason: '',
      displayStatus: 'new',
      createdAt: '2023-06-13T07:05:08.638Z',
      updatedAt: '2023-06-16T06:05:02.839Z',
      sliceType: 'zone',
      sliceValue: 'zone-1',
      metadata: {},
      path: [
        { type: 'system', name: 'vsz612' },
        { type: 'zone', name: 'EDU-MeshZone_S12348' }
      ] as NetworkPath,
      trigger: 'daily'
    },
    notEnoughLicenses,
    notEnoughData,
    verified,
    conflictConfig,
    unknownReason,
    noAps
  ] as IntentListItem[]
}
