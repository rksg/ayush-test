export const mockEdgeMdnsSetting = {
  serviceName: 'edge-mdns-proxy-1',
  forwardingProxyRules: [
    {
      serviceType: 'APPLETV',
      fromVlan: 10,
      toVlan: 200
    },
    {
      serviceType: 'AIRPRINT',
      fromVlan: 33,
      toVlan: 66
    },
    {
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
    forwardingProxyRules: [
      {
        service: 'AIRPLAY',
        fromVlan: 5,
        toVlan: 15
      },
      {
        service: 'OTHER',
        mdnsName: 'test7878',
        mdnsProtocol: 'TCP',
        fromVlan: 19,
        toVlan: 1111
      },
      {
        service: 'APPLE_FILE_SHARING',
        fromVlan: 222,
        toVlan: 70
      }
    ],
    venueInfo: [
      {
        venueId: 'venue-A_id',
        venueName: 'venue-A'
      },
      {
        venueId: 'venue-C_id',
        venueName: 'venue-C'
      }
    ]
  },
  {
    id: 'edgeMdnsProxyId-2',
    name: 'edge-mdns-proxy-name-2',
    forwardingProxyRules: [
      {
        service: 'AIRPLAY',
        fromVlan: 5,
        toVlan: 15
      },
      {
        service: 'OTHER',
        mdnsName: 'test7878',
        mdnsProtocol: 'TCP',
        fromVlan: 19,
        toVlan: 1111
      },
      {
        service: 'APPLE_FILE_SHARING',
        fromVlan: 222,
        toVlan: 70
      }
    ],
    venueInfo: [
      {
        venueId: 'venue-A_id',
        venueName: 'venue-A'
      }
    ]
  }
]