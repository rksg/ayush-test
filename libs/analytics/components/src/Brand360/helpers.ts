import { groupBy, mean } from 'lodash'

import { Response } from './services'

type SLARecord = [ number, number ]
export interface Common {
  lsp: string
  p1Incidents: number
  guestExp: number
  ssidCompliance: number
  deviceCount: number
  avgConnSuccess: number,
  avgTTC: number,
  avgClientThroughput: number
}
export interface Property extends Common {
  property: string
}
export interface Lsp extends Common {
  propertyCount: number
}

const calcSLA = (sla: SLARecord) => sla[0] / sla[1]

const calGuestExp = (cS: number, ttc: number, cT: number) => mean([ cS, ttc, cT ])
export const transformToLspView = (properties: Response[]): Lsp[] => {
  const lsps = groupBy(properties, p => p.lsp)
  return Object.entries(lsps).map(([ lsp, properties ]) => {
    const {
      connSuccess,
      ttc,
      clientThroughput,
      p1Incidents,
      ssidCompliance,
      deviceCount
    } = properties.reduce((acc, cur) => ({
      connSuccess: [
        acc.connSuccess[0] + cur.avgConnSuccess[0],
        acc.connSuccess[1] + cur.avgConnSuccess[1]
      ],
      ttc: [
        acc.ttc[0] + cur.avgTTC[0],
        acc.ttc[1] + cur.avgTTC[1]
      ],
      clientThroughput: [
        acc.clientThroughput[0] + cur.avgClientThroughput[0],
        acc.clientThroughput[1] + cur.avgClientThroughput[1]
      ],
      p1Incidents: acc.p1Incidents + cur.p1Incidents,
      ssidCompliance: [
        acc.ssidCompliance[0] + cur.ssidCompliance[0],
        acc.ssidCompliance[1] + cur.ssidCompliance[1]
      ],
      deviceCount: acc.deviceCount + cur.deviceCount
    }), {
      connSuccess: [0,0],
      ttc: [0,0],
      clientThroughput: [0,0],
      p1Incidents: 0,
      ssidCompliance: [0,0],
      deviceCount: 0
    })
    const avgConnSuccess = calcSLA(connSuccess as SLARecord)
    const avgTTC = calcSLA(ttc as SLARecord)
    const avgClientThroughput = calcSLA(clientThroughput as SLARecord)
    return {
      lsp,
      propertyCount: properties.length,
      avgConnSuccess,
      avgTTC,
      avgClientThroughput,
      p1Incidents,
      ssidCompliance: calcSLA(ssidCompliance as SLARecord),
      deviceCount,
      guestExp: calGuestExp(avgConnSuccess, avgTTC, avgClientThroughput)
    }
  })
}
export const transformToPropertyView = (data: Response[]): Property[] =>
  data.map((property: Response) => {
    const avgConnSuccess = calcSLA(property.avgConnSuccess),
      avgClientThroughput = calcSLA(property.avgClientThroughput),
      avgTTC = calcSLA(property.avgTTC),
      ssidCompliance = calcSLA(property.ssidCompliance)
    return {
      ...property,
      ssidCompliance,
      avgConnSuccess,
      avgClientThroughput,
      avgTTC,
      guestExp: calGuestExp(avgConnSuccess, avgClientThroughput, avgTTC)
    } as Property
  })
