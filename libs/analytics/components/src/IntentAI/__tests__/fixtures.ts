import { NetworkPath } from '@acx-ui/utils'

import { AiFeatures }                                  from '../config'
import { IntentConfigurationConfig, useIntentContext } from '../IntentContext'
import { Statuses }                                    from '../states'
import { AIFeatureProps }                              from '../Table'
import { IntentDetail, IntentKPIConfig, intentState }  from '../useIntentDetailsQuery'

export const mockIntentContext = (config: {
  intent: IntentDetail
  kpis?: IntentKPIConfig[],
  configuration?: IntentConfigurationConfig
  isDataRetained?: boolean
  isHotTierData?: boolean
}) => {
  const context: ReturnType<typeof useIntentContext> = {
    configuration: config.configuration,
    intent: config.intent,
    kpis: config.kpis ?? [],
    state: intentState(config.intent),
    isDataRetained: config.intent.dataCheck?.isDataRetained ?? true,
    isHotTierData: config.intent.dataCheck?.isHotTierData ?? true
  }
  jest.mocked(useIntentContext).mockReturnValue(context)
  return context
}

export const mockVenueList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      networks: { names: ['n3', 'n4', 'n5'] },
      name: 'My-Venue'
    },
    {
      networks: { names: ['n5', 'n6'] },
      name: 'test'
    }
  ]
}

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
    scheduledAt: '2023-07-01T06:00:00.000Z',
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
  metadata: {
    audit: [ { code: 'global', stage: 'filter', failure: { 'no-aps': false } } ],
    scheduledAt: '2023-07-01T06:00:00.000Z'
  },
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

