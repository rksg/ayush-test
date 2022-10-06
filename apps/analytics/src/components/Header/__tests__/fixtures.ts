
export const header1 = {
  path: [{ type: 'network', name: 'Network' }],
  queryResult: {
    network: {
      node: {
        apCount: 50, clientCount: 100, switchCount: null
      }
    }
  },
  name: 'Network',
  transformedResult: {
    name: undefined,
    subTitle: [
      { key: 'apCount', value: [50] },
      { key: 'clientCount', value: [100] }
    ]
  }
}

export const header2 = {
  path: [{ type: 'network', name: 'Network' }, { type: 'zone', name: 'Venue' }],
  queryResult: {
    network: {
      node: {
        apCount: 50, clientCount: 100
      }
    }
  },
  name: 'Venue',
  transformedResult: {
    name: undefined,
    subTitle: [
      { key: 'apCount', value: [50] },
      { key: 'clientCount', value: [100] }
    ]
  }
}

export const header3 = {
  path: [
    { type: 'network', name: 'Network' },
    { type: 'zone', name: 'Venue' },
    { type: 'apGroup', name: 'AP Group' }
  ],
  queryResult: {
    network: {
      node: {
        apCount: 50, clientCount: 100
      }
    }
  },
  name: 'AP Group',
  transformedResult: {
    name: undefined,
    subTitle: [
      { key: 'apCount', value: [50] },
      { key: 'clientCount', value: [100] }
    ]
  }
}

export const header4 = {
  path: [
    { type: 'network', name: 'Network' },
    { type: 'zone', name: 'Venue' },
    { type: 'apGroup', name: 'AP Group' },
    { type: 'AP', name: 'Access Point' }
  ],
  queryResult: {
    network: {
      node: {
        name: 'Access Point', clientCount: 100,
        model: ['r710'], version: ['Unknown', '1'], mac: 'AA', internalIp: ['ip1', 'ip2']
      }
    }
  },
  name: 'Access Point',
  transformedResult: {
    name: 'Access Point',
    subTitle: [
      { key: 'clientCount', value: [100] },
      { key: 'model', value: ['r710'] },
      { key: 'version', value: ['1', 'Unknown'] },
      { key: 'mac', value: ['AA'] },
      { key: 'internalIp', value: ['ip2', 'ip1'] }
    ]
  }
}

export const header5 = {
  path: [
    { type: 'network', name: 'Network' },
    { type: 'switchGroup', name: 'Switch Group' }
  ],
  queryResult: {
    network: {
      node: {
        switchCount: 100
      }
    }
  },
  name: 'Switch Group',
  transformedResult: {
    name: undefined,
    subTitle: [
      { key: 'switchCount', value: [100] }
    ]
  }
}

export const header6 = {
  path: [
    { type: 'network', name: 'Network' },
    { type: 'switchGroup', name: 'Switch Group' },
    { type: 'switch', name: 'Switch' }
  ],
  queryResult: {
    network: {
      node: {
        name: 'Switch', model: 'm',
        firmware: '123', portCount: 20
      }
    }
  },
  name: 'Switch',
  transformedResult: {
    name: 'Switch',
    subTitle: [
      { key: 'model', value: ['m'] },
      { key: 'firmware', value: ['123'] },
      { key: 'portCount', value: [20] }
    ]
  }
}
