import { cloneDeep } from 'lodash'

import { IncompatibilityFeatures }       from '../../../../models/CompatibilityEnum'
import { CompatibilityEntityTypeEnum }   from '../../../../models/EdgeEnum'
import {
  EdgeFeatureSets,
  EdgeFeatureSetsV1_1,
  EdgeSdLanApCompatibilitiesResponse,
  EdgeServiceCompatibilitiesResponse,
  EdgeServiceCompatibilitiesResponseV1_1,
  EdgeServicesApCompatibilitiesResponse,
  VenueEdgeCompatibilitiesResponse,
  VenueEdgeCompatibilitiesResponseV1_1
} from '../../../../types/edge'
import { IncompatibleFeatureLevelEnum, IncompatibleFeatureTypeEnum } from '../../../../types/venue'

export const mockEdgeFeatureCompatibilities: EdgeFeatureSets = {
  featureSets: [
    {
      featureName: 'SD-LAN',
      requiredFw: '2.1.0.600'
    }, {
      featureName: 'Tunnel Profile',
      requiredFw: '2.1.0.700'
    }, {
      featureName: 'HQoS',
      requiredFw: '2.1.0.700'
    }, {
      featureName: 'PIN',
      requiredFw: '2.2.0.1'
    }
  ]
}

export const mockEdgeFeatureCompatibilitiesV1_1: EdgeFeatureSetsV1_1 = {
  featureSets: [
    {
      featureName: 'SD-LAN',
      requirements: [
        {
          firmware: '2.1.0.1'
        }
      ],
      featureType: IncompatibleFeatureTypeEnum.EDGE,
      featureLevel: 'CLUSTER'
    },
    {
      featureName: 'Tunnel Profile',
      featureGroup: 'Tunnel Profile',
      requirements: [
        {
          firmware: '2.1.0.1'
        }
      ],
      featureType: IncompatibleFeatureTypeEnum.EDGE,
      featureLevel: 'CLUSTER'
    },
    {
      featureName: 'HQoS',
      requirements: [
        {
          firmware: '2.3.0.1'
        }
      ],
      featureType: IncompatibleFeatureTypeEnum.EDGE,
      featureLevel: 'CLUSTER'
    },
    {
      featureName: 'NAT Traversal',
      featureGroup: 'Tunnel Profile',
      requirements: [
        {
          firmware: '2.3.0.1'
        }
      ],
      featureType: IncompatibleFeatureTypeEnum.EDGE,
      featureLevel: 'CLUSTER'
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

export const mockEdgeSdLanCompatibilitiesV1_1: EdgeServiceCompatibilitiesResponseV1_1 = {
  compatibilities: [
    {
      serviceId: 'sdLanService-1',
      clusterEdgeCompatibilities: [
        {
          identityType: CompatibilityEntityTypeEnum.CLUSTER,
          id: 'edgeCluster-1',
          incompatibleFeatures: [
            {
              featureName: 'SD-LAN',
              featureType: IncompatibleFeatureTypeEnum.EDGE,
              featureLevel: 'CLUSTER',
              requirements: [
                {
                  firmware: '2.1.0.200'
                }
              ],
              incompatibleDevices: [
                {
                  firmware: '2.1.0.100',
                  count: 1
                }
              ]
            },
            {
              featureName: 'Tunnel Profile',
              featureGroup: 'Tunnel Profile',
              featureType: IncompatibleFeatureTypeEnum.EDGE,
              featureLevel: 'CLUSTER',
              requirements: [
                {
                  firmware: '2.1.0.400'
                }
              ],
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
            },
            {
              featureName: 'NAT Traversal',
              featureGroup: 'Tunnel Profile',
              featureType: IncompatibleFeatureTypeEnum.EDGE,
              featureLevel: 'CLUSTER',
              requirements: [
                {
                  firmware: '2.3.0.100'
                }
              ],
              incompatibleDevices: [
                {
                  firmware: '2.1.0.100',
                  count: 1
                },
                {
                  firmware: '2.1.0.300',
                  count: 1
                },
                {
                  firmware: '2.2.0.500',
                  count: 1
                }
              ]
            }
          ],
          total: 6,
          incompatible: 3
        },
        {
          identityType: CompatibilityEntityTypeEnum.CLUSTER,
          id: 'edgeCluster-3',
          incompatibleFeatures: [
            {
              featureName: 'NAT Traversal',
              featureGroup: 'Tunnel Profile',
              featureType: IncompatibleFeatureTypeEnum.EDGE,
              featureLevel: 'CLUSTER',
              requirements: [
                {
                  firmware: '2.3.0.100'
                }
              ],
              incompatibleDevices: [
                {
                  firmware: '2.2.0.800',
                  count: 2
                }
              ]
            }
          ],
          total: 4,
          incompatible: 2
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
              featureName: 'SD-LAN',
              featureType: IncompatibleFeatureTypeEnum.EDGE,
              featureLevel: 'CLUSTER',
              requirements: [
                {
                  firmware: '2.1.0.200'
                }
              ],
              incompatibleDevices: [
                {
                  firmware: '2.1.0.100',
                  count: 2
                }
              ]
            },
            {
              featureName: 'Tunnel Profile',
              featureGroup: 'Tunnel Profile',
              featureType: IncompatibleFeatureTypeEnum.EDGE,
              featureLevel: 'CLUSTER',
              requirements: [
                {
                  firmware: '2.1.0.400'
                }
              ],
              incompatibleDevices: [
                {
                  firmware: '2.1.0.100',
                  count: 2
                },
                {
                  firmware: '2.1.0.300',
                  count: 1
                }
              ]
            }
          ],
          total: 6,
          incompatible: 3
        }
      ]
    }  // end of service-2
  ]
}

export const mockEdgePinCompatibilities = cloneDeep(mockEdgeSdLanCompatibilities)
mockEdgePinCompatibilities.compatibilities?.forEach((item, idx) => {
  item.serviceId = `pin-${idx+1}`
  item.clusterEdgeCompatibilities?.forEach(item2 => {
    item2.incompatibleFeatures.forEach((f) => {
      if (f.featureRequirement.featureName === IncompatibilityFeatures.SD_LAN)
        f.featureRequirement.featureName = IncompatibilityFeatures.PIN
    })
  })
})

export const mockEdgeMdnsCompatibilities = {
  compatibilities: [
    {
      serviceId: 'mdns-1',
      clusterEdgeCompatibilities: [
        {
          identityType: CompatibilityEntityTypeEnum.CLUSTER,
          id: 'edgeCluster-1',
          incompatibleFeatures: [
            {
              featureRequirement: {
                featureName: IncompatibilityFeatures.EDGE_MDNS_PROXY,
                requiredFw: '2.3.0.1'
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
          incompatible: 2
        },
        {
          identityType: CompatibilityEntityTypeEnum.CLUSTER,
          id: 'edgeCluster-3',
          incompatibleFeatures: [
            {
              featureRequirement: {
                featureName: IncompatibilityFeatures.EDGE_MDNS_PROXY,
                requiredFw: '2.3.0.1'
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
            }
          ],
          total: 8,
          incompatible: 5
        }
      ]
    },  // end of service-1
    {
      serviceId: 'mdns-2',
      clusterEdgeCompatibilities: [
        {
          identityType: CompatibilityEntityTypeEnum.CLUSTER,
          id: 'edgeCluster-2',
          incompatibleFeatures: [
            {
              featureRequirement: {
                featureName: IncompatibilityFeatures.EDGE_MDNS_PROXY,
                requiredFw: '2.3.0.1'
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

export const mockEdgeHqosCompatibilitiesV1_1: EdgeServiceCompatibilitiesResponseV1_1 = {
  compatibilities: [
    {
      serviceId: 'testPolicyId',
      clusterEdgeCompatibilities: [
        {
          identityType: CompatibilityEntityTypeEnum.CLUSTER,
          id: 'edgeCluster-1',
          incompatibleFeatures: [
            {
              featureName: 'HQoS',
              featureType: IncompatibleFeatureTypeEnum.EDGE,
              featureLevel: 'CLUSTER',
              requirements: [
                {
                  firmware: '2.1.0.200'
                }
              ],
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

export const mockEdgeDhcpCompatibilities: EdgeServiceCompatibilitiesResponse = {
  compatibilities: [
    {
      serviceId: '1',
      clusterEdgeCompatibilities: [
        {
          identityType: CompatibilityEntityTypeEnum.CLUSTER,
          id: 'edgeCluster-1',
          incompatibleFeatures: [
            {
              featureRequirement: {
                featureName: 'DHCP',
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

export const mockEdgeSdLanApCompatibilites: EdgeSdLanApCompatibilitiesResponse = {
  compatibilities: [
    {
      serviceId: 'sdLanService-1',
      venueSdLanApCompatibilities: [
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


export const mockEdgePinApCompatibilites: EdgeServicesApCompatibilitiesResponse = {
  compatibilities: [
    {
      serviceId: 'pinService-1',
      venueEdgeServiceApCompatibilities: [
        {
          incompatibleFeatures: [
            {
              featureName: 'PIN',
              requirements: [
                {
                  firmware: '7.0.0.200.6407',
                  models: [
                    'R750',
                    'T750SE',
                    'H670',
                    'H350',
                    'R850',
                    'H550',
                    'R350:R350E',
                    'T350SE',
                    'R550',
                    'R770',
                    'R650',
                    'T750',
                    'R760',
                    'R350',
                    'R560',
                    'R670',
                    'T670',
                    'T350D',
                    'T350C',
                    'T670SN'
                  ]
                }
              ],
              featureType: IncompatibleFeatureTypeEnum.EDGE,
              featureLevel: IncompatibleFeatureLevelEnum.VENUE,
              incompatibleDevices: [
                {
                  firmware: '6.2.3.103.233',
                  model: 'R720',
                  count: 1
                }
              ]
            },
            {
              featureName: 'Tunnel Profile',
              requirements: [
                {
                  firmware: '7.0.0.200.6407',
                  models: [
                    'R750',
                    'T750SE',
                    'H670',
                    'H350',
                    'R850',
                    'H550',
                    'R350:R350E',
                    'T350SE',
                    'R550',
                    'R770',
                    'R650',
                    'T750',
                    'R760',
                    'R350',
                    'R560',
                    'R670',
                    'T670',
                    'T350D',
                    'T350C',
                    'T670SN'
                  ]
                }
              ],
              featureType: IncompatibleFeatureTypeEnum.EDGE,
              featureLevel: IncompatibleFeatureLevelEnum.VENUE,
              incompatibleDevices: [
                {
                  firmware: '6.2.3.103.233',
                  model: 'R720',
                  count: 1
                }
              ]
            }
          ],
          total: 1,
          incompatible: 1,
          venueId: 'venue-1'
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

export const mockEdgeCompatibilitiesVenueV1_1: VenueEdgeCompatibilitiesResponseV1_1 ={
  compatibilities: [
    {
      identityType: CompatibilityEntityTypeEnum.VENUE,
      id: 'venue-1',
      incompatibleFeatures: [
        {
          featureName: 'SD-LAN',
          featureType: IncompatibleFeatureTypeEnum.EDGE,
          featureLevel: 'CLUSTER',
          requirements: [
            {
              firmware: '2.1.0.200'
            }
          ],
          incompatibleDevices: [
            {
              firmware: '2.1.0.100',
              count: 1
            }
          ]
        },
        {
          featureName: 'Tunnel Profile',
          featureGroup: 'Tunnel Profile',
          featureType: IncompatibleFeatureTypeEnum.EDGE,
          featureLevel: 'CLUSTER',
          requirements: [
            {
              firmware: '2.1.0.400'
            }
          ],
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
          featureName: 'SD-LAN',
          featureType: IncompatibleFeatureTypeEnum.EDGE,
          featureLevel: 'CLUSTER',
          requirements: [
            {
              firmware: '2.1.0.200'
            }
          ],
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
          featureName: 'Tunnel Profile',
          featureGroup: 'Tunnel Profile',
          featureType: IncompatibleFeatureTypeEnum.EDGE,
          featureLevel: 'CLUSTER',
          requirements: [
            {
              firmware: '2.1.0.400'
            }
          ],
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