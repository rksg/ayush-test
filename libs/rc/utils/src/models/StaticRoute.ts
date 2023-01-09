export class StaticRoute {
  id: string
  destinationIp: string
  nextHop: string
  adminDistance: string

  constructor () {
    this.id = ''
    this.destinationIp = ''
    this.nextHop = ''
    this.adminDistance = ''
  }
}