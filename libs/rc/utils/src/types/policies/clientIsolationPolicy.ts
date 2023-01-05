export interface ClientIsolationAllowList {
  mac: string
  description?: string
  ipAddress?: string
}

export interface ClientIsolationSaveData {
  name: string
  description?: string
  allowlist: ClientIsolationAllowList[]
}
