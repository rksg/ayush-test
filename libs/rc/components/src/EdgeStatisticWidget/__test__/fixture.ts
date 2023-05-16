export const EdgeTopTrafficWidgetEmptyMockData = {
  traffic: []
}
export const EdgeTrafficByVolumeWidgetEmptyMockData = {
  timeSeries: {
    ports: []
  },
  time: []
}
export const EdgeResourceUtilizationWidgetEmptyMockData = {
  timeSeries: {
    cpu: [],
    memory: [],
    disk: [],
    memoryUsedBytes: [],
    diskUsedBytes: [],
    time: []
  }
}
export const EdgeUpTimeWidgetEmptyMockData = {
  timeSeries: {
    isEdgeUp: [],
    time: []
  },
  totalDowntime: 0,
  totalUptime: 0
}
export const EdgeTopTrafficWidgetMockData = {
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
    ],
    time: (() => {
      return Array.from({ length: 5 }, (_, i) => {
        const time = new Date(new Date().getTime() - (i * 15000))
        return time.toISOString()
      })
    })()
  },
  portCount: 3
}
export const EdgeResourceUtilizationWidgetMockData = {
  timeSeries: {
    cpu: [10, 15, 9, 10, 11],       // percentage
    memory: [30, 50, 70, 60, 50],   // percentage
    disk: [10, 10, 11, 11, 11],     // percentage
    memoryUsedBytes: [
      7923642793,1481053204,4814215231,7608329788,5000121746
    ],// bytes
    diskUsedBytes: [
      9132907460,4236789123,7982453611,6348290142,2910357865
    ],// bytes
    time: (() => {
      return Array.from({ length: 5 }, (_, i) => {
        const time = new Date(new Date().getTime() - (i * 15000))
        return time.toISOString()
      })
    })()
  }
}
export const EdgeUpTimeWidgetMockData = {
  timeSeries: {
    isEdgeUp: [0, 1, 0, 0], // 0 is down; 1 is up
    time: (() => {
      return Array.from({ length: 4 }, (_, i) => {
        const time = new Date(new Date().getTime() - (i * 15000))
        return time.toISOString()
      })
    })()
  },
  totalDowntime: 15 * 60, // seconds
  totalUptime: 15 * 4 * 60
}