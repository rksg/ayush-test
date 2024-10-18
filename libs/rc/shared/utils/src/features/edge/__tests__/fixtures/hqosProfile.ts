import { EdgeHqosTrafficClass, EdgeHqosTrafficClassPriority } from '../../../../models'

export const mockTrafficClassSettings = [
  {
    maxBandwidth: 100,
    minBandwidth: 15,
    trafficClass: EdgeHqosTrafficClass.VIDEO,
    priority: EdgeHqosTrafficClassPriority.HIGH,
    priorityScheduling: true
  },
  {
    maxBandwidth: 100,
    minBandwidth: 5,
    trafficClass: EdgeHqosTrafficClass.VIDEO,
    priority: EdgeHqosTrafficClassPriority.LOW,
    priorityScheduling: true
  },
  {
    maxBandwidth: 100,
    minBandwidth: 1,
    trafficClass: EdgeHqosTrafficClass.VOICE,
    priority: EdgeHqosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    maxBandwidth: 100,
    minBandwidth: 5,
    trafficClass: EdgeHqosTrafficClass.VOICE,
    priority: EdgeHqosTrafficClassPriority.LOW,
    priorityScheduling: false
  },
  {
    maxBandwidth: 100,
    minBandwidth: 20,
    trafficClass: EdgeHqosTrafficClass.BEST_EFFORT,
    priority: EdgeHqosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    maxBandwidth: 100,
    minBandwidth: 5,
    trafficClass: EdgeHqosTrafficClass.BEST_EFFORT,
    priority: EdgeHqosTrafficClassPriority.LOW,
    priorityScheduling: false
  },
  {
    maxBandwidth: 100,
    minBandwidth: 10,
    trafficClass: EdgeHqosTrafficClass.BACKGROUND,
    priority: EdgeHqosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    maxBandwidth: 100,
    minBandwidth: 5,
    trafficClass: EdgeHqosTrafficClass.BACKGROUND,
    priority: EdgeHqosTrafficClassPriority.LOW,
    priorityScheduling: false
  }
]

export const mockEdgeHqosData = {
  trafficClassSettings: mockTrafficClassSettings,
  name: 'Test-QoS-1',
  description: 'description'
}

export const mockEdgeHqosProfileStatusList = {
  fields: null,
  totalCount: 2,
  page: 1,
  data: [
    {
      trafficClassSettings: [
        {
          maxBandwidth: 100,
          minBandwidth: 1,
          trafficClass: EdgeHqosTrafficClass.VIDEO,
          priority: EdgeHqosTrafficClassPriority.HIGH,
          priorityScheduling: false
        },
        {
          maxBandwidth: 100,
          minBandwidth: 1,
          trafficClass: EdgeHqosTrafficClass.VOICE,
          priority: EdgeHqosTrafficClassPriority.HIGH,
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