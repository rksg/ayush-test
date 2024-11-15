export const mockEdgeMdnsSetting = {
  name: 'edge-mdns-proxy-1',
  forwardingRules: [
    {
      ruleIndex: 0,
      serviceType: 'APPLETV',
      fromVlan: 10,
      toVlan: 200
    },
    {
      ruleIndex: 1,
      serviceType: 'AIRPRINT',
      fromVlan: 33,
      toVlan: 66
    },
    {
      ruleIndex: 2,
      serviceType: 'OTHER',
      mdnsName: 'testCXCX',
      mdnsProtocol: 'TCP',
      fromVlan: 5,
      toVlan: 120
    }
  ]
}

export const mockEdgeMdnsViewDataList = [
  {
    id: 'edgeMdnsProxyId-1',
    name: 'edge-mdns-proxy-name-1',
    forwardingRules: [
      {
        ruleIndex: 0,
        service: 'APPLETV',
        fromVlan: 10,
        toVlan: 200
      },
      {
        ruleIndex: 1,
        service: 'AIRPRINT',
        fromVlan: 33,
        toVlan: 66
      },
      {
        ruleIndex: 2,
        service: 'OTHER',
        mdnsName: 'testCXCX',
        mdnsProtocol: 'TCP',
        fromVlan: 5,
        toVlan: 120
      }
    ],
    activations: [
      {
        venueId: 'mock_venue_1',
        venueName: 'Mock Venue 1',
        edgeClusterId: 'clusterId_1',
        edgeClusterName: 'Edge Cluster 1'
      },
      {
        venueId: 'mock_venue_3',
        venueName: 'Mock Venue 3',
        edgeClusterId: 'clusterId_3',
        edgeClusterName: 'Edge Cluster 3'
      }
    ]
  },
  {
    id: 'edgeMdnsProxyId-2',
    name: 'edge-mdns-proxy-name-2',
    forwardingRules: [
      {
        ruleIndex: 0,
        service: 'AIRPLAY',
        fromVlan: 5,
        toVlan: 15
      },
      {
        ruleIndex: 1,
        service: 'OTHER',
        mdnsName: 'test7878',
        mdnsProtocol: 'TCP',
        fromVlan: 19,
        toVlan: 1111
      },
      {
        ruleIndex: 2,
        service: 'APPLE_FILE_SHARING',
        fromVlan: 222,
        toVlan: 70
      }
    ],
    activations: [
      {
        venueId: 'mock_venue_1',
        venueName: 'Mock Venue 1',
        edgeClusterId: 'clusterId_2',
        edgeClusterName: 'Edge Cluster 2'
      }
    ]
  }
]

export const mockEdgeMdnsStatsList = [{
  clusterId: 'clusterId_1',
  rxPackets: 493,
  rxBytes: 159,
  txPackets: 233,
  txBytes: 234,
  numRequest: 124,
  numResponse: 544,
  discoveredMdnsServices: [
    { mdnsStr: 'AppleTV' }
  ]
},
{
  clusterId: 'clusterId_1',
  rxPackets: 435,
  rxBytes: 211,
  txPackets: 111,
  txBytes: 234,
  numRequest: 66,
  numResponse: 234,
  discoveredMdnsServices: [
    { mdnsStr: 'AppleTV' },
    { mdnsStr: 'AirDrop' }
  ]
}]