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
