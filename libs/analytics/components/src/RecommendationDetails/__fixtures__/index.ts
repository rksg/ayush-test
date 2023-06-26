import { RecommendationDetails } from '../services'

export const mockedRecommendationPower = {
  id: '30d997ab-2c1d-4002-bac5-75d164c4def9',
  code: 'c-txpower-same',
  status: 'new',
  appliedTime: null,
  originalValue: null,
  currentValue: '_FULL',
  recommendedValue: '_1DB',
  metadata: {},
  sliceType: 'zone',
  sliceValue: '12-US-CA-D12-Guru-Home',
  path: [
    {
      type: 'system',
      name: 'vsz34'
    },
    {
      type: 'domain',
      name: '12-US-CA-D12-Guru-Home'
    },
    {
      type: 'zone',
      name: '12-US-CA-D12-Guru-Home'
    }
  ],
  statusTrail: [
    {
      status: 'new',
      createdAt: '2023-06-25T06:05:13.243Z'
    }
  ],
  kpi_co_channel_interference: {
    current: null,
    previous: null,
    projected: null
  },
  kpi_session_time_on_24_g_hz: {
    current: 0.022116903633491312,
    previous: null,
    projected: null
  }
} as unknown as RecommendationDetails

export const mockedRecommendationCRRM = {
  id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6',
  code: 'c-crrm-channel24g-auto',
  status: 'applyscheduled',
  appliedTime: '2023-06-25T00:00:25.772Z',
  originalValue: [
    {
      channelMode: 'CHANNEL_FLY',
      channelWidth: '_80MHZ',
      radio: '2.4'
    }
  ],
  currentValue: 'crrm',
  recommendedValue: 'crrm',
  metadata: {},
  sliceType: 'zone',
  sliceValue: '21_US_Beta_Samsung',
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
  ],
  statusTrail: [
    {
      status: 'applyscheduled',
      createdAt: '2023-06-26T06:04:52.740Z'
    },
    {
      status: 'applied',
      createdAt: '2023-06-25T00:00:25.772Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-06-25T00:00:03.058Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-06-24T06:05:17.184Z'
    },
    {
      status: 'applied',
      createdAt: '2023-06-23T00:00:22.849Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-06-23T00:00:02.912Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-06-22T06:05:13.203Z'
    },
    {
      status: 'applied',
      createdAt: '2023-06-20T00:00:21.291Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-06-20T00:00:03.512Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-06-19T06:05:08.629Z'
    },
    {
      status: 'applied',
      createdAt: '2023-06-18T00:01:22.227Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-06-18T00:01:01.862Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-06-17T06:05:32.899Z'
    },
    {
      status: 'applied',
      createdAt: '2023-06-16T00:01:27.494Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-06-16T00:01:01.542Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-06-15T06:05:42.872Z'
    },
    {
      status: 'applied',
      createdAt: '2023-06-14T00:00:25.696Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-06-14T00:00:02.853Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-06-13T07:05:08.181Z'
    },
    {
      status: 'applied',
      createdAt: '2023-06-08T00:00:27.294Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-06-08T00:00:02.727Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-06-07T07:05:17.083Z'
    },
    {
      status: 'applied',
      createdAt: '2023-06-06T00:00:27.403Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-06-06T00:00:02.796Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-06-05T07:04:56.729Z'
    },
    {
      status: 'applied',
      createdAt: '2023-06-04T00:01:26.171Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-06-04T00:01:01.867Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-06-03T07:04:41.840Z'
    },
    {
      status: 'applied',
      createdAt: '2023-06-02T00:00:29.477Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-06-02T00:00:02.773Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-06-01T07:04:38.105Z'
    },
    {
      status: 'applied',
      createdAt: '2023-05-31T00:00:24.967Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-05-31T00:00:03.641Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-05-30T07:04:15.963Z'
    },
    {
      status: 'applied',
      createdAt: '2023-05-29T00:01:20.180Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-05-29T00:01:01.747Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-05-28T07:04:18.960Z'
    },
    {
      status: 'applied',
      createdAt: '2023-05-27T00:00:27.395Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-05-27T00:00:03.672Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-05-26T07:04:15.064Z'
    },
    {
      status: 'applied',
      createdAt: '2023-05-23T00:00:35.308Z'
    },
    {
      status: 'applyscheduleinprogress',
      createdAt: '2023-05-23T00:00:02.528Z'
    },
    {
      status: 'applyscheduled',
      createdAt: '2023-05-22T23:30:30.753Z'
    },
    {
      status: 'new',
      createdAt: '2023-05-17T07:04:11.663Z'
    }
  ],
  kpi_number_of_interfering_links: {
    current: 0,
    previous: null,
    projected: 0
  }
} as unknown as RecommendationDetails

export const mockedRecommendationFirmware = {
  id: '5a4c8253-a2cb-485b-aa81-5ec75db9ceaf',
  code: 'i-zonefirmware-upgrade',
  status: 'new',
  appliedTime: null,
  originalValue: null,
  currentValue: '6.1.1.0.1274',
  recommendedValue: '6.1.2',
  metadata: {},
  sliceType: 'zone',
  sliceValue: '39-IND-BDC-D39-Mayank-Ofc-Z2',
  path: [
    {
      type: 'system',
      name: 'vsz34'
    },
    {
      type: 'domain',
      name: '39-IND-BDC-D39-Mayank'
    },
    {
      type: 'zone',
      name: '39-IND-BDC-D39-Mayank-Ofc-Z2'
    }
  ],
  statusTrail: [
    {
      status: 'new',
      createdAt: '2023-06-12T07:05:14.106Z'
    }
  ],
  kpi_aps_on_latest_fw_version: {
    current: [
      0,
      0
    ],
    previous: null,
    projected: null
  }
} as unknown as RecommendationDetails

export const mockedRecommendationApFirmware = [
  {
    name: 'RuckusAP',
    mac: '28:B3:71:27:38:E0',
    model: 'R650',
    version: 'Unknown'
  },
  {
    name: 'RuckusAP',
    mac: 'B4:79:C8:3E:7E:50',
    model: 'R550',
    version: 'Unknown'
  },
  {
    name: 'RuckusAP',
    mac: 'C8:84:8C:3E:46:B0',
    model: 'R560',
    version: 'Unknown'
  }
]
