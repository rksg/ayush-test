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
}
