import { Radius } from './Radius'

export class WisprPage {
  captivePortalUrl: string

  integrationKey?: string

  externalProviderName?: string

  externalProviderRegion?: string

  customExternalProvider?: boolean

  authRadius?: Radius

  accountingRadius?: Radius

  constructor () {
    this.captivePortalUrl = ''

    this.customExternalProvider = false

    this.authRadius = new Radius()

    this.accountingRadius = new Radius()
  }
}
