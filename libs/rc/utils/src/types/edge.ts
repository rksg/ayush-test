export interface EdgeViewModel {
  name: string
  status: string
  type: string
  model: string
  serialNumber: string
  ip: string
  ports: string
  venue: {
    name: string
    id: string
  }
  tags: string[]
}