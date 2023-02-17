export class StaticRoute {
  id: string
  destinationIp: string
  nextHop: string
  adminDistance: number

  constructor () {
    this.id = ''
    this.destinationIp = ''
    this.nextHop = ''
    this.adminDistance = 0
  }
}