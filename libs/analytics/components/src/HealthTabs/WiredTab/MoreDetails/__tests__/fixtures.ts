export const moreDetailsNoDataFixture = {
  network: {
    hierarchyNode: {
      topNSwitchesByCpuUsage: {
        mac: 'mac1',
        cpuUtilization: 0,
        name: '',
        serial: '',
        model: '',
        status: '',
        firmware: '',
        numOfPorts: 0
      },
      topNSwitchesByDhcpFailure: {
        mac: 'mac1',
        dhcpFailureCount: 0,
        name: '',
        serial: '',
        model: '',
        status: '',
        firmware: '',
        numOfPorts: 0
      }
    }
  }
}

export const moreDetailsDataFixture = {
  network: {
    hierarchyNode: {
      topNSwitchesByCpuUsage: {
        mac: 'mac1',
        cpuUtilization: 80,
        name: 'switch1',
        serial: '',
        model: '',
        status: '',
        firmware: '',
        numOfPorts: 100
      },
      topNSwitchesByDhcpFailure: {
        mac: 'mac1',
        dhcpFailureCount: 70,
        name: 'switch1',
        serial: '',
        model: '',
        status: '',
        firmware: '',
        numOfPorts: 100
      }
    }
  }
}

