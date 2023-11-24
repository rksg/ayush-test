import _ from 'lodash'

export const apNetworkPath = [
  {
    name: 'Network',
    type: 'network'
  },
  {
    name: 'ICXM-Scale',
    type: 'system'
  },
  {
    name: 'SQA Sunnyvale',
    type: 'domain'
  },
  {
    name: 'Sky High Properties',
    type: 'zone'
  },
  {
    name: '2Chambers-Roam',
    type: 'apGroup'
  },
  {
    name: '1C:3A:60:31:8D:A0',
    type: 'AP'
  }
]

export const switchNetworkPath = [
  {
    name: 'Network',
    type: 'network'
  },
  {
    name: 'AISH-vSZ',
    type: 'system'
  },
  {
    name: 'AISH-7.0-SWITCH_7750',
    type: 'switchGroup'
  },
  {
    name: '60:9C:9F:1F:5F:00',
    type: 'switch'
  }
]

export const systems = {
  networkNodes: [{
    deviceId: 'e68b9f11-2266-40a5-8dc0-efd89f59bd0f',
    deviceName: 'AISH-vSZ',
    onboarded: true,
    controllerVersion: '7.0.0.0.458'
  },{
    deviceId: 'd6c06b5f-ece3-4435-94a2-aa401da0faf1',
    deviceName: 'ICXM-Scale',
    onboarded: true,
    controllerVersion: '6.1.1.0.959'
  }],
  switchNodes: []
}
export const systemMap = _.groupBy(systems.networkNodes, 'deviceName')

export const radioBands = ['6','2.4']

export const paths = [
  [{
    type: 'network',
    name: 'Network'
  }, {
    type: 'switchGroup',
    name: 'Switch-Venue'
  }, {
    type: 'switch',
    name: 'C0:C5:20:AA:33:2D'
  }],
  [{
    type: 'network',
    name: 'Network'
  }, {
    type: 'switchGroup',
    name: 'Switch-Venue'
  }, {
    type: 'switch',
    name: 'C0:C5:20:B2:11:59'
  }],
  [{
    type: 'network',
    name: 'Network'
  }, {
    type: 'switchGroup',
    name: 'Switch-Venue1'
  }],
  [{
    type: 'network',
    name: 'Network'
  }, {
    type: 'zone',
    name: 'Sindhuja-Venue'
  }],
  [{
    type: 'network',
    name: 'Network'
  }, {
    type: 'zone',
    name: 'Sonali'
  }, {
    type: 'AP',
    name: '00:0C:29:1E:9F:E4'
  }],
  [{
    type: 'network',
    name: 'Network'
  }, {
    type: 'zone',
    name: 'Sonali'
  }, {
    type: 'AP',
    name: '38:FF:36:13:DB:D0'
  }]
]
