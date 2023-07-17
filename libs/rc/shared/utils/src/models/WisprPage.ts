import { AuthRadiusEnum } from './AuthRadiusEnum'
import { Radius }         from './Radius'

export class WisprPage {
  captivePortalUrl: string

  integrationKey?: string

  externalProviderName?: string

  externalProviderRegion?: string

  customExternalProvider?: boolean

  authRadius?: Radius

  accountingRadius?: Radius

  providerName?: string

  encryptMacIpEnabled?: boolean

  authType?: AuthRadiusEnum

  constructor () {
    this.captivePortalUrl = ''

    this.customExternalProvider = false

    this.authRadius = new Radius()

    this.accountingRadius = new Radius()

    this.authType = AuthRadiusEnum.RADIUS
  }
}
