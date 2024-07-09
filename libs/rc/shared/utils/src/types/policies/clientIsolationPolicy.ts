import { TableChangePayload } from '../../useTableQuery'

export interface ClientIsolationClient {
  mac: string
  description?: string
  ipAddress?: string
}

export interface ClientIsolationSaveData {
  id?: string
  name: string
  description?: string
  allowlist: ClientIsolationClient[]
  tenantId?: string
  venueId?: string
}

export interface ClientIsolationListUsageByVenue {
  id: string
  name: string
  description: string
  clientCount: number
  clientMacs: string[]
  networkCount: number
  networkNames: string[]
}

export interface VenueUsageByClientIsolation {
  venueId: string
  venueName: string
  address: string
  networkCount: number
  networkNames: string[]
}

export interface ClientIsolationActivations {
  venueId: string
  wifiNetworkId: string
}

export interface ClientIsolationViewModel {
  id: string
  name: string
  description?: string
  clientEntries: string[]
  tenantId?: string
  venueIds?: string[]
  venueCount?: number
  activations?: ClientIsolationActivations[]
}

export interface ClientIsolationTableChangePayload extends TableChangePayload {
  id: string,
  searchVenueNameString: string
}