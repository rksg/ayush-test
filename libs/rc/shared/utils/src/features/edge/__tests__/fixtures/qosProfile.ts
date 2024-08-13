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
          trafficClass: 'VIDEO',
          priority: 'HIGH',
          priorityScheduling: false
        },
        {
          maxBandwidth: 100,
          minBandwidth: 1,
          trafficClass: 'VOICE',
          priority: 'HIGH',
          priorityScheduling: false
        }
      ],
      tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
      name: 'Test-QoS-1',
      description: 'description',
      id: '3bdd22df-aeab-430a-badd-9a04ae3683f1',
      edgeClusterIds: []
    },
    {
      trafficClassSettings: [
        {
          maxBandwidth: 100,
          minBandwidth: 15,
          trafficClass: 'VIDEO',
          priority: 'HIGH',
          priorityScheduling: false
        },
        {
          maxBandwidth: 100,
          minBandwidth: 5,
          trafficClass: 'VIDEO',
          priority: 'LOW',
          priorityScheduling: false
        },
        {
          maxBandwidth: 100,
          minBandwidth: 1,
          trafficClass: 'VOICE',
          priority: 'HIGH',
          priorityScheduling: false
        },
        {
          maxBandwidth: 100,
          minBandwidth: 5,
          trafficClass: 'VOICE',
          priority: 'LOW',
          priorityScheduling: false
        },
        {
          maxBandwidth: 100,
          minBandwidth: 20,
          trafficClass: 'BEST_EFFORT',
          priority: 'HIGH',
          priorityScheduling: false
        },
        {
          maxBandwidth: 100,
          minBandwidth: 5,
          trafficClass: 'BEST_EFFORT',
          priority: 'LOW',
          priorityScheduling: false
        },
        {
          maxBandwidth: 100,
          minBandwidth: 10,
          trafficClass: 'BACKGROUND',
          priority: 'HIGH',
          priorityScheduling: false
        },
        {
          maxBandwidth: 100,
          minBandwidth: 5,
          trafficClass: 'BACKGROUND',
          priority: 'LOW',
          priorityScheduling: false
        }
      ],
      tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
      name: 'Test-QoS-2',
      description: 'des-22',
      id: 'e8c3d230-fa19-4841-96d2-c5ab6b311d93',
      edgeClusterIds: []
    }
  ]
}