import { sample } from 'lodash'
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
  const pcts = [
    [54, 100], [73, 100], [64, 100], [5, 10],[6, 10],
    [78, 100], [88, 100], [92, 100], [3, 4], [84, 100 ]
  ]
  const nums = [ 3, 5, 6, 10, 20, 33, 56, 64, 87, 94, 24, 89, 99 ]
  return properties.map(property => {
    const [
      avgConnSuccess = [0, 0],
      avgTTC = [0, 0],
      avgClientThroughput = [0, 0]
    ] = [ sample(pcts), sample(pcts), sample(pcts) ]
    return {
      property,
      lsp: sample(lsps), // TODO fetch from RC api and merge
      p1Incidents: sample(nums) || 0,
      ssidCompliance: sample(pcts) || [0, 0],
      deviceCount: sample(nums) || 0,
      avgConnSuccess,
      avgTTC,
      avgClientThroughput
    }
  })
}

export const mockBrandTimeseries = {
  data: {
    franchisorTimeseries: {
      time: [
        '2023-12-11T22:00:00.000Z',
        '2023-12-11T23:00:00.000Z',
        '2023-12-12T00:00:00.000Z',
        '2023-12-12T01:00:00.000Z',
        '2023-12-12T02:00:00.000Z',
        '2023-12-12T03:00:00.000Z',
        '2023-12-12T04:00:00.000Z',
        '2023-12-12T05:00:00.000Z',
        '2023-12-12T06:00:00.000Z'
      ],
      p1Incidents: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      ssidComplianceSLA: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      timeToConnectSLA: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      clientThroughputSLA: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      connectionSuccessSLA: [
        0,
        0,
        0,
        0,
        0,
        0.5,
        0.5454545454545454,
        0.7,
        0
      ],
      errors: []
    }
  }
}
