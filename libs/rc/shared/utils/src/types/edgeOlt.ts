import { EdgeNokiaOltStatusEnum, EdgeNokiaCageStateEnum } from '../models'

export interface EdgeNokiaOltData {
  id: string
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

export interface EdgeNokiaCageData {
  name: string
  state: EdgeNokiaCageStateEnum
}

export interface EdgeNokiaOnuData {
  name: string
  ports: number
  usedPorts: number
  portDetails: EdgeNokiaOnuPortData[]
}

export interface EdgeNokiaOnuPortData {
  status: EdgeNokiaCageStateEnum
  vlan: string[]
}