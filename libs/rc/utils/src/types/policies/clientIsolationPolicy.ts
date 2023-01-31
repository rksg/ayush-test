export interface ClientIsolationClient {
  mac: string
  description?: string
}

export interface ClientIsolationSaveData {
  id?: string
  name: string
  description?: string
  allowlist: ClientIsolationClient[]
  tenantId?: string
  venueId?: string
}
