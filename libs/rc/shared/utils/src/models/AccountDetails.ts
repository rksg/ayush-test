export class AccountDetails {
  organization: string
  address: string
  city: string
  stateOrProvince: string
  zip: string
  country: string

  constructor () {
    this.organization = ''
    this.address = ''
    this.city = ''
    this.stateOrProvince = ''
    this.zip = ''
    this.country = ''
  }
}