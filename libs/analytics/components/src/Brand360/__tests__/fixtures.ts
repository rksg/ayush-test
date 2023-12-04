import { sample, groupBy } from 'lodash'
export const fetchBrandProperties = () => {
  const properties = [
    'AC Hotels', 'Courtyard', 'Fairfield', 'Element' , 'Potea Hotels',
    'Four Seasons', 'Hyatt', 'Sheraton', 'J W Marriott' , 'Ramada',
    'Ritz-Carlton', 'Le Meridien', 'Accor', 'Best Western' , 'Holiday Inn',
    'Hilton', 'IHG Hotels & Resorts', 'St Regis Hotels', 'Wyndham Hotels & Resorts',
    'Shangri-La Hotels and Resorts', 'Ibis'
  ]
  const lsps = [
    'Single Digit', 'DeepBlue', 'Delion',
    'Cloud5', 'Hotel Internet Services'
  ]
  const pcts = [ .54, .73, .64, .5, .6, .78, .88, .92, .75, .84 ]
  const nums = [ 3, 5, 6, 10, 20, 33, 56, 64, 87, 94, 24, 89, 99 ]
  return properties.map(property => {
    const [
      avgConnSuccess = 0,
      avgTTC = 0,
      avgClientThroughput = 0
    ] = [ sample(pcts), sample(pcts), sample(pcts) ]
    return {
      property,
      lsp: sample(lsps),
      p1Incidents: sample(nums) || 0,
      guestExp: (avgConnSuccess + avgTTC + avgClientThroughput) / 3,
      ssidComplaince: sample(pcts) || 0,
      deviceCount: sample(nums) || 0,
      avgConnSuccess,
      avgTTC,
      avgClientThroughput
    }
  })
}
export const transformToLspView = (properties: ReturnType<typeof fetchBrandProperties>) => {
  const lsps = groupBy(properties, p => p.lsp)
  return Object.entries(lsps).map(([ lsp, properties ]) => {
    const {
      connSuccess,
      ttc,
      clientThroughput,
      p1Incidents,
      ssidComplaince,
      deviceCount
    } = properties.reduce((acc, cur) => ({
      connSuccess: acc.connSuccess + cur.avgConnSuccess,
      ttc: acc.ttc + cur.avgTTC,
      clientThroughput: acc.clientThroughput + cur.avgClientThroughput,
      p1Incidents: acc.p1Incidents + cur.p1Incidents,
      ssidComplaince: acc.ssidComplaince + cur.ssidComplaince,
      deviceCount: acc.deviceCount + cur.deviceCount
    }), {
      connSuccess: 0,
      ttc: 0,
      clientThroughput: 0,
      p1Incidents: 0,
      ssidComplaince: 0,
      deviceCount: 0
    })
    const avgConnSuccess = connSuccess/properties.length
    const avgTTC = ttc/properties.length
    const avgClientThroughput = clientThroughput/properties.length
    return {
      lsp,
      propertyCount: properties.length,
      avgConnSuccess,
      avgTTC,
      avgClientThroughput,
      p1Incidents,
      ssidComplaince: ssidComplaince/properties.length,
      deviceCount,
      guestExp: (avgConnSuccess + avgTTC + avgClientThroughput) / 3
    }
  })
}