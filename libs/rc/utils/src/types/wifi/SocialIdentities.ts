import { SocialIdentity } from './SocialIdentity'

export class SocialIdentities {
  google?: SocialIdentity

  facebook?: SocialIdentity

  linkedin?: SocialIdentity

  twitter?: SocialIdentity

  constructor () {
    this.google = new SocialIdentity()

    this.facebook = new SocialIdentity()

    this.linkedin = new SocialIdentity()

    this.twitter = new SocialIdentity()
  }
}
