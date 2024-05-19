const switchId = {
  mac: 'mac1',
  name: 'switch1'
}
const switchDetails = {
  ...switchId,
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
        cpuUtilization: 80
      }],
      topNSwitchesByDhcpFailure: [{
        ...switchDetails,
        dhcpFailureCount: 70
      }],
      topNSwitchesByPortCongestion: [{
        ...switchId,
        congestedPortCount: 70
      }],
      topNSwitchesByStormPortCount: [{
        ...switchId,
        stormPortCount: 80
      }]
    }
  }
}

