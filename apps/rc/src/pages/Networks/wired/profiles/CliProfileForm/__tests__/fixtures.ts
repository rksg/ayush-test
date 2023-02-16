export const venues = [{
  id: 'a98653366d2240b9ae370e48fab3a9a1',
  name: 'My-Venue',
  city: 'New York',
  country: 'United States',
  switches: 5
}, {
  id: 'ca211ea6e80b456d891556690ae9db1c',
  name: 'test-cli',
  city: 'Sunnyvale, California',
  country: 'United States'
}, {
  id: '9f8392862b794b78b9a060d7bcfa87fc',
  name: 'test1',
  city: 'Sunnyvale, California',
  country: 'United States'
}, {
  id: '1cecae1a7fcb4e6384a64e04da856b67',
  name: 'test2',
  city: 'Sunnyvale, California',
  country: 'United States'
}]

export const profiles = [{
  id: 'c562c3868bab4d43a64840367ea74c72',
  name: 'test',
  profileType: 'CLI',
  venueCliTemplate: {
    cli: 'manager registrarasasasbb',
    id: '4a8cae7905f1466db8e59ab90c3956c8',
    name: 'test',
    overwrite: true,
    switchModels: 'ICX7150-24,ICX7150-24P,ICX7150-48'
  },
  venues: ['test-cli']
}, {
  id: '23450a243ea1441ba19d0e509b99bdad',
  name: 'test2',
  profileType: 'CLI',
  venueCliTemplate: {
    cli: 'manager registrar\nvhgfgh',
    id: '4d14bb0dc9ea4310ab7d2c9ad7f2a61c',
    name: 'test2',
    overwrite: false,
    switchModels: 'ICX7150-24'
  },
  venues: ['My-Venue']
}, {
  id: '4ba539d292044b1a8108cf00181f11cc',
  name: '11',
  profileType: 'Regular',
  vlans: [{
    arpInspection: false,
    id: 'bb6ed6763e9241999cfdf07c6bbf57d3',
    igmpSnooping: 'none',
    ipv4DhcpSnooping: false,
    multicastVersion: 2,
    spanningTreePriority: 32768,
    spanningTreeProtocol: 'stp',
    vlanId: 111
  }]
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

export const familyModels = [{
  familyModels: [{
    family: 'ICX7550',
    models: [{ model: 'ICX7550-24P', checked: true }]
  }],
  venueId: 'a98653366d2240b9ae370e48fab3a9a1',
  venueName: 'My-Venue'
}, {
  familyModels: [{
    family: 'ICX7150',
    models: [
      { model: 'ICX7150-24', checked: true },
      { model: 'ICX7150-24P', checked: true },
      { model: 'ICX7150-48', checked: true }
    ]
  }],
  venueId: 'ca211ea6e80b456d891556690ae9db1c',
  venueName: 'test-cli'
}]

export const cliProfile = {
  id: '4515bc6524544cc79303cc6a6443f6c4',
  name: 'testccc',
  profileType: 'CLI',
  venueCliTemplate: {
    cli: 'manager registrargghgh cccc vvvv',
    id: '2fb5c70b3998474a937805c3039c1982',
    name: 'testccc',
    overwrite: true,
    switchModels: 'ICX7150-48,ICX7150-24F,ICX7550-24P',
    variables: [{ name: 'test', type: 'RANGE', value: '3:4' }]
  },
  venues: ['a98653366d2240b9ae370e48fab3a9a1']
}