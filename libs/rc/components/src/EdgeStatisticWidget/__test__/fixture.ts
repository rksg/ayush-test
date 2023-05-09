export const EdgePortsByTrafficWidgetMockData = {
  traffic: [100000, 120000, 500000]   // bytes
}


export const EdgeTrafficByVolumeWidgetMockData = {
  timeSeries: {
    ports: [
      {
        tx: [null,4059176,4061913,5257556,4143238],
        rx: [null,3194968,3280669,99728159,3543347],
        total: [null,7254144,7342582,104985715,7686585]
      },
      {
        tx: [null,142710,142660,330828,1326396],
        rx: [null,627544,642547,651846,664185],
        total: [null,770254,785207,982674,1990581]
      },
      {
        tx: [null,360,360,300,360],
        rx: [null,155374,155547,154962,155007],
        total: [null,155734,155907,155262,155367]
      }
    ]
  },
  time: [
    '2023-04-26T06:00:00.000Z',
    '2023-04-26T07:00:00.000Z',
    '2023-04-26T08:00:00.000Z',
    '2023-04-26T09:00:00.000Z',
    '2023-04-26T10:00:00.000Z'
  ]
}
export const EdgeResourceUtilizationWidgetMockData = {
  timeSeries: {
    cpu: [10, 15, 9, 10, 11],  // percentage
    memory: [30, 50, 70, 60, 50],   // percentage
    disk: [10, 10, 11, 11, 11],   // percentage
    time: [
      '2023-04-26T06:00:00.000',
      '2023-04-26T07:00:00.000',
      '2023-04-26T08:00:00.000',
      '2023-04-26T09:00:00.000',
      '2023-04-26T10:00:00.000']
  }
}
export const EdgeUpTimeWidgetMockData = {
  timeSeries: {
    isEdgeUp: [0, 1, 0, 0], // 0 is down; 1 is up
    time: [
      '2023-05-08T16:30:00.000Z',
      '2023-05-08T16:45:00.000Z',
      '2023-05-08T17:00:00.000Z',
      '2023-05-08T17:15:00.000Z'
    ]
  },
  totalDowntime: 15 * 60, // seconds
  totalUptime: 15 * 4 * 60
}