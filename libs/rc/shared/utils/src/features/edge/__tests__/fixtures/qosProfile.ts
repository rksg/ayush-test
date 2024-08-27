import { EdgeQosTrafficClass, EdgeQosTrafficClassPriority } from '../../../../models'

export const mockTrafficClassSettings = [
  {
    maxBandwidth: 100,
    minBandwidth: 15,
    trafficClass: EdgeQosTrafficClass.VIDEO,
    priority: EdgeQosTrafficClassPriority.HIGH,
    priorityScheduling: true
  },
  {
    maxBandwidth: 100,
    minBandwidth: 5,
    trafficClass: EdgeQosTrafficClass.VIDEO,
    priority: EdgeQosTrafficClassPriority.LOW,
    priorityScheduling: true
  },
  {
    maxBandwidth: 100,
    minBandwidth: 1,
    trafficClass: EdgeQosTrafficClass.VOICE,
    priority: EdgeQosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    maxBandwidth: 100,
    minBandwidth: 5,
    trafficClass: EdgeQosTrafficClass.VOICE,
    priority: EdgeQosTrafficClassPriority.LOW,
    priorityScheduling: false
  },
  {
    maxBandwidth: 100,
    minBandwidth: 20,
    trafficClass: EdgeQosTrafficClass.BEST_EFFORT,
    priority: EdgeQosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    maxBandwidth: 100,
    minBandwidth: 5,
    trafficClass: EdgeQosTrafficClass.BEST_EFFORT,
    priority: EdgeQosTrafficClassPriority.LOW,
    priorityScheduling: false
  },
  {
    maxBandwidth: 100,
    minBandwidth: 10,
    trafficClass: EdgeQosTrafficClass.BACKGROUND,
    priority: EdgeQosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    maxBandwidth: 100,
    minBandwidth: 5,
    trafficClass: EdgeQosTrafficClass.BACKGROUND,
    priority: EdgeQosTrafficClassPriority.LOW,
    priorityScheduling: false
  }
]

export const mockEdgeQosProfileStatusList = {
  fields: null,
  totalCount: 2,
  page: 1,
  data: [
    {
      trafficClassSettings: [
        {
          maxBandwidth: 100,
          minBandwidth: 1,
          trafficClass: EdgeQosTrafficClass.VIDEO,
          priority: EdgeQosTrafficClassPriority.HIGH,
          priorityScheduling: false
        },
        {
          maxBandwidth: 100,
          minBandwidth: 1,
          trafficClass: EdgeQosTrafficClass.VOICE,
          priority: EdgeQosTrafficClassPriority.HIGH,
          priorityScheduling: false
        }
      ],
      tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
      name: 'Test-QoS-1',
      description: 'description',
      id: '3bdd22df-aeab-430a-badd-9a04ae3683f1',
      edgeClusterIds: ['aa05c121-9e9e-4d98-b3b2-84d5acedee1c']
    },
    {
      trafficClassSettings: mockTrafficClassSettings,
      tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
      name: 'Test-QoS-2',
      description: 'des-22',
      id: 'e8c3d230-fa19-4841-96d2-c5ab6b311d93',
      edgeClusterIds: []
    }
  ]
}