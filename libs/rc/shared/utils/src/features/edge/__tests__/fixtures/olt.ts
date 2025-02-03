export const mockOlt = {
  name: 'TestOlt',
  serialNumber: 'testSerialNumber',
  status: 'online',
  vendor: 'Nokia',
  model: 'MF-2',
  firmware: '22.649',
  ip: '134.242.136.112'
}

export const mockOltList = [
  mockOlt
]

export const mockOltCageList = [
  {
    name: 'S1/1',
    state: 'down'
  },
  {
    name: 'S1/2',
    state: 'up'
  },
  {
    name: 'S1/3',
    state: 'down'
  },
  {
    name: 'S1/4',
    state: 'down'
  },
  {
    name: 'S1/5',
    state: 'down'
  },
  {
    name: 'S1/6',
    state: 'down'
  },
  {
    name: 'S1/7',
    state: 'down'
  },
  {
    name: 'S1/8',
    state: 'down'
  },
  {
    name: 'S1/9',
    state: 'down'
  },
  {
    name: 'S1/10',
    state: 'down'
  },
  {
    name: 'S1/11',
    state: 'down'
  },
  {
    name: 'S1/12',
    state: 'up'
  },
  {
    name: 'S1/13',
    state: 'down'
  },
  {
    name: 'S1/14',
    state: 'down'
  },
  {
    name: 'S1/15',
    state: 'down'
  },
  {
    name: 'S1/16',
    state: 'down'
  }
]

export const mockOnuList = [
  {
    name: 'ont_9',
    ports: 1,
    usedPorts: 1,
    portDetails: [
      {
        status: 'up',
        vlan: ['30']
      }
    ]
  }
]