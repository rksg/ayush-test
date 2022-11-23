import { OauthAppConfig }       from './OauthAppConfig'
import { SocialIdentitySource } from './SocialIdentitySource'

export class SocialIdentity {
  source: SocialIdentitySource

  config?: OauthAppConfig

  constructor () {
    this.source = SocialIdentitySource.RUCKUS

    this.config = new OauthAppConfig()
  }
}
