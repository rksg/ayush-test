import { NetworkPath } from '@acx-ui/utils'

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
        },
        {
          key: '23A-IND-BNG-D23-Keshav-Home',
          value: 25,
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