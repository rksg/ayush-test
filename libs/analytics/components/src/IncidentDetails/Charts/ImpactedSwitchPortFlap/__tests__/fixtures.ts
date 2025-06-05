export const mockImpactedSwitches = {
  data: {
    incident: {
      impactedSwitches: [{
        name: 'ICX8200-24P Router',
        mac: '38:45:3B:3C:F1:20',
        model: 'ICX8200-24P',
        firmware: 'RDR10020_b237',
        ports: [{
          portNumber: 'LAG1',
          type: 'LAG',
          lastFlapTime: '2024-03-20T10:00:00Z',
          poeOperState: 'Enabled',
          flapVlans: '1,2,3',
          connectedDevice: {
            name: 'Device 1',
            type: 'Switch'
          }
        },
        {
          portNumber: '2/1/20',
          type: 'GigabitEthernet',
          lastFlapTime: '2024-03-20T10:00:00Z',
          poeOperState: 'Disabled',
          flapVlans: '4,5,6',
          connectedDevice: {
            name: 'Device 2',
            type: 'AP'
          }
        }]
      }]
    }
  }
}

export const mockImpactedSwitchesWithUnknown = {
  data: {
    incident: {
      impactedSwitches: [{
        name: 'ICX8200-24P Router',
        mac: '38:45:3B:3C:F1:20',
        model: 'ICX8200-24P',
        firmware: 'RDR10020_b237',
        ports: [{
          portNumber: 'LAG1',
          type: 'LAG',
          lastFlapTime: '2024-03-20T10:00:00Z',
          poeOperState: 'Enabled',
          flapVlans: '1,2,3',
          connectedDevice: {
            port: null,
            type: null
          }
        }]
      }]
    }
  }
}
