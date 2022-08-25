export class RadiusServer {
  ip: string

  port: number

  sharedSecret?: string

  constructor () {
    this.ip = ''

    this.port = 0
  }
}
