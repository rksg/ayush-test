import { CompatibilityEntityTypeEnum }                                                                                                  from '../../../../models/EdgeEnum'
import { EdgeFeatureSets, EdgeServiceCompatibilitiesResponse, EdgeServicesApCompatibilitiesResponse, VenueEdgeCompatibilitiesResponse } from '../../../../types/edge'

export const mockEdgeFeatureCompatibilities: EdgeFeatureSets = {
  featureSets: [
    {
      featureName: 'SD-LAN',
      requiredFw: '2.1.0.600'
    },
    {
      featureName: 'Tunnel Profile',
      requiredFw: '2.1.0.700'
    }
    ,
    {
      featureName: 'HQoS',
      requiredFw: '2.1.0.700'
    }
  ]
}

export const mockEdgeSdLanCompatibilities: EdgeServiceCompatibilitiesResponse = {
  compatibilities: [
    {
      serviceId: 'sdLanService-1',
      clusterEdgeCompatibilities: [
        {
          identityType: CompatibilityEntityTypeEnum.CLUSTER,
          id: 'edgeCluster-1',
          incompatibleFeatures: [
            {
              featureRequirement: {
                featureName: 'SD-LAN',
                requiredFw: '2.1.0.200'
              },
              incompatibleDevices: [
                {
                  firmware: '2.1.0.100',
                  count: 1
                }
              ]
            },
            {
              featureRequirement: {
                featureName: 'Tunnel Profile',
                requiredFw: '2.1.0.400'
              },
              incompatibleDevices: [
                {
                  firmware: '2.1.0.100',
                  count: 1
                },
                {
                  firmware: '2.1.0.300',
                  count: 1
                }
              ]
            }
          ],
          total: 6,
          incompatible: 2
        },
        {
          identityType: CompatibilityEntityTypeEnum.CLUSTER,
          id: 'edgeCluster-3',
          incompatibleFeatures: [
            {
              featureRequirement: {
                featureName: 'SD-LAN',
                requiredFw: '2.1.0.200'
              },
              incompatibleDevices: [
                {
                  firmware: '2.1.0.100',
                  count: 1
                },
                {
                  firmware: '2.1.0.150',
                  count: 3
                }
              ]
            },
            {
              featureRequirement: {
                featureName: 'Tunnel Profile',
                requiredFw: '2.1.0.400'
              },
              incompatibleDevices: [
                {
                  firmware: '2.1.0.100',
                  count: 1
                },
                {
                  firmware: '2.1.0.150',
                  count: 3
                },
                {
                  firmware: '2.1.0.200',
                  count: 1
                }
              ]
            }
          ],
          total: 8,
          incompatible: 5
        }
      ]
    },  // end of service-1
    {
      serviceId: 'sdLanService-2',
      clusterEdgeCompatibilities: [
        {
          identityType: CompatibilityEntityTypeEnum.CLUSTER,
          id: 'edgeCluster-2',
          incompatibleFeatures: [
            {
              featureRequirement: {
                featureName: 'SD-LAN',
                requiredFw: '2.1.0.200'
              },
              incompatibleDevices: [
                {
                  firmware: '2.1.0.100',
                  count: 1
                }
              ]
            },
            {
              featureRequirement: {
                featureName: 'Tunnel Profile',
                requiredFw: '2.1.0.400'
              },
              incompatibleDevices: [
                {
                  firmware: '2.1.0.100',
                  count: 1
                },
                {
                  firmware: '2.1.0.300',
                  count: 1
                }
              ]
            }
          ],
          total: 6,
          incompatible: 2
        }
      ]
    }  // end of service-2
  ]
}

export const mockEdgeHqosCompatibilities: EdgeServiceCompatibilitiesResponse = {
  compatibilities: [
    {
      serviceId: 'testPolicyId',
      clusterEdgeCompatibilities: [
        {
          identityType: CompatibilityEntityTypeEnum.CLUSTER,
          id: 'edgeCluster-1',
          incompatibleFeatures: [
            {
              featureRequirement: {
                featureName: 'HQoS',
                requiredFw: '2.1.0.200'
              },
              incompatibleDevices: [
                {
                  firmware: '2.1.0.100',
                  count: 1
                }
              ]
            }
          ],
          total: 6,
          incompatible: 1
        }
      ]
    }
  ]
}

export const mockEdgeSdLanApCompatibilites: EdgeServicesApCompatibilitiesResponse = {
  compatibilities: [
    {
      serviceId: 'sdLanService-1',
      venueEdgeServiceApCompatibilities: [
        {
          venueId: 'venue-1',
          incompatibleFeatures: [
            {
              featureName: 'SD-LAN',
              requiredFw: '7.0.0.0.234',
              supportedModelFamilies: [
                'WIFI_7'
              ],
              incompatibleDevices: [
                {
                  firmware: '6.2.3.103.233',
                  model: 'R550',
                  count: 1
                }
              ]
            }
          ],
          total: 6,
          incompatible: 1
        },
        {
          venueId: 'venue-3',
          incompatibleFeatures: [
            {
              featureName: 'SD-LAN',
              requiredFw: '7.0.0.0.234',
              supportedModelFamilies: [
                'WIFI_7'
              ],
              incompatibleDevices: [
                {
                  firmware: '6.2.3.103.233',
                  model: 'R550',
                  count: 1
                },
                {
                  firmware: '6.2.3.122.644',
                  model: 'R650',
                  count: 2
                }
              ]
            }
          ],
          total: 10,
          incompatible: 3
        }
      ]
    }
  ]
}

export const mockEdgeCompatibilitiesVenue: VenueEdgeCompatibilitiesResponse ={
  compatibilities: [
    {
      identityType: CompatibilityEntityTypeEnum.VENUE,
      id: 'venue-1',
      incompatibleFeatures: [
        {
          featureRequirement: {
            featureName: 'SD-LAN',
            requiredFw: '2.1.0.200'
          },
          incompatibleDevices: [
            {
              firmware: '2.1.0.100',
              count: 1
            }
          ]
        },
        {
          featureRequirement: {
            featureName: 'Tunnel Profile',
            requiredFw: '2.1.0.400'
          },
          incompatibleDevices: [
            {
              firmware: '2.1.0.100',
              count: 1
            },
            {
              firmware: '2.1.0.300',
              count: 1
            }
          ]
        }
      ],
      total: 6,
      incompatible: 2
    },
    {
      identityType: CompatibilityEntityTypeEnum.VENUE,
      id: 'venue-3',
      incompatibleFeatures: [
        {
          featureRequirement: {
            featureName: 'SD-LAN',
            requiredFw: '2.1.0.200'
          },
          incompatibleDevices: [
            {
              firmware: '2.1.0.100',
              count: 1
            },
            {
              firmware: '2.1.0.150',
              count: 3
            }
          ]
        },
        {
          featureRequirement: {
            featureName: 'Tunnel Profile',
            requiredFw: '2.1.0.400'
          },
          incompatibleDevices: [
            {
              firmware: '2.1.0.100',
              count: 1
            },
            {
              firmware: '2.1.0.150',
              count: 3
            },
            {
              firmware: '2.1.0.200',
              count: 1
            }
          ]
        }
      ],
      total: 8,
      incompatible: 5
    }
  ]
}