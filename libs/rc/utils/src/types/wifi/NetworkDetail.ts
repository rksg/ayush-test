import { NetworkVenue } from '../network'

export class NetworkDetail {
  name?: string
  description?: string
  venues?: NetworkVenue | null
  type?: string
  tenandId?: string
}