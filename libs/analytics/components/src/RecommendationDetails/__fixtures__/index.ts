export const testDataCRRM = {
  id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6',
  code: 'c-crrm-channel24g-auto',
  status: 'applyscheduled',
  createdAt: '2023-05-17T07:04:11.663Z',
  updatedAt: '2023-06-15T06:05:52.707Z',
  sliceType: 'zone',
  sliceValue: '21_US_Beta_Samsung',
  metadata: {
    scheduledAt: '2023-06-16T00:00:00.000Z',
    scheduledBy: '0032h00000cJeQcAAK',
    algorithmData: {
      zoneCCIR: 0,
      channelPlan: [
        {
          apMac: '28:B3:71:1A:44:20',
          radio: 0,
          channel: 6,
          txPower: 'NA',
          channelRange: [
            1,
            11,
            6
          ],
          channelWidth: 20,
          apRadioDeploy: '2-5'
        },
        {
          apMac: '94:B3:4F:1A:B5:C0',
          radio: 0,
          channel: 1,
          txPower: 'NA',
          channelRange: [
            1,
            11,
            6
          ],
          channelWidth: 20,
          apRadioDeploy: '2-5-6'
        }
      ],
      zoneCoChannelPeerCount: 0,
      zoneCurrentCoChannelPeer: []
    },
    config_backup: {
      is_rogue_on: false,
      backup_plans: [
        {
          apMac: '28:B3:71:1A:44:20',
          radio: 0,
          apName: 'R550-with-Attenuator',
          channel: 1,
          configKey: 'radio24g',
          channelRange: [
            1,
            6,
            11
          ],
          channelWidth: 0
        }
      ]
    }
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
      name: '21_US_Beta_Samsung'
    },
    {
      type: 'zone',
      name: '21_US_Beta_Samsung'
    }
  ]
}

export const testData = {
  id: '17fe3397-ba85-4695-a678-719c4bc87ca1',
  code: 'c-txpower-same',
  status: 'new',
  createdAt: '2023-06-12T07:05:13.804Z',
  updatedAt: '2023-06-15T06:05:42.033Z',
  sliceType: 'zone',
  sliceValue: 'CHETHAN-HOME',
  metadata: {},
  isMuted: true,
  mutedBy: 'Chris Chia',
  mutedAt: '2022-10-27T03:39:38.673Z',
  path: [
    {
      type: 'system',
      name: 'vsz34'
    },
    {
      type: 'domain',
      name: '52-IN-BDC-Analytics-CK'
    },
    {
      type: 'zone',
      name: 'CHETHAN-HOME'
    }
  ]
}

export const recommendationDetailsMock = {
  id: '11461d57-b29f-4236-8c91-d7995ff420e5',
  code: 'c-bandbalancing-enable',
  status: 'new',
  appliedTime: null,
  originalValue: null,
  currentValue: null,
  recommendedValue: true,
  metadata: {},
  sliceType: 'zone',
  sliceValue: 'Albert-Mesh-Testing',
  path: [
    {
      type: 'system',
      name: 'vsz34'
    },
    {
      type: 'domain',
      name: '04-US-CA-D4-Albert-Home'
    },
    {
      type: 'zone',
      name: 'Albert-Mesh-Testing'
    }
  ],
  statusTrail: [
    {
      status: 'new',
      createdAt: '2023-06-12T07:05:14.850Z'
    }
  ],
  kpi_client_ratio: {
    current: 0.875,
    previous: null,
    projected: null
  }
}