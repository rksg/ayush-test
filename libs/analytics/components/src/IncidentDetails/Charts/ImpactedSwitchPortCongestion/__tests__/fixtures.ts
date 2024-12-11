export const mockImpactedSwitches = {
  data: {
    incident: {
      impactedSwitches: [{
        name: 'ICX8200-24P Router',
        mac: '38:45:3B:3C:F1:20',
        model: 'ICX8200-24P',
        firmware: 'RDR10020_b237',
        ports: [{
          portNumber: '1/2/3',
          connectedDevice: {
            name: 'Device 1'
          }
        },
        {
          portNumber: '2/1/20',
          connectedDevice: {
            name: 'Device 2'
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
          portNumber: '1/2/3',
          connectedDevice: {
            name: 'Unknown'
          }
        }]
      }]
    }
  }
}
