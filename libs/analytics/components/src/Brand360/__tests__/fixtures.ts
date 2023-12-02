import { sample } from 'lodash'
export const fetchBrandProperties = (sliceType: string) => {
  const properties = [
    'AC Hotels', 'Courtyard', 'Fairfield', 'Element' , 'Potea Hotels',
    'Four Seasons', 'Hayatt', 'Shereton', 'J W Marriott' , 'Raddison'
  ]
  const lsps = ['Art-integrator', 'B-Network', 'NetOps', 'Single Digit']
  const pcts = [ .54, .73, .64, .5, .6, .78, .88, .92, .75, .84 ]
  const nums = [ 10, 20, 33, 56, 64, 87, 94, 24, 89, 99 ]
  return sliceType === 'lsp'
    ? lsps.map(lsp => {
      const [
        avgConnSuccess = 0,
        avgTTC = 0,
        avgClientThroughput = 0
      ] = [ sample(pcts), sample(pcts), sample(pcts) ]
      return {
        propertyCount: Math.ceil(Math.random() * 10 / properties.length),
        lsp,
        p1Incidents: sample(nums) || 0,
        guestExp: (avgConnSuccess + avgTTC + avgClientThroughput) / 3,
        ssidComplaince: sample(pcts) || 0,
        deviceCount: sample(nums) || 0,
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