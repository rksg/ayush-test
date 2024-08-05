import { NetworkPath } from '@acx-ui/utils'

//Refer to libs/analytics/components/src/Recommendations/__tests__/fixtures.ts
export const intentListResult = {
  intents: [
    {
      id: '11',
      code: 'c-crrm-channel5g-auto',
      status: 'active',
      statusReason: '',
      displayStatus: 'active',
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
    {
      id: '12',
      code: 'c-crrm-channel5g-auto',
      status: 'revertscheduled',
      statusReason: '',
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
      preferences: null,
      trigger: 'daily'
    },
    {
      id: '13',
      code: 'c-txpower-same',
      status: 'paused',
      statusReason: 'revert-failed',
      displayStatus: 'paused-revert-failed',
      createdAt: '2023-06-13T07:05:08.638Z',
      updatedAt: '2023-06-16T06:06:02.839Z',
      sliceType: 'zone',
      sliceValue: 'zone-2',
      metadata: {
        error: {
          message: 'unknown error'
        }
      },
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
      statusReason: '',
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
      preferences: null,
      trigger: 'once'
    },
    {
      id: '15',
      code: 'c-crrm-channel24g-auto',
      status: 'new',
      statusReason: '',
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
      ] as NetworkPath,
      preferences: { crrmFullOptimization: true }
    },
    {
      id: '16',
      code: 'c-probeflex-24g',
      status: 'new',
      statusReason: '',
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
      statusReason: '',
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
      id: '18',
      code: 'c-probeflex-6g',
      status: 'new',
      statusReason: '',
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
      preferences: { crrmFullOptimization: true },
      trigger: 'daily'
    }
  ]
}

const intentStatus = {
  id: '1',
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
}

export const intentListWithAllStatus = {
  intents: [
    {
      ...intentStatus,
      status: 'new',
      statusReason: '',
      displayStatus: 'new'
    },
    {
      ...intentStatus,
      status: 'scheduled',
      statusReason: '',
      displayStatus: 'scheduled'
    },
    {
      ...intentStatus,
      status: 'scheduled',
      statusReason: 'one-click',
      displayStatus: 'scheduled-one-click'
    },
    {
      ...intentStatus,
      status: 'applyscheduled',
      statusReason: '',
      displayStatus: 'applyscheduled'
    },
    {
      ...intentStatus,
      status: 'applyscheduleinprogress',
      statusReason: '',
      displayStatus: 'applyscheduleinprogress'
    },
    {
      ...intentStatus,
      status: 'active',
      statusReason: '',
      displayStatus: 'active'
    },
    {
      ...intentStatus,
      status: 'paused',
      statusReason: 'apply-failed',
      displayStatus: 'paused-apply-failed',
      metadata: {
        error: {
          message: 'unknown error'
        }
      }
    },
    {
      ...intentStatus,
      status: 'revertscheduled',
      statusReason: '',
      displayStatus: 'revertscheduled',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      status: 'revertscheduleinprogress',
      statusReason: '',
      displayStatus: 'revertscheduleinprogress'
    },
    {
      ...intentStatus,
      status: 'paused',
      statusReason: 'revert-failed',
      displayStatus: 'paused-revert-failed',
      metadata: {
        error: {
          message: 'unknown error'
        }
      }
    },
    {
      ...intentStatus,
      status: 'paused',
      statusReason: 'reverted',
      displayStatus: 'paused-reverted'
    },
    {
      ...intentStatus,
      status: 'paused',
      statusReason: 'from-inactive',
      displayStatus: 'paused-from-inactive'
    },
    {
      ...intentStatus,
      status: 'paused',
      statusReason: 'from-active',
      displayStatus: 'paused-from-active'
    },
    {
      ...intentStatus,
      status: 'paused',
      statusReason: 'by-default',
      displayStatus: 'paused-by-default'
    },
    {
      ...intentStatus,
      status: 'na',
      statusReason: 'conflicting-configuration',
      displayStatus: 'na-conflicting-configuration'
    },
    {
      ...intentStatus,
      status: 'na',
      statusReason: 'no-aps',
      displayStatus: 'na-no-aps'
    },
    {
      ...intentStatus,
      status: 'na',
      statusReason: 'not-enough-license',
      displayStatus: 'na-not-enough-license'
    },
    {
      ...intentStatus,
      status: 'na',
      statusReason: 'not-enough-data',
      displayStatus: 'na-not-enough-data'
    },
    {
      ...intentStatus,
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified'
    },
    {
      ...intentStatus,
      status: 'na',
      statusReason: 'waiting-for-etl',
      displayStatus: 'na-waiting-for-etl'
    },
    {
      //Simulate a displayStatus not defined in UI config and should be handled by UI without errors
      ...intentStatus,
      status: 'na',
      statusReason: 'not-defined',
      displayStatus: 'na-not-defined'
    }
  ]
}
