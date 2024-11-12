import { PieChartResult } from '../config'

const switchDetails = {
  serial: '',
  model: '',
  status: '',
  firmware: '',
  numOfPorts: 100
}

export const moreDetailsDataFixture: { network: { hierarchyNode: PieChartResult } } = {
  network: {
    hierarchyNode: {
      topNSwitchesByCpuUsage: [{
        ...switchDetails,
        mac: 'mac1',
        cpuUtilization: 80,
        name: 'switch1-cpuUsage'
      }],
      topNSwitchesByDhcpFailure: [{
        ...switchDetails,
        mac: 'mac1',
        dhcpFailureCount: 70,
        name: 'switch1-dhcpFailure'
      }],
      topNSwitchesByPortCongestion: [{
        mac: 'mac1',
        congestedPortCount: 70,
        name: 'switch1-congestion'
      }],
      topNSwitchesByStormPortCount: [{
        mac: 'mac1',
        stormPortCount: 70,
        name: 'switch1-portStorm'
      }]
    }
  }
}

export const noDataFixture = {
  network: {
    hierarchyNode: {
      topNSwitchesByCpuUsage: [],
      topNSwitchesByDhcpFailure: [],
      topNSwitchesByPortCongestion: [],
      topNSwitchesByStormPortCount: []
    }
  }
}

export const impactedClientsData = {
  network: {
    hierarchyNode: {
      wiredDevicesExpCongestion: [
        {
          switchName: 'ICX8200-C08ZP Router',
          switchId: '94:B3:4F:2F:7D:0A',
          deviceName: 'ICX7650-48ZP Router',
          deviceMac: 'D4:C1:9E:14:C3:AF',
          devicePort: 'GigabitEthernet1/1/23',
          devicePortMac: 'D4:C1:9E:14:C3:AF',
          devicePortType: 'Bridge, Router',
          isRuckusAp: false,
          localPortName: '2.5GigabitEthernet1/1/1',
          metricValue: '70.35',
          metricName: 'congestion'
        }
      ],
      wiredDevicesExpStorm: [
        {
          switchName: 'ICX8200-48PF Router',
          switchId: '94:B3:4F:2F:C6:4E',
          deviceName: 'ICX7450-32ZP Router',
          deviceMac: '60:9C:9F:1D:D3:30',
          devicePort: 'GigabitEthernet1/1/1',
          devicePortMac: '60:9C:9F:1D:D3:30',
          devicePortType: 'Bridge, Router',
          isRuckusAp: false,
          localPortName: 'GigabitEthernet1/1/1',
          metricValue: 1057421,
          metricName: 'storm'
        }
      ]
    }
  }
}

export const emptyImpactedClientsData = {
  network: {
    hierarchyNode: {
      wiredDevicesExpCongestion: [],
      wiredDevicesExpStorm: []
    }
  }
}
