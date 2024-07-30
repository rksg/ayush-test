import { NetworkPath } from '@acx-ui/utils'

//Refer to libs/analytics/components/src/Recommendations/__tests__/fixtures.ts
export const notEnoughLicenses = {
  id: '19',
  code: 'c-bgscan24g-enable',
  status: 'na',
  statusReason: 'not-enough-license',
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
  ] as NetworkPath,
  preferences: null
}


export const noAps = {
  id: '24',
  code: 'c-bgscan24g-enable',
  status: 'na',
  statusReason: 'no-aps',
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
  ] as NetworkPath,
  preferences: null
}

export const intentListResult = {
  intents: { data: [
    {
      id: '11',
      code: 'c-crrm-channel5g-auto',
      status: 'applied',
      statusReason: '',
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
      preferences: { crrmFullOptimization: true },
      trigger: 'daily'
    },
    notEnoughLicenses,
    noAps
  ],
  total: 3
  }
}

export const filterOptions = {
  intentFilterOptions: {
    codes: [{
      id: 'c-crrm-channel5g-auto',
      label: 'Client Density vs. Throughput for 5 GHz radio'
    }, {
      id: 'i-zonefirmware-upgrade',
      label: 'i-zonefirmware-upgrade'
    }],
    zones: [{
      id: '01-Alethea-WiCheck Test',
      label: '01-Alethea-WiCheck Test'
    }, {
      id: 'zone',
      label: 'zone'
    }],
    statuses: [{
      id: 'applied',
      label: 'applied'
    }, {
      id: 'na-no-aps', label: 'na-no-aps'
    }]
  }
}

