import { RadiusServer } from './RadiusServer'

export class Radius {
  primary: RadiusServer

  secondary?: RadiusServer

  id?: string

  constructor () {
    this.primary = new RadiusServer()

    this.secondary = new RadiusServer()
  }
}
