export const expectedData = {
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
      path: [
        { type: 'system', name: 'vsz611' },
        { type: 'zone', name: 'EDU-MeshZone_S12348' }
      ]
    },
    {
      id: '2',
      code: 'c-crrm-channel24g-auto',
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
      path: [
        { type: 'system', name: 'vsz6' },
        { type: 'zone', name: 'EDU' }
      ]
    },
    {
      id: '3',
      code: 'c-crrm-channel6g-auto',
      status: 'new',
      createdAt: '2023-06-12T07:05:14.900Z',
      updatedAt: '2023-07-06T06:05:21.004Z',
      sliceType: 'zone',
      sliceValue: 'Deeps Place',
      metadata: {},
      isMuted: true,
      mutedBy: '',
      mutedAt: null,
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
      ]
    }
  ]
}

export const expectedDetailData = {
  recommendation0: {
    appliedTime: '2023-08-13T08:35:47.222Z',
    id: '1',
    code: 'c-crrm-channel5g-auto',
    currentValue: [
      { channelMode: 'CHANNEL_FLY', channelWidth: '_AUTO', autoCellSizing: 'false', radio: '5' }
    ],
    kpi_number_of_interfering_links: {
      current: null,
      previous: 3,
      projected: 1
    },
    metadata: {},
    originalValue: [{ channelMode: null, channelWidth: null, autoCellSizing: null, radio: '5' }],
    recommendedValue: { recommended: 'crrm', txPowerAPCount: 2 },
    statusTrail: [
      { status: 'new', createdAt: '2023-08-14T07:35:47.222Z' },
      { status: 'applied', createdAt: '2023-08-14T08:35:47.222Z' }
    ],
    status: 'applied',
    sliceType: 'zone',
    sliceValue: 'zone-1',
    isMuted: false,
    path: [
      { type: 'system', name: 'vsz611' },
      { type: 'zone', name: 'EDU-MeshZone_S12348' }
    ]
  },
  recommendation1: {
    appliedTime: '2023-08-13T08:35:47.222Z',
    id: '2',
    code: 'c-crrm-channel24g-auto',
    currentValue: [
      { channelMode: 'CHANNEL_FLY', channelWidth: '_AUTO', autoCellSizing: 'false', radio: '2.4' }
    ],
    kpi_number_of_interfering_links: {
      current: 1,
      previous: null,
      projected: 0
    },
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
    originalValue: [{ channelMode: null, channelWidth: null, autoCellSizing: null, radio: '2.4' }],
    recommendedValue: { recommended: 'crrm', txPowerAPCount: 2 },
    statusTrail: [
      { status: 'new', createdAt: '2023-08-13T07:35:47.222Z' },
      { status: 'applied', createdAt: '2023-08-13T08:35:47.222Z' },
      { status: 'revert', createdAt: '2023-08-13T09:35:47.222Z' },
      { status: 'revertfailed', createdAt: '2023-08-13T10:35:47.222Z' }
    ],
    status: 'revertfailed',
    sliceType: 'zone',
    sliceValue: 'zone-2',
    isMuted: false,
    path: [
      { type: 'system', name: 'vsz6' },
      { type: 'zone', name: 'EDU' }
    ]
  },
  recommendation2: {
    appliedTime: null,
    id: '3',
    code: 'c-crrm-channel6g-auto',
    currentValue: [
      { channelMode: 'CHANNEL_FLY', channelWidth: '_AUTO', autoCellSizing: 'false', radio: '6' }
    ],
    kpi_number_of_interfering_links: {
      current: 2,
      previous: null,
      projected: 1
    },
    metadata: {},
    originalValue: [{ channelMode: null, channelWidth: null, autoCellSizing: null, radio: '6' }],
    recommendedValue: { recommended: 'crrm', txPowerAPCount: 2 },
    statusTrail: [
      { status: 'new', createdAt: '2023-08-13T06:35:47.222Z' }
    ],
    status: 'new',
    sliceType: 'zone',
    sliceValue: 'Deeps Place',
    isMuted: false,
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
    ]
  }
}
