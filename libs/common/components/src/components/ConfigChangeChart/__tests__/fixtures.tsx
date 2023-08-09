export const sampleTypes = ['ap', 'apGroup', 'wlan', 'venue']
export const sampleChartBoundary = [1654423052112, 1657015052112] as [number, number]
export const sampleData = new Array((sampleChartBoundary[1]-sampleChartBoundary[0])/(12*60*60*1000))
  .fill(0).map((_,index)=>({
    id: index,
    timestamp: `${sampleChartBoundary[0] + 12 * 60 * 60 * 1000 * index}`,
    type: sampleTypes[index % 4],
    name: 'name',
    key: 'key',
    oldValues: [ 'oldValues' ],
    newValues: [ 'newValues' ]
  }))
