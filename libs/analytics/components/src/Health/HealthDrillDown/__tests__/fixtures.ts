import { NetworkPath } from '@acx-ui/utils'

export const mockConnectionDrillDown = {
  network: {
    connectionDrilldown: {
      assocSuccessAndAttemptCount: [[24, 25]],
      authSuccessAndAttemptCount: [[54, 54]],
      eapSuccessAndAttemptCount: [[25, 27]],
      radiusSuccessAndAttemptCount: [[0, 2]],
      dhcpSuccessAndAttemptCount: [[972, 980]]
    }
  }
}

export const mockTtcDrillDown = {
  network: {
    hierarchyNode: {
      ttcDrilldown: {
        ttcByFailureTypes: {
          ttcByEap: [
            26.81081081081081
          ],
          ttcByDhcp: [
            115.70270270270271
          ],
          ttcByAuth: [
            15.08108108108108
          ],
          ttcByAssoc: [
            16.243243243243242
          ],
          ttcByRadius: [
            244.2972972972973
          ]
        }
      }
    }
  }
}
export const mockImpactedClient = {
  network: {
    hierarchyNode: {
      impactedClients: [
        {
          mac: 'D0:C6:37:D7:52:80',
          manufacturer: 'Intel Corporate',
          ssid: 'Divya_1_hour',
          hostname: 'DESKTOP-K1PAM9U',
          username: 'DPSK_User_8709'
        },
        {
          mac: 'D0:C6:37:D7:52:80',
          manufacturer: 'Intel Corporate',
          ssid: 'Divya_tomorrow',
          hostname: 'DESKTOP-K1PAM9U',
          username: 'DPSK_User_8709'
        }
      ]
    }
  }
}


export const mockConnectionFailureResponse = {
  network: {
    hierarchyNode: {
      nodes: [
        {
          key: '01-Alethea-WiCheck Test',
          value: 379,
          name: null
        },
        { key: 'AlphaNet_5_1',
          value: 350,
          name: null
        },
        {
          key: 'Default Zone',
          value: 211,
          name: null
        },
        {
          key: '22-US-CA-Z22-Aaron-Home',
          value: 77,
          name: null
        },
        {
          key: 'Fong@Home',
          value: 60,
          name: null
        }
      ],
      wlans: [
        {
          key: 'HD_OTA_WPA3_6E',
          value: 379
        },
        {
          key: 'DENSITY',
          value: 238
        },
        {
          key: 'DENSITY-COMMSCOPE',
          value: 175
        },
        {
          key: 'DENSITY-GUEST',
          value: 111
        },
        {
          key: 'aaron',
          value: 56
        },
        {
          key: 'FONGDSL',
          value: 47
        }
      ]
    }
  }
}

export const mockTtcResponse = {
  network: {
    hierarchyNode: {
      nodes: [
        {
          key: '22-US-CA-Z22-Aaron-Home',
          value: 310.1302200269421,
          name: null
        }
      ],
      wlans: [
        {
          key: 'aaron-dot1x',
          value: 1295.797373358349
        }
      ]
    }
  }
}

export const mockOnlyWlansResponse = {
  network: {
    hierarchyNode: {
      wlans: [
        {
          key: 'aaron-dot1x',
          value: 1295.797373358349
        }
      ]
    }
  }
}

export const mockPathWithAp: NetworkPath = [
  {
    type: 'network',
    name: 'Network'
  },
  {
    type: 'zone',
    name: '23SRAM-IND-BNG-D23-Keshav-Home'
  },
  {
    type: 'apGroup',
    name: 'default'
  },
  {
    type: 'AP',
    name: 'EC:8C:A2:17:AB:20'
  }
]

