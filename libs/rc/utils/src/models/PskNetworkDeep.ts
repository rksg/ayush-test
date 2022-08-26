import { NetworkVenue } from './NetworkVenue'
import { PskWlan }      from './PskWlan'
import { Radius }       from './Radius'
 
export class PskNetworkDeep {
  wlan: PskWlan
 
  authRadius?: Radius
 
  accountingRadius?: Radius
 
  tenantId?: string
 
  venues?: NetworkVenue[]
 
  name: string
 
  description?: string
 
  id?: string
 
  constructor () {

    this.wlan = new PskWlan()

    this.authRadius = new Radius()

    this.accountingRadius = new Radius()

    this.venues = []

    this.name = ''
  }
}