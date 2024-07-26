import { transformNetwork, transVenuesForNetwork } from './networkUtils'
import { BaseNetwork, Network, WifiNetwork }       from './types'

const baseNetwork: BaseNetwork = {
  name: 'Test Network',
  id: 'Test123',
  description: '',
  nwSubType: 'psk',
  ssid: 'Test Network SSID',
  vlan: 0,
  aps: 0,
  clients: 0,
  venues: {
    count: 0,
    names: [],
    ids: []
  }
}

describe('networkUtils', () => {
  describe('transformNetwork', () => {
    it('should return transformed network with default values when input is Network', () => {
      const network: Network = {
        ...baseNetwork
      }

      const transformed = transformNetwork(network)

      expect(transformed).toEqual({
        ...network,
        activated: { isActivated: false }
      })
    })

    it('should return transformed venues when input is WifiNetwork', () => {
      const venueApGroups: WifiNetwork['venueApGroups'] = [
        {
          venueId: 'venue1',
          isAllApGroups: false,
          apGroupIds: []
        },
        {
          venueId: 'venue2',
          isAllApGroups: false,
          apGroupIds: []
        }
      ]

      const transformed = transVenuesForNetwork(venueApGroups)

      expect(transformed).toEqual({
        count: 2,
        names: [],
        ids: ['venue1', 'venue2']
      })
    })

    it('should include children if dsaeOnboardNetwork is present', () => {
      const network: Network = {
        ...baseNetwork,
        dsaeOnboardNetwork: {
          ...baseNetwork,
          name: 'DSAE Network',
          id: 'DSAE123'
        }
      }

      const transformed = transformNetwork(network)

      expect(transformed).toEqual({
        ...network,
        activated: { isActivated: false },
        children: [
          {
            ...network.dsaeOnboardNetwork,
            isOnBoarded: true,
            id: baseNetwork.name + 'onboard'
          }
        ]
      })
    })
  })
})
