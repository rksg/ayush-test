const switchDetails = {
  serial: '',
  model: '',
  status: '',
  firmware: '',
  numOfPorts: 100
}

export const moreDetailsDataFixture = {
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
