export const configChanges = [
  {
    timestamp: '1685427082200',
    type: 'ap',
    name: '94:B3:4F:3D:21:80',
    key: 'initialState.ccmAp.radio24g.radio.channel_select_mode',
    oldValues: [],
    newValues: [ 'BACKGROUND_SCANNING' ]
  },
  {
    timestamp: '1685427082300',
    type: 'ap',
    name: '94:B3:4F:3D:21:80',
    key: 'initialState.ccmAp.radio24g.radio.channel_width',
    oldValues: [],
    newValues: [ '_AUTO']
  },
  {
    timestamp: '1685427082400',
    type: 'wlan',
    name: '!!R770_url_sanity',
    key: 'initialState.CcmWlan.firewall.firewall_url_filtering_policy.enabled',
    oldValues: [ 'false' ],
    newValues: [ 'true' ]
  },
  {
    timestamp: '1685427082500',
    type: 'wlan',
    name: 'ER-12560_1',
    key: 'initialState.CcmWlan.bss_min_rate',
    oldValues: [ '__12_MBPS' ],
    newValues: [ '__DEFAULT' ]
  },
  {
    timestamp: '1685427082600',
    type: 'zone',
    name: '23A-IND-BNG-D23-Home',
    key: 'initialState.ccmZone.radio24g.radio.bg_scan',
    oldValues: [ 'Disabled' ],
    newValues: [ 'Enabled' ]
  },
  {
    timestamp: '1685427082700',
    type: 'zone',
    name: '23A-IND-BNG-D23-Home',
    key: 'initialState.ccmZone.radio5g.indoor_channel_range',
    oldValues: [ '149', '153', '157', '161', '36', '40', '44', '48' ],
    newValues: [ '100', '104', '108', '112', '116', '120', '124', '128', '132' ]
  },
  {
    timestamp: '1685427082800',
    type: 'zone',
    name: 'someTest',
    key: 'unknown',
    oldValues: [],
    newValues: []
  },
  {
    timestamp: '1685427082900',
    type: 'ap',
    name: '94:B3:4F:3D:21:80',
    key: 'initialState.ccmAp.radio24g.radio.channel_fly_mtbc',
    oldValues: [],
    newValues: ['480']
  }
]

export const kpiForOverview = {
  before: {
    connectionSuccess: 0.7476334721696327,
    timeToConnect: 895.2461538461538,
    clientThroughPut: 232617.69735006973,
    apCapacity: 10,
    apUpTime: null,
    onlineAPCount: 7
  },
  after: {
    connectionSuccess: 0.692,
    timeToConnect: 26,
    clientThroughPut: null,
    apCapacity: null,
    apUpTime: null,
    onlineAPCount: 3
  }
}

export const kpiForConnection = {
  before: {
    connectionSuccess: 0.8967232724792898,
    timeToConnect: 361.66936881434174,
    authSuccess: 0.9499331678441856,
    assocSuccess: 0.9495626636021196,
    eapSuccess: 0.6560913705583756,
    radiusSuccess: 0.9070945945945946,
    dhcpSuccess: 0.958317018474353,
    roamingSuccess: 0.9695340501792115
  },
  after: {
    connectionSuccess: 0.8975586404978458,
    timeToConnect: 710.3667716847025,
    authSuccess: 0.9791666666666666,
    assocSuccess: 0.9292929292929293,
    eapSuccess: 0.5979899497487438,
    radiusSuccess: 0.8103448275862069,
    dhcpSuccess: 0.9967373572593801,
    roamingSuccess: 0.9637681159420289
  }
}