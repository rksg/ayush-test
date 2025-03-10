import { EdgeNokiaOltStatusEnum, EdgeNokiaCageStateEnum } from '../models'

export interface EdgeNokiaOltData {
  name: string
  status: EdgeNokiaOltStatusEnum
  vendor: string
  model: string
  serialNumber: string
  firmware: string
  ip: string

  venueId: string
  venueName: string
  edgeClusterId: string
  edgeClusterName: string
}
export interface EdgeNokiaOltCreateFormData {
  ip: string
  name: string
  venueId: string
  edgeClusterId: string
}

export interface EdgeNokiaOltCreatePayload {
  ip: string
  name: string
}

export interface EdgeNokiaCageData {
  cage: string
  state: EdgeNokiaCageStateEnum
}

export interface EdgeNokiaOnuData {
  name: string
  poeClass: string
  ports: number
  usedPorts: number
  portDetails: EdgeNokiaOnuPortData[]
}

export interface EdgeNokiaOnuPortData {
  portIdx: string
  status: EdgeNokiaCageStateEnum
  vlan: string[]
  poePower: number
}