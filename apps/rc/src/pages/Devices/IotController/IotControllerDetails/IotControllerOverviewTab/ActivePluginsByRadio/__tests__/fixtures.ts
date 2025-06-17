const data = {
  requestId: '336c8ceb-5a0d-4774-9ab7-9ecc751bdc0f',
  apStatus: {
    onlineAp: 1,
    offlineAp: 1,
    totalAp: 2
  },
  pluginsByRadioStatus: {
    // eslint-disable-next-line max-len
    radioPlugins: [{ name: 'zigbee', count: 1, displayName: 'Zigbee' }, { name: 'vostio', count: 1, displayName: 'Vistio' }, { name: 'baas', count: 1, displayName: 'Beacon as a Service' }],
    totalRadioCount: 3
  }
}

const noData = {
  requestId: '336c8ceb-5a0d-4774-9ab7-9ecc751bdc0f',
  pluginsByRadioStatus: {}
}

export { data, noData }
