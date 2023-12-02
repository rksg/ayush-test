import { sample } from 'lodash'
export const fetchBrandProperties = (sliceType: string) => {
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
  const pCnt = [ 3, 4, 5, 2, 7 ]
  return sliceType === 'lsp'
    ? lsps.map(lsp => {
      const [
        avgConnSuccess = 0,
        avgTTC = 0,
        avgClientThroughput = 0
      ] = [ sample(pcts), sample(pcts), sample(pcts) ]
      const propertyCount = sample(pCnt) || 0
      return {
        propertyCount,
        lsp,
        p1Incidents: sample(nums) || 0,
        guestExp: (avgConnSuccess + avgTTC + avgClientThroughput) / 3,
        ssidComplaince: sample(pcts) || 0,
        deviceCount: (sample(nums) || 0) * propertyCount,
        avgConnSuccess,
        avgTTC,
        avgClientThroughput
      }
    })
    : properties.map(property => {
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