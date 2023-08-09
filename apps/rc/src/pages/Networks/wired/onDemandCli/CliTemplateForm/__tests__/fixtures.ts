export const venues = [
  { id: 'a98653366d2240b9ae370e48fab3a9a1', name: 'My-Venue', operationalSwitches: 2 },
  { id: 'f8da55210928402fa5a470642d80de53', name: 'test1', operationalSwitches: 0 },
  { id: '952a2f97316f43928ee0e16e669a6d4d', name: 'test2', operationalSwitches: 0 },
  { id: '9417693931ab409ca41ecf9b36f516be', name: 'test3', operationalSwitches: 1 }
]

export const templates = [{
  applyLater: true,
  cli: `\nmanager active-list {ip-address} [ip-address2] [ip-address3]\ncvcvx
    vcxv cxcxc\nip arp inspection vlan\nxvxcv\n\n\nxcvcxv\n\nxcvcxvcxvdfrdsfsdf`,
  id: 'f14c4116e30743bfa3180ba4b68cd069',
  name: 'testtt',
  reload: true,
  variables: [{ name: 'test', type: 'RANGE', value: '3:44'
  }, {
    name: 'testaaa', type: 'STRING', value: 'aaaa'
  }],
  venueSwitches: [{
    id: 'c6ebc5ab30ea4b589ad2adecc85a954e',
    venueId: 'a98653366d2240b9ae370e48fab3a9a1'
  }]
}, {
  applyLater: true,
  cli: 'sddsad',
  id: 'db0180850a134517bcfbd7b3dbf3343e',
  name: 'test3',
  reload: true
}]

export const configExamples = [{
  cli: 'manager active-list {ip-address} [ip-address2] [ip-address3]',
  id: 'e47a1f62-bbc6-42ba-9809-edeb37e5cc92',
  name: '(Required) manager active-list',
  version: '1'
}, {
  cli: 'ip arp inspection vlan <vlan_id_number1> <vlan_id_number2> ...',
  id: '87009cda-93c5-45b3-96d7-33be283903ef',
  name: 'ARP inspection',
  version: '1'
}]

export const switchlist = [{
  configReady: true,
  formStacking: true,
  id: '58:fb:96:0e:82:8a',
  isStack: true,
  model: 'ICX7150-C12P',
  name: '7150stack',
  serialNumber: 'FEK3230S0A0',
  switchName: '7150stack',
  syncDataEndTime: '',
  syncedSwitchConfig: true,
  uptime: '6 days, 12 hours',
  venueId: 'a98653366d2240b9ae370e48fab3a9a1',
  venueName: 'My-Venue'
}, {
  configReady: true,
  formStacking: false,
  id: 'c0:c5:20:aa:32:79',
  isStack: false,
  model: 'ICX7150-C12P',
  name: 'FEK3224R0AG',
  serialNumber: 'FEK3224R0AG',
  switchName: 'FEK3224R0AG',
  syncDataEndTime: '',
  syncedSwitchConfig: true,
  uptime: '22 days, 12 hours',
  venueId: 'a98653366d2240b9ae370e48fab3a9a1',
  venueName: 'My-Venue'
}]

export const cliTemplate = {
  applyLater: true,
  cli: 'test CLI commands ${test}',
  id: 'f14c4116e30743bfa3180ba4b68cd069',
  name: 'testtt',
  reload: true,
  variables: [{
    name: 'testaaa', type: 'STRING', value: 'aaaa'
  }, {
    name: 'test', type: 'RANGE', value: '3:44'
  }],
  venueSwitches: [{
    id: 'c6ebc5ab30ea4b589ad2adecc85a954e',
    switches: ['c0:c5:20:aa:32:79', '58:fb:96:0e:82:8a'],
    venueId: 'a98653366d2240b9ae370e48fab3a9a1'
  }, {
    id: '721755be58084157a10a55e0a15007fe',
    switches: ['58:fb:96:0e:bc:f8'],
    venueId: '9417693931ab409ca41ecf9b36f516be'
  }]
}