export const mockAIDrivenRow = {
  id: '15',
  code: 'c-crrm-channel24g-auto',
  status: 'new',
  statusReason: '',
  displayStatus: 'new',
  createdAt: '2023-06-13T07:05:08.638Z',
  updatedAt: '2023-06-16T06:05:02.839Z',
  sliceType: 'zone',
  sliceValue: 'zone-1',
  metadata: {
    scheduledAt: '2023-06-16T06:05:02.839Z'
  },
  path: [
    { type: 'system', name: 'vsz612' },
    { type: 'zone', name: 'EDU-MeshZone_S12348' }
  ] as NetworkPath,
  idPath: [
    { type: 'system', name: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8' },
    { type: 'zone', name: 'EDU-MeshZone_S12348' }
  ] as NetworkPath,
  preferences: { crrmFullOptimization: true },
  statusTrail: [
    { status: 'new' },
    { status: 'applyscheduled' },
    { status: 'applyscheduleinprogress' },
    { status: 'applied' }
  ],
  trigger: 'daily'
}

export const mockEquiFlexRows = [
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
    id: '17',
    code: 'c-probeflex-5g',
    status: 'new',
    statusReason: '',
    displayStatus: 'new',
    createdAt: '2023-06-13T07:05:08.638Z',
    updatedAt: '2023-06-16T06:05:02.839Z',
    sliceType: 'zone',
    sliceValue: 'zone-2',
    metadata: {},
    path: [
      { type: 'system', name: 'vsz612' },
      { type: 'zone', name: 'EDU-MeshZone_S12349' }
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
  }
]

export const intentListResult = {
  intents: { data: [
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
      metadata: {
        scheduledAt: '2023-07-01T06:00:00.000Z'
      },
      path: [
        { type: 'system', name: 'vsz611' },
        { type: 'zone', name: 'zone-1' }
      ] as NetworkPath,
      idPath: [
        { type: 'system', name: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c7' },
        { type: 'zone', name: 'zone-1' }
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
    statuses: [
      { id: 'new', label: 'new' },
      { id: 'na-no-aps', label: 'na-no-aps' },
      { id: 'paused-from-active', label: 'paused-from-active' },
      { id: 'paused-by-default', label: 'paused-by-default' }
    ]
  }
}
const intentStatus = {
  id: '1',
  code: 'c-crrm-channel5g-auto',
  status: 'active',
  statusReason: '',
  displayStatus: 'active',
  createdAt: '2023-06-13T07:05:08.638Z',
  updatedAt: '2023-06-16T06:05:02.839Z',
  sliceType: 'zone',
  sliceValue: 'zone-1',
  metadata: {
    changedByName: 'fakeUser lastName5566'
  },
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
  intents: { data: [
    {
      ...intentStatus,
      status: 'new',
      statusReason: '',
      displayStatus: 'new',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      status: 'scheduled',
      statusReason: '',
      displayStatus: 'scheduled',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z',
        changedByName: 'fakeUserWithOptimize lastName5566'
      }
    },
    {
      ...intentStatus,
      status: 'scheduled',
      statusReason: 'one-click',
      displayStatus: 'scheduled-one-click',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z',
        changedByName: 'fakeUserWithOneClickOptimize lastName5566'
      }
    },
    {
      ...intentStatus,
      status: 'applyscheduled',
      statusReason: '',
      displayStatus: 'applyscheduled',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      status: 'applyscheduleinprogress',
      statusReason: '',
      displayStatus: 'applyscheduleinprogress',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      status: 'active',
      statusReason: '',
      displayStatus: 'active',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      status: 'paused',
      statusReason: 'apply-failed',
      displayStatus: 'paused-apply-failed',
      metadata: {
        failures: ['errMsg from the notification service'],
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      status: 'revertscheduled',
      statusReason: '',
      displayStatus: 'revertscheduled',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z',
        changedByName: 'fakeUserWithRevert lastName5566'
      }
    },
    {
      ...intentStatus,
      status: 'revertscheduleinprogress',
      statusReason: '',
      displayStatus: 'revertscheduleinprogress',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      status: 'paused',
      statusReason: 'revert-failed',
      displayStatus: 'paused-revert-failed',
      metadata: {
        failures: ['errMsg from the notification service'],
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      status: 'paused',
      statusReason: 'revert-failed',
      displayStatus: 'paused-revert-failed',
      metadata: {
        failures: ['Revert failed'],
        scheduledAt: '2023-06-17T00:00:00.000Z',
        error: {
          details: [{
            apMac: '80:F0:CF:0A:11:D0',
            apName: 'R750_181_74',
            message: 'AP removed',
            apSerial: '192322025599',
            configKey: 'radio24g'
          },
          {
            apMac: 'B4:79:C8:3E:BE:10',
            apName: 'H350_116_189',
            message: 'AP removed',
            apSerial: '502006000116',
            configKey: 'radio24g'
          }]
        }
      }
    },
    {
      ...intentStatus,
      status: 'paused',
      statusReason: 'reverted',
      displayStatus: 'paused-reverted',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      status: 'paused',
      statusReason: 'from-inactive',
      displayStatus: 'paused-from-inactive',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      status: 'paused',
      statusReason: 'from-active',
      displayStatus: 'paused-from-active',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      status: 'paused',
      statusReason: 'by-default',
      displayStatus: 'paused-by-default',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      metadata: {
        failures: ['no-ap-mesh-checker'],
        scheduledAt: '2023-06-17T00:00:00.000Z'
      },
      status: 'na',
      statusReason: 'conflicting-configuration',
      displayStatus: 'na-conflicting-configuration'
    },
    {
      ...intentStatus,
      status: 'na',
      statusReason: 'no-aps',
      displayStatus: 'na-no-aps',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      status: 'na',
      statusReason: 'not-enough-license',
      displayStatus: 'na-not-enough-license',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      metadata: {
        failures: ['no-ap-peer-data'],
        scheduledAt: '2023-06-17T00:00:00.000Z'
      },
      status: 'na',
      statusReason: 'not-enough-data',
      displayStatus: 'na-not-enough-data'
    },
    {
      ...intentStatus,
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      ...intentStatus,
      status: 'na',
      statusReason: 'waiting-for-etl',
      displayStatus: 'na-waiting-for-etl',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    },
    {
      //Simulate a displayStatus not defined in UI config and should be handled by UI without errors
      ...intentStatus,
      status: 'na',
      statusReason: 'not-defined',
      displayStatus: 'na-not-defined',
      metadata: {
        scheduledAt: '2023-06-17T00:00:00.000Z'
      }
    }
  ], total: 20
  }
}

export const intentHighlights = {
  highlights: {
    rrm: {
      new: 4,
      active: 8
    },
    probeflex: {
      new: 5,
      active: 10
    },
    ops: {
      new: 6,
      active: 12
    },
    ecoflex: {
      new: 7,
      active: 14
    }
  }
}

export const intentHighlightsWithZeroActive = {
  highlights: {
    rrm: {
      new: 4,
      active: 0
    },
    probeflex: {
      new: 5,
      active: 0
    },
    ops: {
      new: 6,
      active: 0
    }
  }
}

export const intentHighlightsWithNullFields = {
  highlights: {
  }
}

export const intentHighlightsWithRRM = {
  highlights: {
    rrm: {
      new: 4,
      active: 8
    }
  }
}

export const intentHighlightsWithEquiFlex = {
  highlights: {
    probeflex: {
      new: 5,
      active: 10
    }
  }
}

export const intentHighlightsWithOperations = {
  highlights: {
    ops: {
      new: 6,
      active: 12
    }
  }
}

export const aiFeatureWithRRM = {
  code: 'c-crrm-channel5g-auto',
  aiFeature: AiFeatures.RRM,
  root: 'root1',
  sliceId: 'sliceId1',
  status: Statuses.active
} as AIFeatureProps

export const aiFeatureWithEquiFlex = {
  code: 'c-probeflex-6g',
  aiFeature: AiFeatures.EquiFlex,
  root: 'root2',
  sliceId: 'sliceId2',
  status: Statuses.active
} as AIFeatureProps

export const aiFeatureWithEquiFlexWithNewStatus = {
  code: 'c-probeflex-6g',
  aiFeature: AiFeatures.EquiFlex,
  root: 'root2',
  sliceId: 'sliceId2',
  status: Statuses.new
} as AIFeatureProps

export const aiFeatureWithAIOps = {
  code: 'c-bgscan24g-enable',
  aiFeature: AiFeatures.AIOps,
  root: 'root3',
  sliceId: 'sliceId3',
  status: Statuses.active
} as AIFeatureProps

export const aiFeatureWithEcoFlex = {
  code: 'i-ecoflex',
  aiFeature: AiFeatures.EcoFlex,
  root: 'root4',
  sliceId: 'sliceId4',
  status: Statuses.active
} as AIFeatureProps

