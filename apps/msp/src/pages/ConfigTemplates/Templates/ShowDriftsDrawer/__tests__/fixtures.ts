export const mockedDriftData = [{
  category: 'apRadioSettings',
  driftItems: [{
    name: 'radioParams24G.method',
    values: ['CHANNELFLY', 'BACKGROUND_SCANNING']
  },
  {
    name: 'radioParams50G.scanInterval',
    values: [30, 40]
  },
  {
    name: 'config 1',
    values: ['', 'new config 1']
  },
  {
    name: 'config 2',
    values: ['old config 2', '']
  }]
},
{
  category: 'apBssColoringSettings',
  driftItems: [{
    name: 'bssColoringEnabled',
    values: [true, '']
  },
  {
    name: 'config 2',
    values: ['old config 2', '']
  }]
}]
